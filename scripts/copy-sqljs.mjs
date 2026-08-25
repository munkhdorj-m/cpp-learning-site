// Copy SQLite-in-the-browser into public/ so the site does not fetch it from
// a CDN.
//   node scripts/copy-sqljs.mjs      (runs automatically via "prebuild")
//
// Same reasoning as copy-monaco.mjs: a school network that blocks jsdelivr
// would leave the SQL playground permanently "loading". These two files are
// all sql.js needs — the loader shim and the WebAssembly build of SQLite —
// and public/ ships in the deploy tarball.
//
// Nothing imports sql.js from application code. The browser loads
// /sql-wasm/sql-wasm.js at runtime, which is why sql.js is a devDependency:
// it is a source of two static files, not a runtime dependency. Bundling it
// instead would drag emscripten's node shims (fs, path, crypto) into the
// client build for no gain.
//
// Regenerated on every build rather than committed: 700 KB of vendor output
// that would otherwise churn in git on every version bump.

import fs from "node:fs";
import path from "node:path";

const SRC = path.join("node_modules", "sql.js", "dist");
const DEST = path.join("public", "sql-wasm");
const FILES = ["sql-wasm.js", "sql-wasm.wasm"];

if (!fs.existsSync(SRC)) {
  console.error(`sql.js not found at ${SRC} — run npm install.`);
  process.exit(1);
}

// Start clean so an upgrade cannot leave the old wasm beside the new shim.
fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

let bytes = 0;
for (const name of FILES) {
  const from = path.join(SRC, name);
  if (!fs.existsSync(from)) {
    console.error(`sql.js is missing ${name} — expected it in ${SRC}.`);
    process.exit(1);
  }
  const to = path.join(DEST, name);
  fs.copyFileSync(from, to);
  bytes += fs.statSync(to).size;
}

const version = JSON.parse(
  fs.readFileSync(path.join("node_modules", "sql.js", "package.json")),
).version;

console.log(
  `sql.js ${version} -> ${DEST}  (${FILES.length} files, ` +
    `${(bytes / 1024).toFixed(0)} KB)`,
);
