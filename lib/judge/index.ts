// Which judge runs the code, and what happens when it cannot be reached.
//
//   JUDGE_BACKEND   judge0 | go-judge      (default: judge0)
//   JUDGE_FALLBACK  judge0 | go-judge | "" (default: none)
//
// The fallback exists because a judge we host ourselves can be reclaimed,
// rebooted or firewalled off at exactly the wrong moment. If the primary is
// unreachable — not merely busy, and not merely rejecting the program — the
// submission is retried once on the other backend, so a lesson carries on.

import { judge0Backend } from "./judge0";
import { goJudgeBackend } from "./go-judge";
import {
  JudgeUnavailableError,
  type GradeArgs,
  type JudgeBackend,
  type JudgeResult,
  type RunArgs,
  type RunResult,
} from "./types";

export {
  JudgeRateLimitError,
  JudgeUnavailableError,
  normaliseOutput,
} from "./types";
export type { TestCase, JudgeResult, RunResult } from "./types";

const BACKENDS: Record<string, JudgeBackend> = {
  judge0: judge0Backend,
  "go-judge": goJudgeBackend,
};

function pick(name: string | undefined, fallback: JudgeBackend | null) {
  if (!name) return fallback;
  return BACKENDS[name] ?? fallback;
}

const primary = pick(process.env.JUDGE_BACKEND, judge0Backend)!;
const secondary = (() => {
  const chosen = pick(process.env.JUDGE_FALLBACK, null);
  return chosen && chosen.name !== primary.name ? chosen : null;
})();

/** Which judge is configured — handy for a health check or a log line. */
export function activeBackend(): { primary: string; fallback: string | null } {
  return { primary: primary.name, fallback: secondary?.name ?? null };
}

/**
 * Run `op` on the primary judge, and on the fallback if the primary turns out
 * to be unreachable. Every other failure — a rate limit, a rejected program, a
 * malformed response — is passed straight through, because retrying it
 * elsewhere would only produce the same answer more slowly.
 */
async function withFallback<T>(
  op: (backend: JudgeBackend) => Promise<T>,
): Promise<T> {
  try {
    return await op(primary);
  } catch (err) {
    if (!(err instanceof JudgeUnavailableError) || !secondary) throw err;
    console.warn(
      `[judge] ${primary.name} unreachable (${err.message}); falling back to ${secondary.name}`,
    );
    return op(secondary);
  }
}

export function grade(args: GradeArgs): Promise<JudgeResult> {
  return withFallback((b) => b.grade(args));
}

export function runOnce(args: RunArgs): Promise<RunResult> {
  return withFallback((b) => b.runOnce(args));
}
