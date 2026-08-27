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
// arguments to mysqld_stmt_execute" instead of their homework. Every
// combination is counted here.
//
// The second is the bucketing: which pile an assignment lands in. The case
// that matters is a missed deadline on an assignment that still accepts late
// work — that has to stay actionable, not be filed under "missed" where a
// student would stop looking at it.
//
// The third is the late penalty, which was stored and displayed for months
// and applied to nothing at all.
import {
  applyLatePenalty,
  bucketFor,
  buildAssignmentListQuery,
  isLate,
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
   for (const hasProblemMarks of [true, false]) {
    const { sql, params } = buildAssignmentListQuery({
      userId: "u-1",
      hasTurnins,
      hasTasks,
      hasProblemMarks,
    });
    // Count only real placeholders. There are no string literals containing
    // '?' in this statement, but strip quoted text anyway so the count cannot
    // be fooled if one is ever added.
    const stripped = sql.replace(/'[^']*'/g, "''");
    const holes = (stripped.match(/\?/g) ?? []).length;
    const ok = holes === params.length;
    const label =
      `turnins=${String(hasTurnins).padEnd(5)} ` +
      `tasks=${String(hasTasks).padEnd(5)} ` +
      `marks=${String(hasProblemMarks).padEnd(5)}`;
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
      "late_penalty_pct",
    ]) {
      if (!new RegExp(`\\b${col}\\b`).test(sql)) {
        problems.push(`${label}: the query never produces "${col}"`);
      }
    }
    if (!hasProblemMarks && /assignment_problem_marks/.test(sql)) {
      problems.push(`${label}: names the marks table, which is absent`);
    }
   }
  }
}

/* --------------------------------- the shape of the summed expressions */

// Counting placeholders proves the query RUNS. It says nothing about whether
// it means anything, and this is the failure that taught that lesson:
//
//   (SELECT … WHERE s.assignment_id = a.id + (SELECT … )) AS earned
//
// One missing pair of brackets moved the task-points subquery inside the
// problem subquery's WHERE clause. MySQL accepts it, coerces the UUID on the
// left of the `+` to 0, matches no rows, and reports every student in the
// school as having earned nothing. Valid SQL, silently wrong, and invisible to
// a placeholder count.
//
// So: pull out each summed expression and check every `+` joining subqueries
// sits at the TOP level of it, with balanced brackets either side.
function summedTopLevel(sql: string, alias: string): boolean {
  // Walk back from `) AS alias` to the matching open bracket.
  const end = sql.indexOf(`) AS ${alias}`);
  if (end === -1) return false;
  let depth = 0;
  let start = -1;
  for (let i = end; i >= 0; i--) {
    if (sql[i] === ")") depth++;
    else if (sql[i] === "(") {
      depth--;
      if (depth === 0) {
        start = i;
        break;
      }
    }
  }
  if (start === -1) return false;

  // `end` indexes the closing bracket itself, so stop before it — including
  // it leaves the slice unbalanced and every check fails for the wrong reason.
  const inner = sql.slice(start + 1, end);
  // Split on `+` at depth 0 and require each part to be a balanced subquery.
  let d = 0;
  const parts: string[] = [];
  let cur = "";
  for (const ch of inner) {
    if (ch === "(") d++;
    else if (ch === ")") d--;
    else if (ch === "+" && d === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);

  return parts.every((raw) => {
    const part = raw.trim();
    if (!part.startsWith("(") || !part.endsWith(")")) return false;
    let k = 0;
    for (const ch of part) {
      if (ch === "(") k++;
      else if (ch === ")") k--;
      if (k < 0) return false;
    }
    return k === 0 && /^\(\s*SELECT/i.test(part);
  });
}

for (const hasTasks of [true, false]) {
  for (const hasProblemMarks of [true, false]) {
    const { sql } = buildAssignmentListQuery({
      userId: "u-1",
      hasTurnins: true,
      hasTasks,
      hasProblemMarks,
    });
    const label = `tasks=${String(hasTasks).padEnd(5)} marks=${String(hasProblemMarks).padEnd(5)}`;

    for (const alias of ["points", "earned"]) {
      const ok = summedTopLevel(sql, alias);
      rows.push(`  ${ok ? "ok  " : "FAIL"}  ${label} "${alias}" is a top-level sum of balanced subqueries`);
      if (!ok) {
        problems.push(
          `${label}: "${alias}" has a \`+\` nested inside a subquery — ` +
            "the second term is being absorbed into the first one's WHERE clause",
        );
      }
    }

    // The specific corruption, named: a `+` immediately after a column
    // comparison is the signature of the bracket that went missing.
    if (/=\s*a\.id\s*\+/.test(sql)) {
      problems.push(`${label}: "a.id + (…)" — a subquery leaked into a WHERE clause`);
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

/* -------------------------------------------------------- late penalty */

function expectNum(name: string, got: number, want: number) {
  const ok = got === want;
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name} -> ${got}`);
  if (!ok) problems.push(`${name}: got ${got}, expected ${want}`);
}

function expectBool(name: string, got: boolean, want: boolean) {
  const ok = got === want;
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name} -> ${got}`);
  if (!ok) problems.push(`${name}: got ${got}, expected ${want}`);
}

// Who counts as late.
expectBool(
  "turned in on time",
  isLate({ dueAt: NOW + DAY, turnedInAt: "2026-01-01", turnedInLate: false }, NOW),
  false,
);
expectBool(
  "turned in late",
  isLate({ dueAt: NOW - DAY, turnedInAt: "2026-01-01", turnedInLate: true }, NOW),
  true,
);
// The case that is easy to miss: never handed in, deadline gone. Without it
// the penalty only ever hits students honest enough to submit something.
expectBool(
  "never turned in, past the deadline",
  isLate({ dueAt: NOW - DAY, turnedInAt: null, turnedInLate: false }, NOW),
  true,
);
expectBool(
  "never turned in, still open",
  isLate({ dueAt: NOW + DAY, turnedInAt: null, turnedInLate: false }, NOW),
  false,
);
// An on-time turn-in stays on time once the deadline passes — which is the
// whole reason `late` is stamped at turn-in rather than recomputed on read.
expectBool(
  "handed in on time, read back after the deadline",
  isLate({ dueAt: NOW - DAY, turnedInAt: "2026-01-01", turnedInLate: false }, NOW),
  false,
);

// What it costs.
expectNum("on time keeps everything", applyLatePenalty(100, 50, false), 100);
expectNum("50% of 100", applyLatePenalty(100, 50, true), 50);
expectNum("a 0% penalty changes nothing", applyLatePenalty(100, 0, true), 100);
expectNum("a 100% penalty leaves nothing", applyLatePenalty(100, 100, true), 0);
// Rounding favours the student: half of 15 is 7.5, and they get 8.
expectNum("rounding favours the student", applyLatePenalty(15, 50, true), 8);
expectNum("nothing earned stays nothing", applyLatePenalty(0, 50, true), 0);
expectNum("an over-100 penalty floors at zero", applyLatePenalty(100, 150, true), 0);

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
