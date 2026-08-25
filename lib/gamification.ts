// Gamification logic that used to live in Postgres triggers/functions.
// MySQL has no equivalent triggers here, so the app performs XP / level /
// streak / badge awarding explicitly. Mirrors the old plpgsql exactly.

import { query } from "@/lib/mysql/pool";

// Level curve: lvl = floor(sqrt(xp / 50)) + 1, min 1  (matches compute_level()).
export function computeLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

// The `level = GREATEST(1, FLOOR(SQRT(xp/50)) + 1)` clause reads the value of
// `xp` set earlier in the same statement (MySQL evaluates SET left-to-right),
// so level always reflects the new XP.

/** Add XP to a user and recompute their level. No-op for non-positive delta. */
export async function addXp(userId: string, deltaXp: number): Promise<void> {
  if (!deltaXp || deltaXp <= 0) return;
  await query(
    "UPDATE profiles SET xp = xp + ?, level = GREATEST(1, FLOOR(SQRT(xp / 50)) + 1) WHERE id = ?",
    [deltaXp, userId],
  );
}

/** First-accepted reward: XP + problems_solved + streak + date + level, atomically. */
export async function awardProblemSolve(
  userId: string,
  xpReward: number,
  newStreak: number,
  today: string,
): Promise<void> {
  await query(
    `UPDATE profiles
        SET xp = xp + ?,
            problems_solved = problems_solved + 1,
            streak_days = ?,
            last_solve_date = ?,
            level = GREATEST(1, FLOOR(SQRT(xp / 50)) + 1)
      WHERE id = ?`,
    [xpReward, newStreak, today, userId],
  );
}

/**
 * First-accepted reward for a problem done AS HOMEWORK.
 *
 * Everything awardProblemSolve does except `problems_solved`. The same problem
 * can now be solved once for an assignment and once for practice, and counting
 * both would make "100 problems solved" mean fifty problems done twice. The
 * count, and the badges that read it, stay on the practice track.
 *
 * The streak IS kept alive: doing your homework is doing the work, and a
 * student who only ever does what was set should not lose a streak for it.
 */
export async function awardAssignmentSolve(
  userId: string,
  xpReward: number,
  newStreak: number,
  today: string,
): Promise<void> {
  await query(
    `UPDATE profiles
        SET xp = xp + ?,
            streak_days = ?,
            last_solve_date = ?,
            level = GREATEST(1, FLOOR(SQRT(xp / 50)) + 1)
      WHERE id = ?`,
    [xpReward, newStreak, today, userId],
  );
}

/** Grant badges by code to a user (idempotent). */
export async function awardBadges(
  userId: string,
  codes: string[],
): Promise<void> {
  if (codes.length === 0) return;
  const placeholders = codes.map(() => "?").join(", ");
  await query(
    `INSERT IGNORE INTO user_badges (user_id, badge_id)
       SELECT ?, id FROM badges WHERE code IN (${placeholders})`,
    [userId, ...codes],
  );
}

// --- date helpers (UTC, matching the old trigger's `now() at time zone 'UTC'`) ---

export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysUtc(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Next streak value on a first-accepted solve today.
 *   no prior date, or gap > 1 day  -> 1
 *   solved yesterday               -> streak + 1
 *   already solved today           -> unchanged
 */
export function nextStreak(
  lastSolveDate: string | null | undefined,
  currentStreak: number,
  today: string,
): number {
  if (!lastSolveDate) return 1;
  const last = String(lastSolveDate).slice(0, 10);
  const yesterday = addDaysUtc(today, -1);
  if (last < yesterday) return 1;
  if (last === yesterday) return currentStreak + 1;
  return currentStreak; // last === today (already counted)
}
