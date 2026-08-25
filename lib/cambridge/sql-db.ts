// SQL that actually runs, in the browser.
//
// The syllabus examines SQL on paper, so students write a great deal of it and
// never once see a result set. This gives them a real database to type into.
//
// It is SQLite (sql.js) rather than a parser of our own, because every gap in
// such a parser would reach a student as "your correct query is wrong". A real
// engine gives real results and real error messages, and covers the whole
// syllabus subset: JOIN, GROUP BY, aggregate functions, INSERT, UPDATE,
// DELETE, CREATE TABLE.
//
// One engine, one database: the practice exercise inside a syllabus topic
// marks against this too, so the two can never disagree about a query.
//
// Nothing here imports sql.js. The browser loads /sql-wasm/sql-wasm.js, which
// scripts/copy-sqljs.mjs puts there — see the note in that file.

export type SqlValue = string | number | Uint8Array | null;

export interface QueryResult {
  columns: string[];
  rows: SqlValue[][];
}

/** What one statement of a script did. */
export interface StatementOutcome {
  sql: string;
  /** Present when the statement returned rows. */
  result?: QueryResult;
  /**
   * Rows touched, for INSERT, UPDATE and DELETE only.
   *
   * SQLite's change counter reports the most recent statement that modified
   * rows, and DDL does not reset it — so reading it after a CREATE or DROP
   * repeats whatever the last INSERT did. That is where "DROP TABLE … Done.
   * 15 rows changed" came from. Undefined here means "this statement does not
   * have a row count", which is the truth for CREATE, DROP, ALTER and PRAGMA.
   */
  changed?: number;
}

export interface ScriptOutcome {
  statements: StatementOutcome[];
  /** SQLite's own message, which is usually the most useful thing on screen. */
  error?: string;
}

/* --------------------------------------------------------- the sample data */

export interface TableInfo {
  name: string;
  columns: { name: string; type: string; note?: string }[];
  /** A CREATE VIEW rather than a CREATE TABLE. Only set by readSchema. */
  isView?: boolean;
}

/**
 * A school database, close enough to the ones the exam uses that a student can
 * try a past-paper question here and get the same shape of answer.
 */
export const TABLES: TableInfo[] = [
  {
    name: "Class",
    columns: [
      { name: "ClassID", type: "TEXT", note: "primary key" },
      { name: "ClassName", type: "TEXT" },
      { name: "Teacher", type: "TEXT" },
    ],
  },
  {
    name: "Student",
    columns: [
      { name: "StudentID", type: "INTEGER", note: "primary key" },
      { name: "FirstName", type: "TEXT" },
      { name: "LastName", type: "TEXT" },
      { name: "ClassID", type: "TEXT", note: "-> Class" },
      { name: "DateOfBirth", type: "TEXT" },
      { name: "House", type: "TEXT" },
    ],
  },
  {
    name: "Grade",
    columns: [
      { name: "GradeID", type: "INTEGER", note: "primary key" },
      { name: "StudentID", type: "INTEGER", note: "-> Student" },
      { name: "Subject", type: "TEXT" },
      { name: "Mark", type: "INTEGER" },
      { name: "TermNo", type: "INTEGER" },
    ],
  },
];

