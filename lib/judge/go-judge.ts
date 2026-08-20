// The go-judge backend — a sandbox we run ourselves (criyle/go-judge).
//
// Unlike Judge0, go-judge does not know about languages, expected output or
// verdicts. It runs one command under limits and reports what happened. So
// everything a judge actually does lives here:
//
//   compile once  ->  run per test  ->  compare output  ->  decide a verdict
//
// Compiling once and reusing the cached binary is also why this is quicker
// than Judge0 on a multi-test problem: Judge0 recompiles for every test.

import type { Verdict } from "@/types/database";
import { DEFAULT_LANGUAGE, type LanguageId } from "@/lib/languages";

import {
  JudgeRateLimitError,
  JudgeUnavailableError,
  normaliseOutput,
  type GradeArgs,
  type JudgeBackend,
  type JudgeResult,
  type RunArgs,
  type RunResult,
} from "./types";

const URL_BASE = (process.env.GO_JUDGE_URL ?? "http://127.0.0.1:5050").replace(
  /\/+$/,
  "",
);
const TOKEN = process.env.GO_JUDGE_TOKEN ?? "";

/** Runaway output is a bug, not an answer — but leave room for real ones. */
const STDOUT_MAX = 256 * 1024;
const STDERR_MAX = 16 * 1024;
const COMPILE_TIME_MS = 15_000;
const COMPILE_MEMORY_KB = 512 * 1024;

const MS = 1_000_000; // nanoseconds per millisecond

interface Cmd {
  args: string[];
  env: string[];
  files: ({ content: string } | { name: string; max: number })[];
  cpuLimit: number;
  clockLimit: number;
  memoryLimit: number;
  stackLimit: number;
  procLimit: number;
  copyIn: Record<string, { content?: string; fileId?: string }>;
  copyOut: string[];
  copyOutCached?: string[];
}

interface BoxResult {
  status: string;
  error?: string;
  exitStatus: number;
  time: number; // ns of CPU
  runTime: number; // ns of wall clock
  memory: number; // bytes
  files?: Record<string, string>;
  fileIds?: Record<string, string>;
}

/**
 * How each language is built and run inside the box.
 *
 * `binary` is the name the compiled file is copied back in under. go-judge
 * resolves a bare name against the sandbox working directory, which is what
 * its own documentation does.
 */
interface Exec {
  source: string;
  env: string[];
  compile?: { args: string[]; binary: string };
  run: string[];
}

const EXEC: Record<LanguageId, Exec> = {
  cpp: {
    source: "main.cpp",
    env: ["PATH=/usr/bin:/bin", "LANG=C.UTF-8"],
    compile: {
      args: ["/usr/bin/g++", "-O2", "-std=c++17", "-w", "-o", "main", "main.cpp"],
      binary: "main",
    },
    run: ["main"],
  },
  python: {
    source: "main.py",
    env: [
      "PATH=/usr/bin:/bin",
      "LANG=C.UTF-8",
      "PYTHONIOENCODING=utf-8",
      "PYTHONUNBUFFERED=1",
      "HOME=/tmp",
    ],
    run: ["/usr/bin/python3", "main.py"],
  },
};

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (TOKEN) h.Authorization = "Bearer " + TOKEN;
  return h;
}

async function post(cmd: Cmd): Promise<BoxResult> {
  let res: Response;
  try {
    res = await fetch(URL_BASE + "/run", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ cmd: [cmd] }),
      cache: "no-store",
    });
  } catch (e) {
    const why = e instanceof Error ? e.message : "network error";
    throw new JudgeUnavailableError(
      "go-judge unreachable at " + URL_BASE + ": " + why,
    );
  }

  if (res.status === 429) throw new JudgeRateLimitError();
  if (res.status === 401 || res.status === 403) {
    throw new JudgeUnavailableError("go-judge rejected the auth token");
  }
  if (res.status >= 500) {
    throw new JudgeUnavailableError("go-judge returned " + res.status);
  }
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    throw new Error("go-judge " + res.status + ": " + body);
  }

  const body = (await res.json()) as BoxResult[];
  if (!Array.isArray(body) || body.length === 0) {
    throw new JudgeUnavailableError("go-judge returned an empty result");
  }
  return body[0];
}

