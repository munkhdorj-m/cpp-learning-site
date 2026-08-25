// Homework and practice are separate tracks.
//
//   node_modules/.bin/jiti scripts/check-assignment-track.mts
//
// This is judge and XP code, and the ways it can go wrong are all silent:
//
//   * `?assignment=` comes from the URL. If it were trusted, a student could
//     point at another class's assignment, or one that has not opened, and
//     mint whatever XP the teacher set there. Every rejection path below is a
//     way that could have happened.
//   * if the two tracks stopped being separated in the SQL, homework would
//     start ticking off the problems page again and the whole change would
//     quietly revert with nothing failing.
//
// The DB-backed half (resolveTrack, hasEarlierAccept) needs a database, which
// is not reachable from a laptop, so what is checked here is the SQL those
// functions build and the wiring around them — by reading the source. Crude,
// but it is the difference between "I believe it is scoped" and "the scoping
// clause is present in both subqueries".
import fs from "node:fs";

const problems: string[] = [];
const rows: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
  if (!ok) problems.push(name + (detail ? ` — ${detail}` : ""));
}

const read = (f: string) => fs.readFileSync(f, "utf8");

/* ------------------------------------------- the URL is never trusted */

const track = read("lib/assignment-track.ts");

check(
  "resolveTrack checks the assignment belongs to the student's class",
  /p\.class_id\s*=\s*a\.class_id/.test(track),
  "otherwise a student could point at another class's assignment",
);
check(
  "resolveTrack checks the assignment actually contains this problem",
  /ap\.assignment_id\s*=\s*a\.id\s+AND\s+ap\.problem_id\s*=\s*\?/.test(track),
  "otherwise any problem could be claimed for any assignment's points",
);
check(
  "resolveTrack refuses an assignment that has not opened",
  /now\s*<\s*new Date\(row\.start_at\)/.test(track),
);
check(
  "resolveTrack refuses one past its deadline unless late work is allowed",
  /now\s*>\s*new Date\(row\.due_at\)[\s\S]{0,40}allow_late/.test(track),
);
check(
  "the points come from the database, never from the request",
  /points:\s*Number\(row\.points\)/.test(track) &&
    !/points:\s*(input|body|parsed)/.test(track),
);
check(
  "a rejected assignment falls back to practice rather than erroring",
  (track.match(/return PRACTICE;/g) ?? []).length >= 4,
  `${(track.match(/return PRACTICE;/g) ?? []).length} fallback paths`,
);
check(
  "the practice track is identified by IS NULL, not by a sentinel id",
  /assignment_id IS NULL/.test(track),
);

/* ------------------------------------------------ the submit route */

const submit = read("app/api/submit/route.ts");

check(
  "the submission row stores the RESOLVED track, not the request's",
  /assignment_id:\s*track\.assignmentId/.test(submit) &&
    !/assignment_id:\s*assignment_id\s*\?\?/.test(submit),
  "storing the raw request value would defeat every check above",
);
check(
  "first-accept is scoped to the track",
  /hasEarlierAccept\(\s*[\s\S]{0,120}track\.assignmentId/.test(submit),
);
check(
  "homework pays the assignment's points",
  /isHomework[\s\S]{0,120}track\.points/.test(submit),
);
check(
  "homework does NOT bump problems_solved",
  /if \(isHomework\)[\s\S]{0,80}awardAssignmentSolve/.test(submit),
);
// Brace-matched rather than a regex window: the badge block is a thousand
// characters long, and a fixed lookahead silently stops testing anything once
// the block outgrows it — which is a check that passes for the wrong reason.
function blockAfter(src: string, marker: string): string | null {
  const at = src.indexOf(marker);
  if (at === -1) return null;
  const open = src.indexOf("{", at);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(open, i + 1);
  }
  return null;
}

const practiceOnly = blockAfter(submit, "if (!isHomework)");
check(
  "there is a practice-only branch at all",
  practiceOnly !== null,
);
check(
  "badges are awarded inside it",
  !!practiceOnly && /awardBadges\(/.test(practiceOnly),
);
check(
  "and awarded nowhere else in the route",
  (submit.match(/awardBadges\(/g) ?? []).length === 1,
  `${(submit.match(/awardBadges\(/g) ?? []).length} call sites`,
);

const gam = read("lib/gamification.ts");
const assignFn = gam.slice(gam.indexOf("export async function awardAssignmentSolve"));
const body = assignFn.slice(0, assignFn.indexOf("\n}"));
check(
  "awardAssignmentSolve really leaves problems_solved alone",
  !/problems_solved/.test(body),
);
check("awardAssignmentSolve still keeps the streak alive", /streak_days/.test(body));
check("awardAssignmentSolve still awards XP", /xp = xp \+ \?/.test(body));

/* ---------------------------------------- the two tracks stay apart */

const solved = read("app/api/problems/solved/route.ts");
check(
  "the problems page counts practice solves only",
  /assignment_id IS NULL/.test(solved),
  "without this, homework ticks problems off the practice list again",
);

const listSql = read("lib/assignments.ts");
check(
  "the assignment list counts only that assignment's solves",
  (listSql.match(/AND s\.assignment_id = a\.id/g) ?? []).length === 2,
  `${(listSql.match(/AND s\.assignment_id = a\.id/g) ?? []).length} of 2 subqueries scoped`,
);

const detail = read("app/(app)/assignments/[id]/page.tsx");
check(
  "the assignment page counts only its own solves",
  /\.eq\("assignment_id", id\)/.test(detail),
);
check(
  "problem links from an assignment carry the track",
  /\?assignment=\$\{id\}/.test(detail),
  "without it the student lands on the practice track and earns the wrong XP",
);

const view = read("app/(app)/problems/[slug]/problem-view.tsx");
check(
  "the problem page sends the track when submitting",
  /assignment_id:\s*homework\?\.id/.test(view),
);
check(
  "the student is told which track they are on",
  /for_assignment/.test(view),
  "the same problem paying 50 once and 10 another time needs explaining",
);

/* ------------------------------------------------- the Class Cup */

const cup = read("lib/mysql/query-builder.ts");
const cupSql = cup.slice(cup.indexOf('name === "class_week_xp"'), cup.indexOf('name === "contest_leaderboard"'));
check("the Class Cup counts problem XP", /submissions/.test(cupSql));
check("the Class Cup counts robot XP", /robot_progress/.test(cupSql));
check(
  "the two XP sources are separate subqueries, not joins",
  (cupSql.match(/SELECT SUM\(/g) ?? []).length === 2 &&
    !/LEFT JOIN submissions/.test(cupSql),
  "joining both to profiles multiplies rows and inflates every total",
);
check(
  "student_count is still a distinct count",
  /COUNT\(DISTINCT p\.id\)/.test(cupSql),
  "the average divides by this; a fanned-out count would deflate every class",
);

/* ------------------------------------------------------------ i18n */

const en = JSON.parse(read("messages/en.json"));
const mn = JSON.parse(read("messages/mn.json"));
check(
  "the homework banner has a label in both locales",
  !!en.problems?.for_assignment && !!mn.problems?.for_assignment,
);

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);
