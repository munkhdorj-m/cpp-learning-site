// Runs everything the SQL feature ships against real SQLite.
//
//   node_modules/.bin/jiti scripts/check-sql.mts
//
// The seed script, all ten playground examples and every model answer in the
// practice exercise. A typo in a model answer is otherwise invisible until a
// student writes the right query and is told they are wrong, and the marking
// rules (case-insensitive column names, order only when the task asked for
// one) are the kind of thing that quietly regresses.
//
// sql.js is a devDependency and this is a build-time script, so here it is
// imported directly. The browser gets it from public/ instead — see
// scripts/copy-sqljs.mjs.
import initSqlJs from "sql.js";

import {
  SEED_SQL,
  SQL_EXAMPLES,
  TABLES,
  readSchema,
  runOneQuery,
  runScript,
  sameResult,
  type SqlDatabase,
} from "../lib/cambridge/sql-db.ts";
import { SQL_TASKS } from "../lib/cambridge/sql-tasks.ts";

const SQL = await initSqlJs();
const problems: string[] = [];

/**
 * Lower-case the keywords and identifiers, but not the values.
 *
 * Lower-casing a whole query changes what it means: SQLite compares TEXT with
 * `=` case-sensitively, so `'Ariun'` and `'ariun'` are different values and a
 * query that matched rows would stop matching them. Only the SQL around the
 * quotes is case-insensitive.
 */
function lowerKeywords(sql: string): string {
  return sql.replace(/'[^']*'|[^']+/g, (part) =>
    part.startsWith("'") ? part : part.toLowerCase(),
  );
}

/** A database with the sample school data, fresh every time. */
function seeded(): SqlDatabase {
  const db = new SQL.Database();
  db.run(SEED_SQL);
  return db as unknown as SqlDatabase;
}

/* ------------------------------------------------------------- the seed */

let db: SqlDatabase;
try {
  db = seeded();
} catch (e) {
  console.log(`the seed script does not run: ${e}`);
  process.exit(1);
}

for (const [table, want] of [
  ["Class", 3],
  ["Student", 10],
  ["Grade", 40],
] as const) {
  const got = runOneQuery(db, `SELECT COUNT(*) AS n FROM ${table}`).rows[0][0];
  if (got !== want) problems.push(`${table} seeded ${got} rows, expected ${want}`);
}

/* --------------------------------------------------------- the examples */

for (const ex of SQL_EXAMPLES) {
  // A fresh database each time: several examples INSERT, UPDATE or DELETE.
  const fresh = seeded();
  const outcome = runScript(fresh, ex.sql);
  if (outcome.error) {
    problems.push(`example "${ex.name}" failed: ${outcome.error}`);
  } else if (outcome.statements.length === 0) {
    problems.push(`example "${ex.name}" ran nothing`);
  } else if (!outcome.statements.some((s) => s.result)) {
    problems.push(`example "${ex.name}" returns no rows to look at`);
  }
  if (!ex.about) problems.push(`example "${ex.name}" has no explanation`);
  fresh.close();
}

/* ------------------------------------------------------------- the tasks */

for (const [i, task] of SQL_TASKS.entries()) {
  const where = `task ${i + 1} ("${task.ask.slice(0, 45)}…")`;
  const ordered = /ORDER\s+BY/i.test(task.solution);

  let want;
  try {
    want = runOneQuery(db, task.solution);
  } catch (e) {
    problems.push(`${where}: the model answer does not run — ${e}`);
    continue;
  }

  if (want.rows.length === 0)
    problems.push(`${where}: the model answer returns no rows`);

  // A model answer must mark itself right, whatever the ordering rule.
  if (!sameResult(want, want, ordered))
    problems.push(`${where}: the model answer does not match itself`);

  // The same query in lowercase must still mark right: SQLite names columns
  // exactly as the query spelled them, so this is the case that used to fail.
  const lower = runOneQuery(db, lowerKeywords(task.solution));
  if (!sameResult(lower, want, ordered))
    problems.push(`${where}: the same query in lowercase is marked wrong`);

  // And something plainly different must not.
  const other = runOneQuery(db, "SELECT ClassID AS a FROM Class");
  if (sameResult(other, want, ordered))
    problems.push(`${where}: an unrelated query is marked right`);
}