/** Cached compiler output has to be released, or the box slowly fills up. */
async function releaseFile(fileId: string): Promise<void> {
  try {
    await fetch(URL_BASE + "/file/" + fileId, {
      method: "DELETE",
      headers: headers(),
    });
  } catch {
    // A leaked temp file is not worth failing a student's submission over.
  }
}

function box(opts: {
  args: string[];
  env: string[];
  stdin: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  copyIn: Record<string, { content?: string; fileId?: string }>;
  copyOutCached?: string[];
}): Cmd {
  const cmd: Cmd = {
    args: opts.args,
    env: opts.env,
    files: [
      { content: opts.stdin },
      { name: "stdout", max: STDOUT_MAX },
      { name: "stderr", max: STDERR_MAX },
    ],
    cpuLimit: opts.timeLimitMs * MS,
    // Wall clock gets extra room: a program that sleeps or blocks on input
    // should still be stopped, without calling it slow when the box is busy.
    clockLimit: opts.timeLimitMs * 2 * MS,
    memoryLimit: opts.memoryLimitKb * 1024,
    stackLimit: opts.memoryLimitKb * 1024,
    procLimit: 64,
    copyIn: opts.copyIn,
    copyOut: ["stdout", "stderr"],
  };
  if (opts.copyOutCached) cmd.copyOutCached = opts.copyOutCached;
  return cmd;
}

/** go-judge says how a process ended; this says what that means for a student. */
function statusToVerdict(status: string): Verdict {
  switch (status) {
    case "Accepted":
      return "accepted";
    case "Time Limit Exceeded":
      return "time_limit_exceeded";
    case "Memory Limit Exceeded":
      return "memory_limit_exceeded";
    case "Output Limit Exceeded":
    case "Nonzero Exit Status":
    case "Signalled":
      return "runtime_error";
    default:
      return "internal_error";
  }
}

/** Judge0-compatible ids, so the playground renders the same either way. */
function verdictToStatusId(v: Verdict): number {
  switch (v) {
    case "accepted":
      return 3;
    case "wrong_answer":
      return 4;
    case "time_limit_exceeded":
      return 5;
    case "compile_error":
      return 6;
    case "memory_limit_exceeded":
      return 7;
    case "runtime_error":
      return 11;
    default:
      return 13;
  }
}

function describe(v: Verdict, status: string): string {
  switch (v) {
    case "accepted":
      return "Accepted";
    case "time_limit_exceeded":
      return "Time Limit Exceeded";
    case "memory_limit_exceeded":
      return "Memory Limit Exceeded";
    case "compile_error":
      return "Compilation Error";
    case "runtime_error":
      return status === "Output Limit Exceeded"
        ? "Output Limit Exceeded"
        : "Runtime Error (" + status + ")";
    default:
      return status || "Internal Error";
  }
}

const outOf = (r: BoxResult, name: string) => r.files?.[name] ?? "";
const msOf = (r: BoxResult) => Math.round((r.time ?? 0) / MS);
const kbOf = (r: BoxResult) => Math.round((r.memory ?? 0) / 1024);

interface Built {
  /** Set for compiled languages; must be released when finished with. */
  fileId: string | null;
  /** Set when compilation failed — there is nothing to run. */
  error: { output: string; result: BoxResult } | null;
}

async function build(source: string, exec: Exec): Promise<Built> {
  if (!exec.compile) return { fileId: null, error: null };

  const r = await post(
    box({
      args: exec.compile.args,
      env: exec.env,
      stdin: "",
      timeLimitMs: COMPILE_TIME_MS,
      memoryLimitKb: COMPILE_MEMORY_KB,
      copyIn: { [exec.source]: { content: source } },
      copyOutCached: [exec.compile.binary],
    }),
  );

  const fileId = r.fileIds?.[exec.compile.binary] ?? null;
  if (r.status !== "Accepted" || r.exitStatus !== 0 || !fileId) {
    if (fileId) await releaseFile(fileId);
    const output =
      outOf(r, "stderr") ||
      outOf(r, "stdout") ||
      r.error ||
      (r.status === "Time Limit Exceeded"
        ? "The compiler took too long."
        : "Compilation failed.");
    return { fileId: null, error: { output, result: r } };
  }
  return { fileId, error: null };
}