/** Shown to students as well as run, so the data is never a mystery box. */
export const SEED_SQL = `CREATE TABLE Class (
    ClassID   TEXT    PRIMARY KEY,
    ClassName TEXT    NOT NULL,
    Teacher   TEXT    NOT NULL
);

CREATE TABLE Student (
    StudentID   INTEGER PRIMARY KEY,
    FirstName   TEXT    NOT NULL,
    LastName    TEXT    NOT NULL,
    ClassID     TEXT    NOT NULL,
    DateOfBirth TEXT    NOT NULL,
    House       TEXT    NOT NULL,
    FOREIGN KEY (ClassID) REFERENCES Class(ClassID)
);

CREATE TABLE Grade (
    GradeID   INTEGER PRIMARY KEY,
    StudentID INTEGER NOT NULL,
    Subject   TEXT    NOT NULL,
    Mark      INTEGER NOT NULL,
    TermNo    INTEGER NOT NULL,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);

INSERT INTO Class VALUES ('9A',  'Year 9 Alpha',  'Bayarmaa');
INSERT INTO Class VALUES ('10B', 'Year 10 Beta',  'Ganbold');
INSERT INTO Class VALUES ('11C', 'Year 11 Gamma', 'Oyunaa');

INSERT INTO Student VALUES (1,  'Bat',      'Erdene',  '9A',  '2011-03-14', 'Ariun');
INSERT INTO Student VALUES (2,  'Saraa',    'Dorj',    '10B', '2010-07-02', 'Erdene');
INSERT INTO Student VALUES (3,  'Tuya',     'Batbold', '9A',  '2011-11-25', 'Ariun');
INSERT INTO Student VALUES (4,  'Nomin',    'Ganbat',  '11C', '2009-01-30', 'Sain');
INSERT INTO Student VALUES (5,  'Oyun',     'Tseren',  '10B', '2010-05-19', 'Erdene');
INSERT INTO Student VALUES (6,  'Bold',     'Munkh',   '9A',  '2011-09-08', 'Sain');
INSERT INTO Student VALUES (7,  'Enkh',     'Baatar',  '10B', '2010-12-11', 'Ariun');
INSERT INTO Student VALUES (8,  'Anu',      'Purev',   '11C', '2009-04-23', 'Erdene');
INSERT INTO Student VALUES (9,  'Temuulen', 'Sukh',    '9A',  '2011-06-17', 'Sain');
INSERT INTO Student VALUES (10, 'Khulan',   'Nyam',    '11C', '2009-08-05', 'Ariun');

INSERT INTO Grade VALUES (1,  1,  'Computer Science', 78, 1);
INSERT INTO Grade VALUES (2,  1,  'Mathematics',      65, 1);
INSERT INTO Grade VALUES (3,  1,  'English',          71, 1);
INSERT INTO Grade VALUES (4,  2,  'Computer Science', 55, 1);
INSERT INTO Grade VALUES (5,  2,  'Mathematics',      82, 1);
INSERT INTO Grade VALUES (6,  2,  'English',          60, 1);
INSERT INTO Grade VALUES (7,  3,  'Computer Science', 91, 1);
INSERT INTO Grade VALUES (8,  3,  'Mathematics',      88, 1);
INSERT INTO Grade VALUES (9,  3,  'English',          79, 1);
INSERT INTO Grade VALUES (10, 4,  'Computer Science', 64, 1);
INSERT INTO Grade VALUES (11, 4,  'Mathematics',      59, 1);
INSERT INTO Grade VALUES (12, 4,  'English',          73, 1);
INSERT INTO Grade VALUES (13, 5,  'Computer Science', 72, 1);
INSERT INTO Grade VALUES (14, 5,  'Mathematics',      68, 1);
INSERT INTO Grade VALUES (15, 5,  'English',          85, 1);
INSERT INTO Grade VALUES (16, 6,  'Computer Science', 43, 1);
INSERT INTO Grade VALUES (17, 6,  'Mathematics',      51, 1);
INSERT INTO Grade VALUES (18, 6,  'English',          47, 1);
INSERT INTO Grade VALUES (19, 7,  'Computer Science', 88, 1);
INSERT INTO Grade VALUES (20, 7,  'Mathematics',      74, 1);
INSERT INTO Grade VALUES (21, 7,  'English',          69, 1);
INSERT INTO Grade VALUES (22, 8,  'Computer Science', 96, 1);
INSERT INTO Grade VALUES (23, 8,  'Mathematics',      90, 1);
INSERT INTO Grade VALUES (24, 8,  'English',          84, 1);
INSERT INTO Grade VALUES (25, 9,  'Computer Science', 57, 1);
INSERT INTO Grade VALUES (26, 9,  'Mathematics',      62, 1);
INSERT INTO Grade VALUES (27, 9,  'English',          58, 1);
INSERT INTO Grade VALUES (28, 10, 'Computer Science', 80, 1);
INSERT INTO Grade VALUES (29, 10, 'Mathematics',      77, 1);
INSERT INTO Grade VALUES (30, 10, 'English',          92, 1);

INSERT INTO Grade VALUES (31, 1,  'Computer Science', 83, 2);
INSERT INTO Grade VALUES (32, 2,  'Computer Science', 61, 2);
INSERT INTO Grade VALUES (33, 3,  'Computer Science', 94, 2);
INSERT INTO Grade VALUES (34, 4,  'Computer Science', 70, 2);
INSERT INTO Grade VALUES (35, 5,  'Computer Science', 75, 2);
INSERT INTO Grade VALUES (36, 6,  'Computer Science', 52, 2);
INSERT INTO Grade VALUES (37, 7,  'Computer Science', 90, 2);
INSERT INTO Grade VALUES (38, 8,  'Computer Science', 98, 2);
INSERT INTO Grade VALUES (39, 9,  'Computer Science', 66, 2);
INSERT INTO Grade VALUES (40, 10, 'Computer Science', 81, 2);
`;

