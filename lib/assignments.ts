/**
 * The two pieces of the student assignment list that are worth testing on
 * their own: which pile an assignment goes in, and the SQL that feeds it.
 *
 * The SQL is assembled rather than written out because two of the tables it
 * reads arrive with migrations that are applied by hand — see
 * lib/mysql/has-table.ts. Assembly means the placeholders and the parameter
 * array are built in two places, which is exactly the kind of thing that
 * silently drifts and then throws "Incorrect arguments" at a class of
 * thirty. scripts/check-assignments.mts counts both, in every combination.
 */

export type Bucket = "todo" | "missed" | "turned_in" | "upcoming" | "done";

/** Rendered top to bottom. */
export const BUCKET_ORDER: Bucket[] = [
  "todo",
  "missed",
  "upcoming",
  "turned_in",
  "done",
];

export const BUCKET_KEY: Record<Bucket, string> = {
  todo: "group_todo",
  missed: "group_missed",
  upcoming: "group_upcoming",
  turned_in: "group_turned_in",
  done: "group_done",
};

export interface BucketInput {
  startAt: string | Date;
  dueAt: string | Date;
  allowLate: boolean;
  turnedIn: boolean;
}

/**
 * Which pile an assignment belongs in, from the student's point of view.
 *
 * The old page grouped by the calendar — active, upcoming, past — which
 * answers a question nobody asks. These are the five states a student can do
 * something about, and "todo" is deliberately the one that holds anything
 * still actionable, including work that is late but still accepted.
 */
export function bucketFor(a: BucketInput, now: number): Bucket {
  const started = now >= new Date(a.startAt).getTime();
  const overdue = now > new Date(a.dueAt).getTime();

  if (a.turnedIn) {
    // Past the deadline there is nothing left to do about it, so it stops
    // competing for attention with work that is still open.
    return overdue ? "done" : "turned_in";
  }
  if (!started) return "upcoming";
  if (overdue) return a.allowLate ? "todo" : "missed";
  return "todo";
}

/* ------------------------------------------------------- late penalty */

export interface LateInput {
  dueAt: string | Date;
  /** null when they have not turned it in. */
  turnedInAt: string | null;
  /** Stamped at turn-in time, so moving the deadline later cannot un-late it. */
  turnedInLate: boolean;
}

/**
 * Is this student's work late?
 *
 * Two ways to be late, and the second is the one that is easy to forget: a
 * student who never presses Turn In and is now past the deadline is late, not
 * exempt. Otherwise the penalty would only ever apply to the students honest
 * enough to hand something in.
 */
export function isLate(a: LateInput, now: number): boolean {
  if (a.turnedInAt) return a.turnedInLate;
  return now > new Date(a.dueAt).getTime();
}

/**
 * What late work is actually worth.
 *
 * assignments.late_penalty_pct has existed since assignments did, is shown to
 * students on the assignment page as "-50%", and was applied to precisely
 * nothing — a student handing in a week late scored the same as one who was on
 * time. This is the function that was missing.
 *
 * Rounded rather than floored so a 50% penalty on 15 points is 8, not 7: the
 * benefit of the rounding goes to the student.
 */
export function applyLatePenalty(
  earned: number,
  penaltyPct: number,
  late: boolean,
): number {
  if (!late || penaltyPct <= 0) return earned;
  const kept = Math.max(0, 100 - penaltyPct);
  return Math.round((earned * kept) / 100);
}

/**
 * The list query, and its parameters, for whichever tables exist.
 *
 * Returned together so the two can never be built apart. Parameter order
 * follows the order the `?`s appear in the statement: solved, then earned
 * (twice when teacher overrides are in play), the task points earned and the
 * task hand-in count (only when those tables exist), the turn-in join (ditto),
 * then the class lookup. scripts/check-assignments.mts counts every
 * combination, because this is exactly the arithmetic that drifts.
 */
