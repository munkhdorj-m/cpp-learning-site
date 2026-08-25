// Every badge in the database has a rule a student can read.
//
//   node_modules/.bin/jiti scripts/check-badges.mts
//
// The failure this catches: someone adds a badge row and the profile shows a
// grey shape with no way to find out what it is for. It also names the badges
// nothing awards, so they stay a known gap rather than a mystery.
import fs from "node:fs";

import { BADGE_SPECS, orderBadges, progressFor, specFor } from "../lib/badges.ts";

interface BadgeRow { code: string; name_en: string }
const rows: BadgeRow[] = JSON.parse(
  fs.readFileSync("migration/backup/badges.json", "utf8"),
);

/**
 * Badges that have been deleted from the database by a migration.
 *
 * migration/backup/badges.json is a point-in-time export and is not rewritten
 * when a badge is retired — it is a backup, not a live mirror. So retired
 * codes are named here instead: they must NOT have a spec, which is what stops
 * one being quietly added back for a badge no student can be given.
 *
 * quest_10 / quest_50 / quest_perfect_day: removed with the daily quests, by
 * migration/remove-quest-badges.sql.
 */
const RETIRED = new Set(["quest_10", "quest_50", "quest_perfect_day"]);

const problems: string[] = [];

for (const r of rows) {
  const spec = specFor(r.code);
  if (RETIRED.has(r.code)) {
    if (spec) {
      problems.push(
        `"${r.code}" was retired by a migration but still has a rule in lib/badges.ts`,
      );
    }
    continue;
  }
  if (!spec) {
    problems.push(`"${r.code}" (${r.name_en}) is in the database with no rule in lib/badges.ts`);
    continue;
  }
  if (!spec.requirement_en.trim()) problems.push(`${r.code}: no English requirement`);
  if (!spec.requirement_mn.trim()) problems.push(`${r.code}: no Mongolian requirement`);
  if (spec.requirement_en === spec.requirement_mn) {
    problems.push(`${r.code}: the two languages are the same string`);
  }
}
for (const spec of BADGE_SPECS) {
  if (!rows.some((r) => r.code === spec.code)) {
    problems.push(`"${spec.code}" has a rule but no badge row exists for it`);
  }
}

// Every retired code must actually be retired everywhere, not just here.
for (const code of RETIRED) {
  if (BADGE_SPECS.some((s) => s.code === code)) {
    problems.push(`"${code}" is listed as retired but still has a spec`);
  }
}

// Progress must be bounded by its target, never past it.
const far = progressFor("ten_solved", { problems_solved: 999 });
if (far && far.current > far.target) {
  problems.push("progressFor reported more than the target");
}
if (progressFor("first_hard", { problems_solved: 5 }) !== null) {
  problems.push("first_hard is a one-off event and must report no progress");
}

// Earned first, unobtainable last.
const ordered = orderBadges([
  { code: "class_champion", earned_at: null },
  { code: "ten_solved", earned_at: null },
  { code: "first_solve", earned_at: "2026-01-01T00:00:00Z" },
]);
if (ordered[0].code !== "first_solve") problems.push("earned badges must come first");
if (ordered[2].code !== "class_champion") problems.push("unobtainable badges must come last");

const dead = BADGE_SPECS.filter((s) => s.unobtainable).map((s) => s.code);
console.log(
  `badges: ${rows.length - RETIRED.size} live, ${RETIRED.size} retired ` +
    `(${[...RETIRED].join(", ")})`,
);
console.log(`nothing awards these yet: ${dead.join(", ") || "(none)"}`);

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nno problems");
