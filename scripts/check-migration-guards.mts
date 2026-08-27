// Every table added by a migration is read behind a hasTable() guard.
//
//   node_modules/.bin/jiti scripts/check-migration-guards.mts
//
// Migrations here are applied BY HAND, on the server, one file at a time. So
// "the code is deployed" and "the table exists" are two separate events, and
// between them any page that hard-references a new table is a 500 — for every
// student, until someone remembers to run the file.
//
// That is not hypothetical. Shipping robot_hidden_levels without a guard took
// the robot game down on the live site: three read paths queried a table that
// did not exist yet. This file exists so that cannot happen quietly again.
//
// The rule is scoped deliberately:
//
//   * PAGES only. A server component renders because someone navigated, so an
//     unguarded read there is a wall for whoever opens it. A server action or
//     an API route failing is one click returning an error — worth fixing, but
//     not the same thing.
//   * READS only. A write to a table that does not exist should fail loudly.
//
// GRANDFATHERED below are tables that predate this check and are already
// applied on the live database. They are named rather than silently skipped,
// because that list is meant to shrink.
import fs from "node:fs";
import path from "node:path";

const problems: string[] = [];
const rows: string[] = [];

/** Tables that ship with the base schema and are always present. */
const BASE = new Set(
  [
    ...fs
      .readFileSync("migration/mysql-schema.sql", "utf8")
      .matchAll(/CREATE TABLE\s+`?(\w+)`?/gi),
  ].map((m) => m[1]),
);

/** Tables introduced by a later migration, i.e. applied by hand on the box. */
const ADDED = new Map<string, string>();
for (const f of fs.readdirSync("migration")) {
  if (!f.endsWith(".sql")) continue;
  if (f === "mysql-schema.sql" || f === "mysql-data.sql") continue;
  const sql = fs.readFileSync(path.join("migration", f), "utf8");
  for (const m of sql.matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+`?(\w+)`?/gi)) {
    if (!BASE.has(m[1])) ADDED.set(m[1], f);
  }
}

/**
 * Already applied on the live database, and read unguarded by pages written
 * before this check existed. Not safe on a brand-new database — closing these
 * is worth doing, but it is a separate job from stopping NEW tables shipping
 * unguarded, which is what breaks a running site.
 */
const GRANDFATHERED = new Set([
  "uploads",
  "assignment_materials",
  "assignment_tasks",
  "task_submissions",
  "ide_projects",
  "content_progress",
  "review_items",
]);

/**
 * Columns added to a table that already exists.
 *
 * This is the half the first version of this check missed, and it cost an
 * outage: message_threads.teacher_id arrives with add-message-teacher.sql, so
 * a database that ran add-messages.sql and not that one has the table but not
 * the column. hasTable answers yes, the query dies on ER_BAD_FIELD_ERROR, and
 * a student sees "Something went wrong".
 */
const ADDED_COLUMNS = new Map<string, string>();
for (const f of fs.readdirSync("migration")) {
  if (!f.endsWith(".sql")) continue;
  if (f === "mysql-schema.sql" || f === "mysql-data.sql") continue;
  const sql = fs.readFileSync(path.join("migration", f), "utf8");
  // ALTER TABLE <t> … ADD COLUMN [IF NOT EXISTS] <c>
  for (const alter of sql.matchAll(/ALTER TABLE\s+`?(\w+)`?([\s\S]*?);/gi)) {
    const table = alter[1];
    for (const col of alter[2].matchAll(
      /ADD COLUMN(?:\s+IF NOT EXISTS)?\s+`?(\w+)`?/gi,
    )) {
      // Skip only when the SAME file creates the table — then hasTable covers
      // it. A column added by a LATER migration than the table's own needs its
      // own guard, and getting this wrong is precisely what let
      // message_threads.teacher_id through: the table ships in
      // add-messages.sql, the column in add-message-teacher.sql.
      if (ADDED.get(table) !== f) ADDED_COLUMNS.set(`${table}.${col[1]}`, f);
    }
  }
}

/**
 * Columns already applied on the live database and read without a guard by
 * code written before this check. Same intent as GRANDFATHERED above.
 */
