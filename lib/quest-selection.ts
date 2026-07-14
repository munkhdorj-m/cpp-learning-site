// Deterministic daily quest selection — same user × same date → same set.
// Doesn't write to DB; recomputed on every page load.

export interface QuestSeedable {
  id: string;
}

// FNV-1a 32-bit hash. Stable and dependency-free.
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// Returns YYYY-MM-DD for "today" in Asia/Ulaanbaatar so the daily reset
// happens at local midnight, not UTC.
export function todayKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

/** Picks N quests for the given user × date deterministically. */
export function pickDailyQuests<T extends QuestSeedable>(
  pool: T[],
  userId: string,
  dateKey: string,
  count: number,
): T[] {
  if (pool.length <= count) return [...pool];
  const scored = pool.map((q) => ({
    q,
    score: hashString(q.id + "|" + userId + "|" + dateKey),
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, count).map((s) => s.q);
}

export const DAILY_QUEST_COUNT = 5;

export function normalizeAnswer(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function isCorrectAnswer(
  type: "predict_output" | "bug_hunt" | "multiple_choice",
  userAnswer: string,
  correctAnswer: string,
): boolean {
  if (type === "predict_output") {
    return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
  }
  return userAnswer.trim() === correctAnswer.trim();
}