export interface SqlExample {
  name: string;
  /** What the query is for, in one line. */
  about: string;
  sql: string;
}

export const SQL_EXAMPLES: SqlExample[] = [
  {
    name: "Every row",
    about: "SELECT * gives you the whole table.",
    sql: `SELECT *\nFROM Student;`,
  },
  {
    name: "Chosen columns, with a condition",
    about: "Pick the columns you need, then filter with WHERE.",
    sql: `SELECT FirstName, LastName, House\nFROM Student\nWHERE House = 'Ariun'\nORDER BY LastName;`,
  },
  {
    name: "A range, and sorting",
    about: "BETWEEN is inclusive at both ends. DESC puts the best first.",
    sql: `SELECT StudentID, Subject, Mark\nFROM Grade\nWHERE Mark BETWEEN 70 AND 89\nORDER BY Mark DESC;`,
  },
  {
    name: "Counting and averaging",
    about: "GROUP BY makes one row per group; the aggregate works inside it.",
    sql: `SELECT Subject,\n       COUNT(*)  AS Entries,\n       AVG(Mark) AS AverageMark,\n       MAX(Mark) AS BestMark\nFROM Grade\nWHERE TermNo = 1\nGROUP BY Subject;`,
  },
  {
    name: "Joining two tables",
    about: "The ON clause says which column links the two tables.",
    sql: `SELECT Student.FirstName, Student.LastName, Class.ClassName, Class.Teacher\nFROM Student\nINNER JOIN Class ON Student.ClassID = Class.ClassID\nORDER BY Class.ClassName, Student.LastName;`,
  },
  {
    name: "Joining three, with a group",
    about: "Each student's average across every subject, best first.",
    sql: `SELECT Student.FirstName,\n       Student.LastName,\n       ROUND(AVG(Grade.Mark), 1) AS Average\nFROM Student\nINNER JOIN Grade ON Grade.StudentID = Student.StudentID\nGROUP BY Student.StudentID\nHAVING AVG(Grade.Mark) >= 70\nORDER BY Average DESC;`,
  },
  {
    name: "Searching text",
    about: "LIKE with % matches any run of characters.",
    sql: `SELECT FirstName, LastName\nFROM Student\nWHERE LastName LIKE 'B%';`,
  },
  {
    name: "Adding a row",
    about: "INSERT changes the table. Run the SELECT after it to see the change.",
    sql: `INSERT INTO Student\nVALUES (11, 'Sarnai', 'Chuluun', '9A', '2011-02-09', 'Erdene');\n\nSELECT *\nFROM Student\nWHERE ClassID = '9A';`,
  },
  {
    name: "Changing and removing rows",
    about: "Without a WHERE, UPDATE and DELETE hit every row. Press Reset to start over.",
    sql: `UPDATE Grade\nSET Mark = Mark + 5\nWHERE Subject = 'English';\n\nDELETE FROM Grade\nWHERE Mark < 50;\n\nSELECT Subject, COUNT(*) AS Remaining\nFROM Grade\nGROUP BY Subject;`,
  },
  {
    name: "Making your own table",
    about: "You have a whole database here, not just the three tables above.",
    sql: `CREATE TABLE Club (\n    ClubID INTEGER PRIMARY KEY,\n    Name   TEXT NOT NULL,\n    Day    TEXT NOT NULL\n);\n\nINSERT INTO Club VALUES (1, 'Robotics', 'Tuesday');\nINSERT INTO Club VALUES (2, 'Chess',    'Thursday');\n\nSELECT * FROM Club;`,
  },
];

