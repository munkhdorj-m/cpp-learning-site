// Nothing enormous ships in public/.
//
//   node_modules/.bin/jiti scripts/check-asset-weight.mts
//
// The landing page was serving three 2.5 MB PNGs — 2000x2000 masters rendered
// at 160x200 — which made a cold load 5.9 seconds and 7.5 MB. On a school
// connection that is the difference between a site that opens and one that
// hangs. Nobody noticed because nothing measured it.
//
// next/image would normally shrink them, but that needs `sharp` installed in
// production, and cPanel installs production dependencies only. Serving a file
// that is already the right size does not depend on any of that.
import fs from "node:fs";
import path from "node:path";

/** Anything bigger than this in public/ needs a reason. */
const LIMIT_KB = 400;

/**
 * Vendored runtimes, shipped whole on purpose. Monaco is the code editor and
 * sql-wasm is the SQLite build for the Cambridge pages; both are loaded on
 * demand by the pages that need them, never on the landing page.
 */
const VENDORED = ["monaco", "sql-wasm"];

const problems: string[] = [];
const rows: string[] = [];

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (VENDORED.includes(e.name)) continue;
      walk(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

const files = walk("public");
const heavy = files
  .map((f) => ({ f, kb: fs.statSync(f).size / 1024 }))
  .filter((x) => x.kb > LIMIT_KB)
  .sort((a, b) => b.kb - a.kb);

const total = files.reduce((n, f) => n + fs.statSync(f).size, 0);
rows.push(
  `  ${files.length} files in public/ (excluding ${VENDORED.join(", ")}), ${(total / 1024 / 1024).toFixed(2)} MB total`,
);

for (const h of heavy) {
  problems.push(
    `${h.f} is ${h.kb.toFixed(0)} KB — over the ${LIMIT_KB} KB limit. ` +
      "Resize it to the size it is displayed at and save it as WebP.",
  );
}
if (!heavy.length) rows.push(`  ok    nothing over ${LIMIT_KB} KB`);

// The landing page is the one everybody loads first, and the one that was
// broken. Its images are named here so a regression is caught by name.
const landing = fs.readFileSync("app/page.tsx", "utf8");
for (const m of landing.matchAll(/src="(\/[^"]+\.(png|jpe?g|gif|webp|avif))"/g)) {
  const file = path.join("public", m[1]);
  if (!fs.existsSync(file)) {
    problems.push(`app/page.tsx references ${m[1]}, which is not in public/`);
    continue;
  }
  const kb = fs.statSync(file).size / 1024;
  const ok = kb <= 120;
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${m[1]}  ${kb.toFixed(0)} KB`);
  if (!ok) {
    problems.push(
      `${m[1]} is ${kb.toFixed(0)} KB on the landing page — every visitor pays for it`,
    );
  }
}

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);
