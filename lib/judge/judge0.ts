// The hosted Judge0 backend (RapidAPI, or a self-hosted Judge0 instance).
//
// Judge0 does the whole job in one call: it knows the language, compiles,
// runs, compares against expected_output and returns a verdict.

import type { Verdict } from "@/types/database";
import { judge0IdFor, DEFAULT_LANGUAGE } from "@/lib/languages";

import {
  JudgeRateLimitError,
  JudgeUnavailableError,
  type GradeArgs,
  type JudgeBackend,
  type JudgeResult,
  type RunArgs,
  type RunResult,
} from "./types";

interface Judge0Submission {
  source_code: string;
  stdin?: string;
  expected_output?: string;
  language_id: number;
  cpu_time_limit?: number; // seconds (float)
  memory_limit?: number; // KB
}

interface Judge0Result {
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null; // seconds, as a string
  memory: number | null; // KB
  exit_code: number | null;
}

const API_URL = process.env.JUDGE0_API_URL ?? "https://judge0-ce.p.rapidapi.com";
const API_KEY = process.env.JUDGE0_API_KEY ?? "";
const API_HOST = process.env.JUDGE0_API_HOST ?? "judge0-ce.p.rapidapi.com";

const toBase64 = (s: string) => Buffer.from(s, "utf-8").toString("base64");
const fromBase64 = (s: string | null) =>
  s ? Buffer.from(s, "base64").toString("utf-8") : "";

function statusIdToVerdict(id: number): Verdict {
  if (id === 3) return "accepted";
  if (id === 4) return "wrong_answer";
  if (id === 5) return "time_limit_exceeded";
  if (id === 6) return "compile_error";
  if (id >= 7 && id <= 12) return "runtime_error";
  return "internal_error";
}

async function submitAndWait(payload: Judge0Submission): Promise<Judge0Result> {
  const url = `${API_URL}/submissions?base64_encoded=true&wait=true&fields=*`;
  const body = {
    ...payload,
    source_code: toBase64(payload.source_code),
    stdin: payload.stdin ? toBase64(payload.stdin) : undefined,
    expected_output: payload.expected_output
      ? toBase64(payload.expected_output)
      : undefined,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    throw new JudgeUnavailableError(
      `Judge0 unreachable: ${e instanceof Error ? e.message : "network error"}`,
    );
  }

  if (res.status === 429) throw new JudgeRateLimitError();
  if (res.status >= 500) {
    throw new JudgeUnavailableError(`Judge0 returned ${res.status}`);
  }
  if (!res.ok) throw new Error(`Judge0 ${res.status}: ${await res.text()}`);

  return (await res.json()) as Judge0Result;
}

async function grade({
  source,
  tests,
  timeLimitMs,
  memoryLimitKb,
  language = DEFAULT_LANGUAGE,
}: GradeArgs): Promise<JudgeResult> {
  let maxRuntimeMs = 0;
  let maxMemoryKb = 0;
  const rawResults: unknown[] = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const result = await submitAndWait({
      source_code: source,
      stdin: t.stdin,
      expected_output: t.expected_stdout,
      language_id: judge0IdFor(language),
      cpu_time_limit: timeLimitMs / 1000,
      memory_limit: memoryLimitKb,
    });
    rawResults.push(result);

    const verdict = statusIdToVerdict(result.status.id);
    const timeMs = result.time ? Math.round(parseFloat(result.time) * 1000) : 0;
    maxRuntimeMs = Math.max(maxRuntimeMs, timeMs);
    maxMemoryKb = Math.max(maxMemoryKb, result.memory ?? 0);

    if (verdict !== "accepted") {
      return {
        verdict,
        passed: i,
        total: tests.length,
        failedAt: i,
        runtime_ms: maxRuntimeMs || null,
        memory_kb: maxMemoryKb || null,
        compile_output: fromBase64(result.compile_output) || null,
        stderr_output: fromBase64(result.stderr) || null,
        raw: rawResults,
      };
    }
  }

  return {
    verdict: "accepted",
    passed: tests.length,
    total: tests.length,
    failedAt: null,
    runtime_ms: maxRuntimeMs || null,
    memory_kb: maxMemoryKb || null,
    compile_output: null,
    stderr_output: null,
    raw: rawResults,
  };
}

async function runOnce({
  source,
  stdin,
  timeLimitMs = 5000,
  memoryLimitKb = 131072,
  language = DEFAULT_LANGUAGE,
}: RunArgs): Promise<RunResult> {
  const result = await submitAndWait({
    source_code: source,
    stdin,
    language_id: judge0IdFor(language),
    cpu_time_limit: timeLimitMs / 1000,
    memory_limit: memoryLimitKb,
  });
  return {
    statusId: result.status.id,
    statusDescription: result.status.description,
    stdout: fromBase64(result.stdout),
    stderr: fromBase64(result.stderr),
    compile_output: fromBase64(result.compile_output),
    runtime_ms: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
    memory_kb: result.memory ?? null,
    exit_code: result.exit_code,
  };
}

export const judge0Backend: JudgeBackend = { name: "judge0", grade, runOnce };
