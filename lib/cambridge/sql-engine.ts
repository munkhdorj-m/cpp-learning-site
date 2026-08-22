// A deliberately small SQL engine: the slice of SELECT the Cambridge syllabus
// asks students to write, and nothing more.
//
// It lives here rather than inside the practice component so it can be tested
// on its own — marking a student's query wrong because of a parser bug is much
// worse than not offering the exercise at all.

export const COLUMNS = ["StudentID", "Name", "Year", "House", "Mark"] as const;

export type Row = Record<string, string | number>;

export const TABLE: Row[] = [
  { StudentID: 1, Name: "Bat", Year: 9, House: "Ariun", Mark: 78 },
  { StudentID: 2, Name: "Saraa", Year: 10, House: "Erdene", Mark: 55 },
  { StudentID: 3, Name: "Tuya", Year: 9, House: "Ariun", Mark: 91 },
  { StudentID: 4, Name: "Nomin", Year: 11, House: "Sain", Mark: 64 },
  { StudentID: 5, Name: "Oyun", Year: 10, House: "Erdene", Mark: 72 },
  { StudentID: 6, Name: "Bold", Year: 9, House: "Sain", Mark: 43 },
  { StudentID: 7, Name: "Enkh", Year: 10, House: "Ariun", Mark: 88 },
];

export interface Result {
  columns: string[];
  rows: (string | number)[][];
}

/** SELECT … FROM Student [WHERE …] [ORDER BY … [ASC|DESC]] */
export function runQuery(sql: string): Result {
  // Collapse newlines and runs of spaces first, so a query typed over several
  // lines parses the same as a one-liner.
  const m = sql
    .replace(/;\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .match(
      /^SELECT (.+?) FROM (\w+)(?: WHERE (.+?))?(?: ORDER BY (\w+)(?: (ASC|DESC))?)?$/i,
    );
  if (!m)
    throw new Error("Expected: SELECT … FROM Student [WHERE …] [ORDER BY …]");

  const [, colPart, table, wherePart, orderCol, dir] = m;
  if (table.toLowerCase() !== "student")
    throw new Error(`There is no table called "${table}". The table is Student.`);

  const columns =
    colPart.trim() === "*"
      ? [...COLUMNS]
      : colPart.split(",").map((c) => resolveColumn(c.trim()));

  let rows = TABLE.filter((r) => (wherePart ? matches(r, wherePart) : true));

  if (orderCol) {
    const key = resolveColumn(orderCol);
    const sign = dir?.toUpperCase() === "DESC" ? -1 : 1;
    rows = [...rows].sort((a, b) =>
      a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0,
    );
  }

  return { columns, rows: rows.map((r) => columns.map((c) => r[c])) };
}

function resolveColumn(name: string): string {
  const found = COLUMNS.find((c) => c.toLowerCase() === name.toLowerCase());
  if (!found) throw new Error(`There is no column called "${name}".`);
  return found;
}

/** Conditions joined by AND / OR, evaluated left to right. No brackets. */
function matches(row: Row, where: string): boolean {
  const parts = where.split(/ (AND|OR) /i);
  let result = testOne(row, parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    const rhs = testOne(row, parts[i + 1]);
    result = parts[i].toUpperCase() === "AND" ? result && rhs : result || rhs;
  }
  return result;
}

function testOne(row: Row, cond: string): boolean {
  const m = cond.trim().match(/^(\w+) *(<>|!=|>=|<=|=|>|<|LIKE) *(.+)$/i);
  if (!m) throw new Error(`Cannot understand the condition "${cond.trim()}".`);
  const [, col, opRaw, valRaw] = m;
  const key = resolveColumn(col);
  const op = opRaw.toUpperCase();
  const left = row[key];

  const quoted = valRaw.trim().match(/^'(.*)'$|^"(.*)"$/);
  const value = quoted ? (quoted[1] ?? quoted[2]) : Number(valRaw.trim());
  if (!quoted && Number.isNaN(value as number))
    throw new Error("Text values need quotes, like 'Ariun'.");

  if (op === "LIKE") {
    const pattern = new RegExp(
      "^" +
        String(value)
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/%/g, ".*") +
        "$",
      "i",
    );
    return pattern.test(String(left));
  }

  switch (op) {
    case "=":
      return String(left).toLowerCase() === String(value).toLowerCase();
    case "<>":
    case "!=":
      return String(left).toLowerCase() !== String(value).toLowerCase();
    case ">":
      return Number(left) > Number(value);
    case "<":
      return Number(left) < Number(value);
    case ">=":
      return Number(left) >= Number(value);
    default:
      return Number(left) <= Number(value);
  }
}

/**
 * Same columns and same rows. Row order only has to match when the task asked
 * for an order — otherwise any correct query counts, however it sorted.
 */
export function sameResult(got: Result, want: Result, ordered: boolean): boolean {
  if (got.columns.length !== want.columns.length) return false;
  if (!got.columns.every((c, i) => c === want.columns[i])) return false;
  const line = (r: (string | number)[]) => r.join("");
  const a = got.rows.map(line);
  const b = want.rows.map(line);
  if (a.length !== b.length) return false;
  if (ordered) return a.every((v, i) => v === b[i]);
  return [...a].sort().join("") === [...b].sort().join("");
}
