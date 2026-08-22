// What the rest of the site knows about judging.
//
// Two backends implement this: Judge0 (the hosted RapidAPI service) and
// go-judge (a sandbox we run ourselves). Everything above this file is
// written against these types, so swapping the backend changes nothing else.

import type { Verdict } from "@/types/database";
import type { LanguageId } from "@/lib/languages";

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

export interface RunResult {
  /** Judge0-compatible status id, so the playground renders the same either way. */
  statusId: number;
  statusDescription: string;
  stdout: string;
  stderr: string;
  compile_output: string;
  runtime_ms: number | null;
  memory_kb: number | null;
  exit_code: number | null;
}

export interface GradeArgs {
  source: string;
  tests: TestCase[];
  timeLimitMs: number;
  memoryLimitKb: number;
  language?: LanguageId;
}

export interface RunArgs {
  source: string;
  stdin: string;
  timeLimitMs?: number;
  memoryLimitKb?: number;
  language?: LanguageId;
}

export interface JudgeBackend {
  readonly name: string;
  grade(args: GradeArgs): Promise<JudgeResult>;
  runOnce(args: RunArgs): Promise<RunResult>;
}

/** The judge is up but refusing work — the student should simply try again. */
export class JudgeRateLimitError extends Error {
  constructor(message = "Judge rate limit exceeded") {
    super(message);
    this.name = "JudgeRateLimitError";
  }
}

/**
 * The judge could not be reached at all: the box is down, the port is shut,
 * the token is wrong. Separate from a rate limit because this is the case
 * worth failing over to another backend for.
 */
export class JudgeUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JudgeUnavailableError";
  }
}

/**
 * How output is compared. Trailing whitespace is not something a student
 * should lose a mark for, and it is what Judge0 ignores too, so the two
 * backends agree on what counts as a correct answer.
 */
export function normaliseOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\s+$/, "");
}