export function buildAssignmentListQuery(opts: {
  userId: string;
  hasTurnins: boolean;
  hasTasks: boolean;
  hasProblemMarks: boolean;
}): { sql: string; params: string[] } {
  const { userId, hasTurnins, hasTasks, hasProblemMarks } = opts;

  const turnInCols = hasTurnins
    ? "ti.turned_in_at, ti.late,"
    : "NULL AS turned_in_at, NULL AS `late`,";

  const turnInJoin = hasTurnins
    ? `LEFT JOIN assignment_turnins ti
              ON ti.assignment_id = a.id AND ti.user_id = ?`
    : "";

  const taskCols = hasTasks
    ? `(SELECT COUNT(*) FROM assignment_tasks at2
              WHERE at2.assignment_id = a.id) AS tasks,
            (SELECT COUNT(*) FROM assignment_tasks at3
               JOIN task_submissions ts ON ts.task_id = at3.id
              WHERE at3.assignment_id = a.id AND ts.user_id = ?) AS handed_in`
    : "0 AS tasks, 0 AS handed_in";

  // Points a teacher set on hand-in tasks are points too. Counting only
  // assignment_problems meant a worksheet-style assignment — one task worth
  // 100 and no judge problems — totalled zero, so the student's card showed no
  // points at all and a mark of 100/100 was invisible to them.
  const taskPointsSum = hasTasks
    ? ` + (SELECT COALESCE(SUM(at4.points), 0) FROM assignment_tasks at4
              WHERE at4.assignment_id = a.id)`
    : "";
  // Only a MARKED hand-in has earned anything: score IS NULL means handed in
  // and not looked at yet, which is not the same as zero.
  const taskEarnedSum = hasTasks
    ? ` + (SELECT COALESCE(SUM(ts2.score), 0) FROM assignment_tasks at5
               JOIN task_submissions ts2 ON ts2.task_id = at5.id
              WHERE at5.assignment_id = a.id
                AND ts2.user_id = ?
                AND ts2.score IS NOT NULL)`
    : "";

  // What the problems earned.
  //
  // NOTE the outer parentheses on both branches. `earned` is a SUM of two
  // subqueries, and without them the ` + (task subquery)` that follows lands
  // inside this one's WHERE clause — `s.assignment_id = a.id + (SELECT …)`,
  // which MySQL happily accepts, coerces the UUID to 0, matches nothing and
  // reports every student as having earned nothing at all.
  //
  // A teacher's override replaces the automatic
  // points for one student on one problem — see migration/add-problem-marks.sql
  // — and applies whether or not the judge accepted it, so a teacher can zero
  // out copied work or give credit for a good attempt that did not pass.
  const problemEarned = hasProblemMarks
    ? `(SELECT COALESCE(SUM(
                 CASE WHEN m.points IS NOT NULL THEN m.points
                      WHEN s.id IS NOT NULL THEN ap.points
                      ELSE 0 END), 0)
           FROM assignment_problems ap
           LEFT JOIN assignment_problem_marks m
                  ON m.assignment_id = ap.assignment_id
                 AND m.problem_id = ap.problem_id
                 AND m.user_id = ?
           LEFT JOIN submissions s
                  ON s.problem_id = ap.problem_id
                 AND s.user_id = ?
                 AND s.verdict = 'accepted'
                 AND s.is_first_accepted = TRUE
                 AND s.assignment_id = ap.assignment_id
          WHERE ap.assignment_id = a.id)`
    : `(SELECT COALESCE(SUM(ap.points), 0) FROM assignment_problems ap
               JOIN submissions s ON s.problem_id = ap.problem_id
              WHERE ap.assignment_id = a.id
                AND s.user_id = ?
                AND s.verdict = 'accepted'
                AND s.is_first_accepted = TRUE
                AND s.assignment_id = a.id)`;

  // In the order the `?`s appear: solved, problem points earned, task points
  // earned, task hand-in count, the turn-in join, then the class lookup.
  const params: string[] = [userId];
  // The override form of `earned` binds the user twice (once for the mark,
  // once for the submission); the plain form binds once.
  params.push(userId);
  if (hasProblemMarks) params.push(userId);
  if (hasTasks) params.push(userId);
  if (hasTasks) params.push(userId);
  if (hasTurnins) params.push(userId);
  params.push(userId);

  const sql = `SELECT a.id, a.title, a.start_at, a.due_at, a.allow_late,
            a.late_penalty_pct,
            ${turnInCols}
            (SELECT COUNT(*) FROM assignment_problems ap
              WHERE ap.assignment_id = a.id) AS problems,
            ((SELECT COALESCE(SUM(ap.points), 0) FROM assignment_problems ap
              WHERE ap.assignment_id = a.id)${taskPointsSum}) AS points,
            (SELECT COUNT(*) FROM assignment_problems ap
               JOIN submissions s ON s.problem_id = ap.problem_id
              WHERE ap.assignment_id = a.id
                AND s.user_id = ?
                AND s.verdict = 'accepted'
                AND s.is_first_accepted = TRUE
                AND s.assignment_id = a.id) AS solved,
            (${problemEarned}${taskEarnedSum}) AS earned,
            ${taskCols}
       FROM assignments a
       ${turnInJoin}
      WHERE a.class_id = (SELECT class_id FROM profiles WHERE id = ?)
      ORDER BY a.due_at ASC`;

  return { sql, params };
}
