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

/**
 * The list query, and its parameters, for whichever tables exist.
 *
 * Returned together so the two can never be built apart. Parameter order
 * follows the order the `?`s appear in the statement: solved, earned, the
 * task hand-in count (only when that table exists), the turn-in join (ditto),
 * then the class lookup.
 */
export function buildAssignmentListQuery(opts: {
  userId: string;
  hasTurnins: boolean;
  hasTasks: boolean;
}): { sql: string; params: string[] } {
  const { userId, hasTurnins, hasTasks } = opts;

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

  const params: string[] = [userId, userId];
  if (hasTasks) params.push(userId);
  if (hasTurnins) params.push(userId);
  params.push(userId);

  const sql = `SELECT a.id, a.title, a.start_at, a.due_at, a.allow_late,
            ${turnInCols}
            (SELECT COUNT(*) FROM assignment_problems ap
              WHERE ap.assignment_id = a.id) AS problems,
            (SELECT COALESCE(SUM(ap.points), 0) FROM assignment_problems ap
              WHERE ap.assignment_id = a.id) AS points,
            (SELECT COUNT(*) FROM assignment_problems ap
               JOIN submissions s ON s.problem_id = ap.problem_id
              WHERE ap.assignment_id = a.id
                AND s.user_id = ?
                AND s.verdict = 'accepted'
                AND s.is_first_accepted = TRUE
                AND s.assignment_id = a.id) AS solved,
            (SELECT COALESCE(SUM(ap.points), 0) FROM assignment_problems ap
               JOIN submissions s ON s.problem_id = ap.problem_id
              WHERE ap.assignment_id = a.id
                AND s.user_id = ?
                AND s.verdict = 'accepted'
                AND s.is_first_accepted = TRUE
                AND s.assignment_id = a.id) AS earned,
            ${taskCols}
       FROM assignments a
       ${turnInJoin}
      WHERE a.class_id = (SELECT class_id FROM profiles WHERE id = ?)
      ORDER BY a.due_at ASC`;

  return { sql, params };
}