const GRANDFATHERED_COLUMNS = new Set([
  "robot_levels.order_idx",
  "code_similarity.jaccard",
  "code_similarity.contained",
  "code_similarity.longest_run",
  "code_similarity.tokens",
  "submissions.signal_score",
  "submissions.signal_flags",
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

// Pages and layouts: the things that render because someone navigated.
const pages = (fs.existsSync("app") ? walk("app") : []).filter((f) => {
  const n = path.basename(f);
  return n === "page.tsx" || n === "layout.tsx";
});

let grandfathered = 0;

for (const file of pages) {
  const src = fs.readFileSync(file, "utf8");

  for (const [table, from] of ADDED) {
    // A read: a select through the query shim, or FROM/JOIN in raw SQL.
    const reads =
      new RegExp(`\\.from\\(\\s*["']${table}["']`).test(src) ||
      new RegExp(`\\b(?:FROM|JOIN)\\s+${table}\\b`).test(src);
    if (!reads) continue;

    if (new RegExp(`hasTable\\(\\s*["']${table}["']`).test(src)) continue;

    if (GRANDFATHERED.has(table)) {
      grandfathered++;
      continue;
    }
    problems.push(
      `${file} reads "${table}" (added by ${from}) with no hasTable() guard — ` +
        "that page is a 500 for everyone until the migration is run",
    );
  }
}

// Columns are checked across every server file, not just pages: an action
// selecting a missing column fails the same way, and there are far fewer of
// them to get right.
const allServer = ["app", "lib"].flatMap((d) => (fs.existsSync(d) ? walk(d) : []));
let grandfatheredCols = 0;

for (const file of allServer) {
  if (file.replace(/\\/g, "/").endsWith("lib/mysql/has-table.ts")) continue;
  const src = fs.readFileSync(file, "utf8");

  for (const [key, from] of ADDED_COLUMNS) {
    const [table, column] = key.split(".");
    if (!new RegExp(`\\b${column}\\b`).test(src)) continue;

    // Only a file that QUERIES the table can hit ER_BAD_FIELD_ERROR. One that
    // merely passes the field along — an API route mapping what a lib function
    // returned, a page handing it to a component — is not where the guard
    // belongs, and flagging it teaches people to add guards that do nothing.
    const queriesIt =
      new RegExp(`\\.from\\(\\s*["']${table}["']`).test(src) ||
      new RegExp(`\\b(?:FROM|JOIN|INTO|UPDATE)\\s+${table}\\b`).test(src);
    if (!queriesIt) continue;

    if (
      new RegExp(
        `hasColumn\\(\\s*["']${table}["']\\s*,\\s*["']${column}["']`,
      ).test(src)
    ) {
      continue;
    }
    if (GRANDFATHERED_COLUMNS.has(key)) {
      grandfatheredCols++;
      continue;
    }
    problems.push(
      `${file} uses "${key}" (added by ${from}) with no hasColumn() guard — ` +
        "ER_BAD_FIELD_ERROR until that migration is run",
    );
  }
}

rows.push(
  `  ${ADDED_COLUMNS.size} columns arrive by hand, ${grandfatheredCols} grandfathered uses skipped`,
);

rows.push(
  `  ${ADDED.size} tables arrive by hand: ${[...ADDED.keys()].sort().join(", ")}`,
);
rows.push(
  `  ${pages.length} pages checked, ${grandfathered} grandfathered reads skipped`,
);

// A grandfathered entry that no longer exists is a stale exemption, and a
// stale exemption is how a rule quietly stops applying.
for (const t of GRANDFATHERED) {
  if (!ADDED.has(t)) {
    problems.push(
      `"${t}" is grandfathered but no migration creates it — remove it from the list`,
    );
  }
}

// ---------------------------------------------------------------------------
// The server is MySQL 8.0, which has no IF NOT EXISTS for columns, indexes or
// foreign keys — that is MariaDB. MySQL rejects it with a parse error, so a
// migration written that way does NOTHING and says nothing useful about it.
// Two files were written that way; one of them meant the teacher column never
// appeared on the live database while everyone believed it had.
for (const f of fs.readdirSync("migration")) {
  if (!f.endsWith(".sql")) continue;
  // Comments only, stripped: these files EXPLAIN the forbidden syntax in
  // prose, and a check that fires on its own documentation is a check people
  // learn to ignore.
  const sql = fs
    .readFileSync(path.join("migration", f), "utf8")
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");
  const bad = [
    [/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/i, "ADD COLUMN IF NOT EXISTS"],
    [/DROP\s+COLUMN\s+IF\s+EXISTS/i, "DROP COLUMN IF EXISTS"],
    [/ADD\s+(?:UNIQUE\s+)?(?:INDEX|KEY)\s+IF\s+NOT\s+EXISTS/i, "ADD INDEX IF NOT EXISTS"],
    [/DROP\s+(?:INDEX|KEY)\s+IF\s+EXISTS/i, "DROP INDEX IF EXISTS"],
    [/ADD\s+CONSTRAINT\s+IF\s+NOT\s+EXISTS/i, "ADD CONSTRAINT IF NOT EXISTS"],
  ] as const;
  for (const [re, what] of bad) {
    if (re.test(sql)) {
      problems.push(
        `migration/${f} uses "${what}" — MariaDB syntax that MySQL 8 rejects ` +
          "outright, so the file silently does nothing. Ask information_schema " +
          "and PREPARE the statement instead (see add-message-teacher.sql)",
      );
    }
  }
}
rows.push("  ok    no migration uses MariaDB-only IF [NOT] EXISTS syntax");

// The guard is only useful if it answers without throwing.
const guardSrc = fs.readFileSync("lib/mysql/has-table.ts", "utf8");
if (!/information_schema\.tables/i.test(guardSrc)) {
  problems.push("hasTable no longer asks the database whether the table exists");
}
if (!/export const hasColumn/.test(guardSrc)) {
  problems.push("hasColumn is gone — added columns can no longer be guarded");
}
if (!/cache\(/.test(guardSrc)) {
  problems.push(
    "hasTable is no longer memoised — a page asking about three tables would query three times per render",
  );
}

if (problems.length === 0) {
  rows.push("  ok    every hand-applied table is read behind a guard");
}

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);
