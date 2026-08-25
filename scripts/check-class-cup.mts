// How classes are ranked against each other.
//
//   node_modules/.bin/jiti scripts/check-class-cup.mts
//
// The two rules this exists to protect:
//
//   * a small class must be able to win. Ranking by total XP made the table a
//     list of which year group is biggest — 35 students out-earn 5 by turning
//     up, and no amount of work closed that gap.
//   * a class is only ever compared with comparable years. A 7th-year class
//     ranked against a 12th-year one is not a competition, it is a category
//     error.
//
// Both are easy to break by "simplifying" the sort, and neither shows up as an
// error — just a table that quietly stops meaning anything.
import fs from "node:fs";

import {
  averageXp,
  buildDivisions,
  divisionFor,
  SENIOR_FROM,
  type ClassRow,
} from "../lib/class-cup.ts";

const problems: string[] = [];
const rows: string[] = [];

function check(name: string, ok: boolean, detail = "") {
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
  if (!ok) problems.push(name + (detail ? ` — ${detail}` : ""));
}

const cls = (
  class_name: string,
  grade: number,
  week_xp: number,
  student_count: number,
): ClassRow => ({
  class_id: class_name,
  class_name,
  grade,
  week_xp,
  student_count,
});

/* ------------------------------------------------------------- divisions */

check("grade 7 is its own division", divisionFor(7) === "7");
check("grade 8 is its own division", divisionFor(8) === "8");
for (const g of [9, 10, 11, 12]) {
  check(`grade ${g} joins the senior division`, divisionFor(g) === "senior");
}
check("the senior cut is 9", SENIOR_FROM === 9);
// Younger years, if the school ever has them, follow the same rule as 7 and 8.
check("grade 6 is its own division", divisionFor(6) === "6");

/* --------------------------------------------------------------- average */

check("35 students, 350 xp -> 10 each", averageXp(350, 35) === 10);
check("5 students, 100 xp -> 20 each", averageXp(100, 5) === 20);
check("one decimal is kept", averageXp(10, 3) === 3.3, String(averageXp(10, 3)));
check("no students is zero, not a crash", averageXp(50, 0) === 0);

/* ------------------------------------------------- the whole point of it */

// The user's actual situation: 9th has 35 students, 12th has 5. The 12th-year
// class works harder per head and must be able to say so.
const big = cls("9A", 9, 700, 35); // 20 each
const small = cls("12A", 12, 200, 5); // 40 each
const senior = buildDivisions([big, small]);
check("both senior years land in one division", senior.length === 1);
check(
  "the smaller class wins on average despite less total XP",
  senior[0]?.classes[0]?.class_name === "12A",
  `order: ${senior[0]?.classes.map((c) => c.class_name).join(", ")}`,
);
check(
  "total XP is still reported",
  senior[0]?.classes[0]?.week_xp === 200 && senior[0]?.classes[1]?.week_xp === 700,
);

/* ------------------------------------------------------------ separation */

const mixed = buildDivisions([
  cls("7A", 7, 100, 10),
  cls("7B", 7, 300, 10),
  cls("8A", 8, 900, 10),
  cls("11A", 11, 50, 5),
  cls("9B", 9, 40, 20),
]);
check("three divisions from grades 7, 8 and 9-12", mixed.length === 3,
  `got ${mixed.map((d) => d.key).join(", ")}`);
check("youngest division first", mixed[0]?.key === "7");
check("seniors last", mixed[mixed.length - 1]?.key === "senior");
// The 8th-year class has by far the most XP in the school and must NOT appear
// in the 7th-year table.
check(
  "the 7th-year table contains only 7th-year classes",
  mixed[0]?.classes.every((c) => c.grade === 7) === true,
);
check(
  "the senior table holds both 11 and 9",
  mixed[2]?.classes.length === 2 &&
    mixed[2].classes.every((c) => c.grade >= SENIOR_FROM),
);
check("7B beats 7A on average", mixed[0]?.classes[0]?.class_name === "7B");

/* --------------------------------------------------------------- shares */

// The bar is relative to the leader OF THAT DIVISION, not the whole school.
check("division leader's bar is full", mixed[0]?.classes[0]?.share === 100);
check(
  "second place is scaled inside its own division",
  Math.round(mixed[0]?.classes[1]?.share ?? -1) === 33,
  `got ${mixed[0]?.classes[1]?.share}`,
);

// Early in the week nobody has earned anything. A full bar for a class on zero
// reads as a win, so an all-zero division must show empty bars.
const fresh = buildDivisions([cls("7A", 7, 0, 10), cls("7B", 7, 0, 12)]);
check(
  "a week with no XP yet shows empty bars, not full ones",
  fresh[0]?.classes.every((c) => c.share === 0) === true,
);

/* ---------------------------------------------------------- empty & ties */

const withEmpty = buildDivisions([cls("7A", 7, 0, 0), cls("7B", 7, 10, 5)]);
check(
  "a class with no students is dropped, not divided by zero",
  withEmpty[0]?.classes.length === 1 &&
    withEmpty[0].classes[0].class_name === "7B",
);

const tied = buildDivisions([cls("7B", 7, 100, 10), cls("7A", 7, 100, 10)]);
check(
  "an exact tie falls back to name, so the order is stable",
  tied[0]?.classes.map((c) => c.class_name).join(",") === "7A,7B",
);

const tieOnAverage = buildDivisions([
  cls("7A", 7, 100, 10), // 10 each
  cls("7B", 7, 200, 20), // 10 each, more total
]);
check(
  "equal averages break on total XP",
  tieOnAverage[0]?.classes[0]?.class_name === "7B",
);

check("no classes at all is not a crash", buildDivisions([]).length === 0);

/* ------------------------------------------------------------------ i18n */

const en = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));
const mn = JSON.parse(fs.readFileSync("messages/mn.json", "utf8"));
for (const key of [
  "class_cup",
  "class_cup_note",
  "division_grade",
  "division_senior",
  "xp_each",
  "xp_total",
]) {
  if (!en.leaderboard?.[key]) problems.push(`messages/en.json: leaderboard.${key} missing`);
  if (!mn.leaderboard?.[key]) problems.push(`messages/mn.json: leaderboard.${key} missing`);
}
// The placeholders the page passes must be the ones the strings expect.
for (const [file, d] of [["en", en], ["mn", mn]] as const) {
  const g = d.leaderboard?.division_grade ?? "";
  const s = d.leaderboard?.division_senior ?? "";
  if (!g.includes("{grade}")) problems.push(`${file}: division_grade has no {grade}`);
  if (!s.includes("{from}") || !s.includes("{to}")) {
    problems.push(`${file}: division_senior needs both {from} and {to}`);
  }
}
rows.push("  ok    division headings carry their placeholders in both locales");

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);