/* ------------------------------------------------ the marking rules */

const asc = runOneQuery(db, "SELECT FirstName FROM Student ORDER BY FirstName");
const desc = runOneQuery(
  db,
  "SELECT FirstName FROM Student ORDER BY FirstName DESC",
);
if (sameResult(asc, desc, true))
  problems.push("marking: a reversed order is accepted when order matters");
if (!sameResult(asc, desc, false))
  problems.push("marking: the same rows are rejected when order does not matter");

const oneCol = runOneQuery(db, "SELECT FirstName FROM Student");
const twoCol = runOneQuery(db, "SELECT FirstName, LastName FROM Student");
if (sameResult(oneCol, twoCol, false))
  problems.push("marking: a different number of columns is accepted");

const renamed = runOneQuery(db, "SELECT FirstName AS Nickname FROM Student");
if (sameResult(renamed, oneCol, false))
  problems.push("marking: a differently named column is accepted");

/* ------------------------------------------------------ the schema panel */

// The panel beside the editor reads the live database; the practice exercise
// still shows the documented TABLES. They have to agree, or the two halves of
// the site describe different databases.
const live = readSchema(db);
if (live.length !== TABLES.length)
  problems.push(
    `schema: readSchema found ${live.length} tables, TABLES documents ${TABLES.length}`,
  );
for (const want of TABLES) {
  const got = live.find((t) => t.name === want.name);
  if (!got) {
    problems.push(`schema: readSchema did not find ${want.name}`);
    continue;
  }
  const gotCols = got.columns.map((c) => `${c.name} ${c.type} ${c.note ?? ""}`.trim());
  const wantCols = want.columns.map((c) => `${c.name} ${c.type} ${c.note ?? ""}`.trim());
  if (gotCols.join(" | ") !== wantCols.join(" | "))
    problems.push(
      `schema: ${want.name} reads as [${gotCols.join(", ")}] but TABLES says [${wantCols.join(", ")}]`,
    );
}

// An empty database is what Clear gives you.
const blank = new SQL.Database() as unknown as SqlDatabase;
if (readSchema(blank).length !== 0)
  problems.push("schema: a brand new database is not empty");

// And the panel has to follow CREATE and DROP.
runScript(blank, "CREATE TABLE Pets (PetID INTEGER PRIMARY KEY, Name TEXT)");
const afterCreate = readSchema(blank);
if (afterCreate.length !== 1 || afterCreate[0].name !== "Pets")
  problems.push("schema: a CREATE TABLE does not show up");
else if (afterCreate[0].columns[0].note !== "primary key")
  problems.push("schema: the primary key is not marked");
runScript(blank, "DROP TABLE Pets");
if (readSchema(blank).length !== 0)
  problems.push("schema: a DROP TABLE still shows up");
blank.close();

/* -------------------------------------------------------- row counting */

// SQLite's change counter keeps the last DML statement's number, so reading it
// after DDL reports a row count that has nothing to do with the statement —
// which is how "DROP TABLE … Done. 15 rows changed" reached the screen.
const counting = seeded();
const ddl = runScript(
  counting,
  "DELETE FROM Grade WHERE Mark < 50; CREATE TABLE Tmp (a INTEGER); DROP TABLE Tmp;",
);
if (ddl.error) problems.push(`counting: script failed — ${ddl.error}`);
const [del, create, drop] = ddl.statements;
// Two marks are under 50: Bold's 43 in Computer Science and 47 in English.
if (del?.changed !== 2)
  problems.push(`counting: the DELETE reported ${del?.changed}, expected 2`);
if (create?.changed !== undefined)
  problems.push(`counting: CREATE TABLE reported a row count (${create?.changed})`);
if (drop?.changed !== undefined)
  problems.push(`counting: DROP TABLE reported a row count (${drop?.changed})`);
counting.close();

db.close();

console.log(`examples: ${SQL_EXAMPLES.length}`);
console.log(`practice tasks: ${SQL_TASKS.length}`);

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nno problems");
