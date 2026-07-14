import type { Verdict } from "@/types/database";

export const CPP_LANGUAGE_ID = 54; // C++ (GCC 9.2.0)

interface Judge0Submission {
  source_code: string;
  stdin?: string;
  expected_output?: string;
  language_id: number;
  cpu_time_limit?: number;     // seconds (float)
  memory_limit?: number;       // KB
  redirect_stderr_to_stdout?: boolean;
}

interface Judge0Result {
  token?: string;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;       // seconds, as a string
  memory: number | null;     // KB
  exit_code: number | null;
}

const API_URL = process.env.JUDGE0_API_URL ?? "https://judge0-ce.p.rapidapi.com";
const API_KEY = process.env.JUDGE0_API_KEY ?? "";
const API_HOST = process.env.JUDGE0_API_HOST ?? "judge0-ce.p.rapidapi.com";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": API_HOST,
  };
}

function toBase64(s: string) {
  return Buffer.from(s, "utf-8").toString("base64");
}

function fromBase64(s: string | null): string {
  if (!s) return "";
  return Buffer.from(s, "base64").toString("utf-8");
}

function statusIdToVerdict(id: number): Verdict {
  if (id === 3) return "accepted";
  if (id === 4) return "wrong_answer";
  if (id === 5) return "time_limit_exceeded";
  if (id === 6) return "compile_error";
  if (id >= 7 && id <= 12) return "runtime_error";
  return "internal_error";
}

/**
 * Submit one source+test pair to Judge0 and wait for the verdict.
 * Used for both grading (with expected_output) and the standalone IDE (without).
 */
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
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Judge0RateLimitError();
    }
    throw new Error(`Judge0 ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as Judge0Result;
}

export class Judge0RateLimitError extends Error {
  constructor() {
    super("Judge0 rate limit exceeded");
    this.name = "Judge0RateLimitError";
  }
}

export interface TestCase {
  stdin: string;
  expected_stdout: string;
}

export interface JudgeResult {
  verdict: Verdict;
  passed: number;
  total: number;
  failedAt: number | null;
  runtime_ms: number | null;
  memory_kb: number | null;
  compile_output: string | null;
  stderr_output: string | null;
  raw: unknown;
}

/**
 * Run the given C++ source against an ordered list of test cases.
 * Stops at the first failing test (short-circuit grading).
 */
export async function grade({
  source,
  tests,
  timeLimitMs,
  memoryLimitKb,
}: {
  source: string;
  tests: TestCase[];
  timeLimitMs: number;
  memoryLimitKb: number;
}): Promise<JudgeResult> {
  let maxRuntimeMs = 0;
  let maxMemoryKb = 0;
  const rawResults: unknown[] = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const result = await submitAndWait({
      source_code: source,
      stdin: t.stdin,
      expected_output: t.expected_stdout,
      language_id: CPP_LANGUAGE_ID,
      cpu_time_limit: timeLimitMs / 1000,
      memory_limit: memoryLimitKb,
    });
    rawResults.push(result);

    const verdict = statusIdToVerdict(result.status.id);
    const timeMs = result.time ? Math.round(parseFloat(result.time) * 1000) : 0;
    const memKb = result.memory ?? 0;
    maxRuntimeMs = Math.max(maxRuntimeMs, timeMs);
    maxMemoryKb = Math.max(maxMemoryKb, memKb);

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

/**
 * Single run for the standalone IDE — no expected_output, returns raw stdout/stderr.
 */
export async function runOnce({
  source,
  stdin,
  timeLimitMs = 5000,
  memoryLimitKb = 131072,
}: {
  source: string;
  stdin: string;
  timeLimitMs?: number;
  memoryLimitKb?: number;
}) {
  const result = await submitAndWait({
    source_code: source,
    stdin,
    language_id: CPP_LANGUAGE_ID,
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