/** One run against one input, of whatever `build` produced. */
function runOne(
  built: Built,
  exec: Exec,
  source: string,
  stdin: string,
  timeLimitMs: number,
  memoryLimitKb: number,
): Promise<BoxResult> {
  // A compiled language sends the cached binary; an interpreted one sends the
  // source with every run, because there is no artefact to cache.
  const copyIn =
    exec.compile && built.fileId
      ? { [exec.compile.binary]: { fileId: built.fileId } }
      : { [exec.source]: { content: source } };

  return post(
    box({ args: exec.run, env: exec.env, stdin, timeLimitMs, memoryLimitKb, copyIn }),
  );
}

async function grade({
  source,
  tests,
  timeLimitMs,
  memoryLimitKb,
  language = DEFAULT_LANGUAGE,
}: GradeArgs): Promise<JudgeResult> {
  const exec = EXEC[language];
  const raw: unknown[] = [];

  const built = await build(source, exec);
  if (built.error) {
    return {
      verdict: "compile_error",
      passed: 0,
      total: tests.length,
      failedAt: 0,
      runtime_ms: null,
      memory_kb: null,
      compile_output: built.error.output,
      stderr_output: null,
      raw: [built.error.result],
    };
  }

  let maxMs = 0;
  let maxKb = 0;
  try {
    for (let i = 0; i < tests.length; i++) {
      const t = tests[i];
      const r = await runOne(
        built,
        exec,
        source,
        t.stdin,
        timeLimitMs,
        memoryLimitKb,
      );

      raw.push(r);
      maxMs = Math.max(maxMs, msOf(r));
      maxKb = Math.max(maxKb, kbOf(r));

      let verdict = statusToVerdict(r.status);
      if (verdict === "accepted") {
        // go-judge only reports that the process finished cleanly. Whether the
        // answer is right is our job.
        const got = normaliseOutput(outOf(r, "stdout"));
        if (got !== normaliseOutput(t.expected_stdout)) verdict = "wrong_answer";
      }

      if (verdict !== "accepted") {
        return {
          verdict,
          passed: i,
          total: tests.length,
          failedAt: i,
          runtime_ms: maxMs || null,
          memory_kb: maxKb || null,
          compile_output: null,
          stderr_output: outOf(r, "stderr") || r.error || null,
          raw,
        };
      }
    }
  } finally {
    if (built.fileId) await releaseFile(built.fileId);
  }

  return {
    verdict: "accepted",
    passed: tests.length,
    total: tests.length,
    failedAt: null,
    runtime_ms: maxMs || null,
    memory_kb: maxKb || null,
    compile_output: null,
    stderr_output: null,
    raw,
  };
}

async function runOnce({
  source,
  stdin,
  timeLimitMs = 5000,
  memoryLimitKb = 131072,
  language = DEFAULT_LANGUAGE,
}: RunArgs): Promise<RunResult> {
  const exec = EXEC[language];

  const built = await build(source, exec);
  if (built.error) {
    return {
      statusId: verdictToStatusId("compile_error"),
      statusDescription: "Compilation Error",
      stdout: "",
      stderr: "",
      compile_output: built.error.output,
      runtime_ms: null,
      memory_kb: null,
      exit_code: built.error.result.exitStatus ?? null,
    };
  }

  try {
    const r = await runOne(
      built,
      exec,
      source,
      stdin,
      timeLimitMs,
      memoryLimitKb,
    );
    const verdict = statusToVerdict(r.status);
    return {
      statusId: verdictToStatusId(verdict),
      statusDescription: describe(verdict, r.status),
      stdout: outOf(r, "stdout"),
      stderr: outOf(r, "stderr") || r.error || "",
      compile_output: "",
      runtime_ms: msOf(r) || null,
      memory_kb: kbOf(r) || null,
      exit_code: r.exitStatus ?? null,
    };
  } finally {
    if (built.fileId) await releaseFile(built.fileId);
  }
}

export const goJudgeBackend: JudgeBackend = { name: "go-judge", grade, runOnce };
