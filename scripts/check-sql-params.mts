// Every parameterised query has as many parameters as it has placeholders.
//
//   node_modules/.bin/jiti scripts/check-sql-params.mts
//
// mysql2 does not check this until it executes, and there is no test database
// reachable from a laptop, so a query with one `?` too many is invisible until
// a student opens the page and gets "Incorrect arguments to
// mysqld_stmt_execute". This reads the source instead.
//
// Deliberately conservative. Anything it cannot count for certain — a spread,
// a variable holding the parameters, a `${}` inside the SQL that might carry
// its own placeholders — is REPORTED AS SKIPPED rather than guessed at, so a
// clean run never means "everything was checked", only "nothing countable was
// wrong". scripts/check-assignments.mts covers the assembled query that this
// one has to skip.
import fs from "node:fs";
import path from "node:path";

const ROOTS = ["app", "lib", "components"];
const problems: string[] = [];
const skipped: string[] = [];
let checked = 0;

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

/** The text between `open` and its matching close, respecting nesting and quotes. */
function balanced(src: string, start: number): { body: string; end: number } | null {
  const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const openCh = src[start];
  const closeCh = pairs[openCh];
  let depth = 0;
  let i = start;
  let quote: string | null = null;
  while (i < src.length) {
    const c = src[i];
    const prev = src[i - 1];
    if (quote) {
      if (c === quote && prev !== "\\") quote = null;
      // Template interpolation can contain anything; treat it as opaque.
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c;
    } else if (c === openCh) {
      depth++;
    } else if (c === closeCh) {
      depth--;
      if (depth === 0) return { body: src.slice(start + 1, i), end: i };
    }
    i++;
  }
  return null;
}

/** Split on commas that are not inside brackets, parens, braces or quotes. */
function topLevelSplit(src: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const prev = src[i - 1];
    if (quote) {
      if (c === quote && prev !== "\\") quote = null;
    } else if (c === '"' || c === "'" || c === "`") {
      quote = c;
    } else if ("([{".includes(c)) {
      depth++;
    } else if (")]}".includes(c)) {
      depth--;
    } else if (c === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    const src = fs.readFileSync(file, "utf8");
    // `query(` or `query<Row>(`
    const re = /\bquery\s*(?:<[^>]*>)?\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const open = m.index + m[0].length - 1;
      const call = balanced(src, open);
      if (!call) continue;
      const args = topLevelSplit(call.body);
      const where = `${file}:${src.slice(0, m.index).split("\n").length}`;

      if (args.length === 0) continue;
      const sqlArg = args[0];

      // Only count a literal we can see all of.
      const isLiteral = /^[`'"]/.test(sqlArg);
      if (!isLiteral) {
        skipped.push(`${where} — SQL is not a literal`);
        continue;
      }
      if (sqlArg.startsWith("`") && sqlArg.includes("${")) {
        skipped.push(`${where} — SQL interpolates, placeholders not countable`);
        continue;
      }

      // Strip quoted text so a '?' inside a string is not counted.
      const holes = (
        sqlArg.replace(/'[^']*'/g, "''").match(/\?/g) ?? []
      ).length;

      if (args.length === 1) {
        if (holes > 0) {
          problems.push(`${where} — ${holes} placeholders but no parameters passed`);
        } else {
          checked++;
        }
        continue;
      }

      const paramArg = args[1];
      if (!paramArg.startsWith("[")) {
        skipped.push(`${where} — parameters are not an inline array`);
        continue;
      }
      if (paramArg.includes("...")) {
        skipped.push(`${where} — parameters use a spread`);
        continue;
      }
      const inner = balanced(paramArg, 0);
      if (!inner) {
        skipped.push(`${where} — could not read the parameter array`);
        continue;
      }
      const count = topLevelSplit(inner.body).length;
      if (count !== holes) {
        problems.push(
          `${where} — ${holes} placeholders but ${count} parameters`,
        );
      } else {
        checked++;
      }
    }
  }
}

console.log(`counted ${checked} queries, skipped ${skipped.length}`);
for (const s of skipped) console.log("  skip  " + s);
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);
