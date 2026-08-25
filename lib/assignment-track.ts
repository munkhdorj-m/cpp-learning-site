import { query } from "./mysql/pool";

/**
 * Which track a submission belongs to, and what it is worth.
 *
 * A submission is either practice (the problems page) or homework (a specific
 * assignment). The two are counted separately: solving a problem for homework
 * leaves it open on the problems page, and solving it there later earns again.
 *
 * SECURITY: the assignment id arrives in the URL as `?assignment=`, so it is
 * entirely student-controlled. Nothing here trusts it. A submission only lands
 * in the assignment track when the assignment really is set for that student's
 * class, really does contain that problem, and really is open — otherwise it
 * is practice, which is the one that awards less. A student cannot invent a
 * high-scoring assignment, point at another class's work, or keep earning
 * homework XP after the deadline.
 */

export interface TrackContext {
  /** null means the practice track. */
  assignmentId: string | null;
  /**
   * XP this solve is worth. For homework it is the points the teacher set for
   * that problem in that assignment; for practice it is the problem's own
   * xp_reward, decided by the caller.
   */
  points: number | null;
}

const PRACTICE: TrackContext = { assignmentId: null, points: null };

interface Row {
  points: number;
  start_at: string;
  due_at: string;
  allow_late: number;
}

/**
 * Resolve `?assignment=` into a track.
 *
 * Falls back to practice rather than failing. A deadline that passed while a
 * student had the tab open should cost them the homework points, not their
 * whole submission — and a link someone mistyped should still let them solve
 * the problem.
 */
export async function resolveTrack(
  assignmentId: string | null | undefined,
  userId: string,
  problemId: string,
): Promise<TrackContext> {
  if (!assignmentId) return PRACTICE;

  const rows = await query<Row>(
    `SELECT ap.points, a.start_at, a.due_at, a.allow_late
       FROM assignments a
       JOIN assignment_problems ap
         ON ap.assignment_id = a.id AND ap.problem_id = ?
       JOIN profiles p
         ON p.id = ? AND p.class_id = a.class_id
      WHERE a.id = ?`,
    [problemId, userId, assignmentId],
  );

  const row = rows[0];
  if (!row) return PRACTICE;

  const now = Date.now();
  if (now < new Date(row.start_at).getTime()) return PRACTICE;
  if (now > new Date(row.due_at).getTime() && !row.allow_late) return PRACTICE;

  return { assignmentId, points: Number(row.points) };
}

/**
 * Has this student already had a first-accept in this track for this problem?
 *
 * Written as raw SQL because the query builder has no `IS NULL` predicate, and
 * `assignment_id IS NULL` is exactly what identifies the practice track.
 * `excludeId` is the submission being judged right now, which is already in the
 * table by this point.
 */
export async function hasEarlierAccept(
  userId: string,
  problemId: string,
  assignmentId: string | null,
  excludeId: string,
): Promise<boolean> {
  const rows = await query<{ n: number }>(
    `SELECT COUNT(*) AS n
       FROM submissions
      WHERE user_id = ?
        AND problem_id = ?
        AND verdict = 'accepted'
        AND id <> ?
        AND ${assignmentId === null ? "assignment_id IS NULL" : "assignment_id = ?"}`,
    assignmentId === null
      ? [userId, problemId, excludeId]
      : [userId, problemId, excludeId, assignmentId],
  );
  return Number(rows[0]?.n ?? 0) > 0;
}
