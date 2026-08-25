// The student assignment list, without a database.
//
//   node_modules/.bin/jiti scripts/check-assignments.mts
//
// Two things are checked, and both are things that only break in production.
//
// The first is placeholder arithmetic. The list query is ASSEMBLED, because
// two of the tables it reads arrive with migrations applied by hand and may
// not exist yet. That means the `?`s and the parameter array are built in two
// separate places, and if they ever disagree every student gets "Incorrect
// arguments to mysqld_stmt_execute" instead of their homework. All four
// combinations are counted here.
//
// The second is the bucketing: which pile an assignment lands in. The case
// that matters is a missed deadline on an assignment that still accepts late
// work — that has to stay actionable, not be filed under "missed" where a
// student would stop looking at it.
import {
  bucketFor,
  buildAssignmentListQuery,
  BUCKET_ORDER,
  BUCKET_KEY,
  type Bucket,
} from "../lib/assignments.ts";

const problems: string[] = [];
const rows: string[] = [];

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

/* ------------------------------------------------ placeholders vs params */

for (const hasTurnins of [true, false]) {
  for (const hasTasks of [true, false]) {
    const { sql, params } = buildAssignmentListQuery({
      userId: "u-1",
      hasTurnins,
      hasTasks,
    });
    // Count only real placeholders. There are no string literals containing
    // '?' in this statement, but strip quoted text anyway so the count cannot
    // be fooled if one is ever added.
    const stripped = sql.replace(/'[^']*'/g, "''");
    const holes = (stripped.match(/\?/g) ?? []).length;
    const ok = holes === params.length;
    const label = `turnins=${String(hasTurnins).padEnd(5)} tasks=${String(hasTasks).padEnd(5)}`;
    rows.push(
      `  ${ok ? "ok  " : "FAIL"}  ${label}  ${holes} placeholders, ${params.length} params`,
    );
    if (!ok) {
      problems.push(
        `${label}: ${holes} placeholders but ${params.length} parameters`,
      );
    }

    // A missing table must not be named anywhere in the statement.
    if (!hasTurnins && /assignment_turnins/.test(sql)) {
      problems.push(`${label}: references assignment_turnins, which is absent`);
    }
    if (!hasTasks && /assignment_tasks|task_submissions/.test(sql)) {
      problems.push(`${label}: references the task tables, which are absent`);
    }
    // ...and every column the page reads must still come back.
    for (const col of [
      "turned_in_at",
      "late",
      "problems",
      "points",
      "solved",
      "earned",
      "tasks",
      "handed_in",
    ]) {
      if (!new RegExp(`\\b${col}\\b`).test(sql)) {
        problems.push(`${label}: the query never produces "${col}"`);
      }
    }
  }
}

/* ------------------------------------------------------------- bucketing */

function expect(name: string, got: Bucket, want: Bucket) {
  const ok = got === want;
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name} -> ${got}`);
  if (!ok) problems.push(`${name}: got "${got}", expected "${want}"`);
}

const open = { startAt: NOW - DAY, dueAt: NOW + 3 * DAY };
const over = { startAt: NOW - 9 * DAY, dueAt: NOW - 2 * DAY };
const later = { startAt: NOW + 2 * DAY, dueAt: NOW + 9 * DAY };

expect(
  "open, not turned in",
  bucketFor({ ...open, allowLate: false, turnedIn: false }, NOW),
  "todo",
);
expect(
  "open, turned in",
  bucketFor({ ...open, allowLate: false, turnedIn: true }, NOW),
  "turned_in",
);
expect(
  "not started yet",
  bucketFor({ ...later, allowLate: false, turnedIn: false }, NOW),
  "upcoming",
);
expect(
  "overdue, late refused",
  bucketFor({ ...over, allowLate: false, turnedIn: false }, NOW),
  "missed",
);
// The one that matters: still doable, so it must stay in the actionable pile.
expect(
  "overdue, late ACCEPTED",
  bucketFor({ ...over, allowLate: true, turnedIn: false }, NOW),
  "todo",
);
expect(
  "overdue, already turned in",
  bucketFor({ ...over, allowLate: false, turnedIn: true }, NOW),
  "done",
);
// A start date exactly now counts as started, not as upcoming.
expect(
  "starts exactly now",
  bucketFor(
    { startAt: NOW, dueAt: NOW + DAY, allowLate: false, turnedIn: false },
    NOW,
  ),
  "todo",
);
// Turned in beats everything, including never having started.
expect(
  "turned in before it opened",
  bucketFor({ ...later, allowLate: false, turnedIn: true }, NOW),
  "turned_in",
);

/* --------------------------------------------------------- wiring checks */

const seen = new Set(BUCKET_ORDER);
if (seen.size !== BUCKET_ORDER.length) {
  problems.push("BUCKET_ORDER lists a bucket twice");
}
for (const b of Object.keys(BUCKET_KEY) as Bucket[]) {
  if (!seen.has(b)) problems.push(`"${b}" has a label but is never rendered`);
}
for (const b of BUCKET_ORDER) {
  if (!BUCKET_KEY[b]) problems.push(`"${b}" is rendered but has no label key`);
}

// Every label key must exist in both locales, or a group header renders as
// its own key to half the school.
const en = JSON.parse(
  (await import("node:fs")).readFileSync("messages/en.json", "utf8"),
);
const mn = JSON.parse(
  (await import("node:fs")).readFileSync("messages/mn.json", "utf8"),
);
for (const b of BUCKET_ORDER) {
  const key = BUCKET_KEY[b];
  if (!en.assignments?.[key]) problems.push(`messages/en.json: assignments.${key} missing`);
  if (!mn.assignments?.[key]) problems.push(`messages/mn.json: assignments.${key} missing`);
}

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);