/* ------------------------------------------------------------ the engine */

/** Only the slice of sql.js this module touches. */
interface SqlStatement {
  getColumnNames(): string[];
  step(): boolean;
  get(): SqlValue[];
  getSQL(): string;
  free(): void;
}

interface SqlDatabase {
  run(sql: string): void;
  iterateStatements(sql: string): Iterable<SqlStatement>;
  getRowsModified(): number;
  close(): void;
}

interface SqlJsStatic {
  Database: new () => SqlDatabase;
}

type InitSqlJs = (config: {
  locateFile: (file: string) => string;
}) => Promise<SqlJsStatic>;

declare global {
  interface Window {
    initSqlJs?: InitSqlJs;
  }
}

const SCRIPT_SRC = "/sql-wasm/sql-wasm.js";

let enginePromise: Promise<SqlJsStatic> | null = null;

/**
 * Fetch and start SQLite, once per page.
 *
 * Loaded with a script tag rather than an import so the 645 KB of wasm is
 * never part of the JavaScript bundle — a student who never opens this page
 * should not pay for it.
 */
export function loadSqlEngine(): Promise<SqlJsStatic> {
  if (enginePromise) return enginePromise;

  enginePromise = new Promise<SqlJsStatic>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("The SQL engine only runs in a browser."));
      return;
    }
    if (window.initSqlJs) {
      resolve(window.initSqlJs({ locateFile: (f) => `/sql-wasm/${f}` }));
      return;
    }

    const tag = document.createElement("script");
    tag.src = SCRIPT_SRC;
    tag.async = true;
    tag.onload = () => {
      if (!window.initSqlJs) {
        reject(new Error("The SQL engine loaded but did not start."));
        return;
      }
      resolve(window.initSqlJs({ locateFile: (f) => `/sql-wasm/${f}` }));
    };
    tag.onerror = () =>
      reject(new Error("Could not download the SQL engine. Check the network."));
    document.head.appendChild(tag);
  }).catch((e) => {
    // Let a later attempt retry rather than caching the failure forever.
    enginePromise = null;
    throw e;
  });

  return enginePromise;
}

/**
 * A fresh database.
 *
 * With `seed` it has the sample school data in it; without, it is completely
 * empty, which is what a student wants when they would rather build their own
 * tables than work around ours.
 */
export async function createDatabase(seed = true): Promise<SqlDatabase> {
  const SQL = await loadSqlEngine();
  const db = new SQL.Database();
  if (seed) db.run(SEED_SQL);
  return db;
}

/**
 * The tables that are in the database right now, read from SQLite itself.
 *
 * Asking the database is the only version that cannot go stale. A hard-coded
 * list would leave a student who ran CREATE TABLE with no sign of it, and a
 * student who ran DROP still looking at a table that is gone.
 */
