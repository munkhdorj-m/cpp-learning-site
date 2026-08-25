// Syntax-checks every Python snippet inside lib/lesson-sections.ts.
//
// Section snippets are deliberately fragments, so they are not run — only
// parsed. A parse error here means a real typo, not a missing surrounding
// program.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { LESSON_SECTIONS } from "../lib/lesson-sections.ts";

const snippets: { where: string; code: string }[] = [];
for (const [slug, sections] of Object.entries(LESSON_SECTIONS)) {
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.kind === "code" && b.py)
        snippets.push({ where: `${slug}/${s.id}`, code: b.py });
    }
  }
}

const checker = `
import ast, json, sys
bad = []
with open(sys.argv[1], encoding="utf-8") as f:
    items = json.load(f)
for item in items:
    try:
        ast.parse(item["code"])
    except SyntaxError as e:
        bad.append(f'{item["where"]}: line {e.lineno} - {e.msg}')
print(json.dumps(bad))
`;

// Hand the snippets over in a UTF-8 file: Python on Windows reads stdin as
// cp1252 and mangles the Mongolian comments inside the examples.
const tmp = path.join(os.tmpdir(), "section-python.json");
fs.writeFileSync(tmp, JSON.stringify(snippets), "utf8");
const out = execFileSync("python", ["-c", checker, tmp], { encoding: "utf8" });
fs.unlinkSync(tmp);
const bad: string[] = JSON.parse(out);

console.log(`python snippets in sections: ${snippets.length}`);
if (bad.length) {
  console.log(`${bad.length} do not parse:`);
  for (const b of bad) console.log("  " + b);
  process.exit(1);
}
console.log("all parse");