export function readSchema(db: SqlDatabase): TableInfo[] {
  const listing = runScript(
    db,
    "SELECT name, type FROM sqlite_master " +
      "WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' " +
      "ORDER BY type, name",
  );
  const rows = listing.statements[0]?.result?.rows ?? [];

  return rows.map(([rawName, rawType]) => {
    const name = String(rawName);
    // Identifiers are quoted for PRAGMA, and a quote inside a name is doubled.
    const quoted = '"' + name.replace(/"/g, '""') + '"';

    const info =
      runScript(db, `PRAGMA table_info(${quoted})`).statements[0]?.result
        ?.rows ?? [];
    const keys =
      runScript(db, `PRAGMA foreign_key_list(${quoted})`).statements[0]?.result
        ?.rows ?? [];
    // foreign_key_list gives: id, seq, table, from, to, ...
    const pointsAt = new Map(
      keys.map((k) => [String(k[3]), String(k[2])] as const),
    );

    return {
      name,
      isView: String(rawType) === "view",
      // table_info gives: cid, name, type, notnull, dflt_value, pk
      columns: info.map((c) => {
        const colName = String(c[1]);
        const target = pointsAt.get(colName);
        return {
          name: colName,
          type: String(c[2] || ""),
          note: Number(c[5]) > 0 ? "primary key" : target ? `-> ${target}` : undefined,
        };
      }),
    };
  });
}

/** How many rows one statement may return before we stop collecting. */
const ROW_LIMIT = 500;

/** Does this statement have a meaningful row count? See StatementOutcome. */
function changesRows(sql: string): boolean {
  return /^\s*(insert|update|delete|replace)\b/i.test(sql);
}

/**
 * Run a whole script, reporting each statement separately.
 *
 * `iterateStatements` splits the script the way SQLite itself does, so a
 * semicolon inside a string literal cannot break it apart in the wrong place.
 */
export function runScript(db: SqlDatabase, source: string): ScriptOutcome {
  const statements: StatementOutcome[] = [];
  if (!source.trim()) return { statements };

  try {
    for (const stmt of db.iterateStatements(source)) {
      const sql = stmt.getSQL().trim();
      try {
        const columns = stmt.getColumnNames();
        if (columns.length > 0) {
          const rows: SqlValue[][] = [];
          while (stmt.step()) {
            if (rows.length >= ROW_LIMIT) break;
            rows.push(stmt.get());
          }
          statements.push({ sql, result: { columns, rows } });
        } else {
          // Not a query: step it to actually perform the change.
          while (stmt.step()) {
            /* a non-query yields no rows; this just runs it */
          }
          statements.push(
            changesRows(sql)
              ? { sql, changed: db.getRowsModified() }
              : { sql },
          );
        }
      } finally {
        stmt.free();
      }
    }
    return { statements };
  } catch (e) {
    return {
      statements,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Does a student's result match the model answer's?
 *
 * Marking compares the RESULT, never the wording: there is more than one
 * correct way to write nearly every query, and marking on text would fail
 * students who are right.
 *
 * Column names are compared case-insensitively because SQLite reports them
 * exactly as the query spelled them — `select name` yields a column called
 * `name`, and failing a student for lowercase would be nonsense.
 *
 * Row order only has to match when the task asked for an order. Everything is
 * compared through a separator that cannot occur in a value, so ["a", "bc"]
 * and ["ab", "c"] stay different.
 */
export function sameResult(
  got: QueryResult,
  want: QueryResult,
  ordered: boolean,
): boolean {
  if (got.columns.length !== want.columns.length) return false;
  const named = got.columns.every(
    (c, i) => c.toLowerCase() === want.columns[i].toLowerCase(),
  );
  if (!named) return false;
  if (got.rows.length !== want.rows.length) return false;

  // JSON of the row is the comparison key: it keeps types apart, keeps
  // null distinct from the string "null", and cannot run two columns
  // together the way concatenation would ("a","bc" vs "ab","c").
  const line = (r: SqlValue[]) =>
    JSON.stringify(r.map((v) => (v instanceof Uint8Array ? [...v] : v)));
  const a = got.rows.map(line);
  const b = want.rows.map(line);
  if (ordered) return a.every((v, i) => v === b[i]);
  a.sort();
  b.sort();
  return a.every((v, i) => v === b[i]);
}

/** Run one query and hand back just its rows. Throws SQLite's own message. */
export function runOneQuery(db: SqlDatabase, sql: string): QueryResult {
  const outcome = runScript(db, sql);
  if (outcome.error) throw new Error(outcome.error);
  const last = [...outcome.statements].reverse().find((s) => s.result);
  if (!last?.result) throw new Error("That did not return any columns.");
  return last.result;
}

export type { SqlDatabase };
export { ROW_LIMIT };
