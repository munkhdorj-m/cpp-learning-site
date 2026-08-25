// Copy the editor into public/ so the site does not fetch it from a CDN.
//   node scripts/copy-monaco.mjs      (runs automatically via "prebuild")
//
// @monaco-editor/react does not bundle Monaco. Its loader pulls it from
// https://cdn.jsdelivr.net/npm/monaco-editor@<version>/min/vs at runtime, and
// that URL was baked into the built chunks. On a school network that blocks
// the CDN the editor never appears -- the student just sees the loading dots
// forever, on the one page that is supposed to be the IDE.
//
// So we serve it ourselves. public/ ships in the deploy tarball, and
// code-editor.tsx points the loader at /monaco/vs.
//
// Regenerated on every build rather than committed: it is 7 MB of vendor
// output that would otherwise sit in git forever and churn on each bump.

import fs from "node:fs";
import path from "node:path";

const SRC = path.join("node_modules", "monaco-editor", "min", "vs");
const DEST = path.join("public", "monaco", "vs");

// Monaco starts a language worker only when a model of that language exists,
// and this site only ever creates cpp and python models. ts.worker alone is
// 6.7 MB -- two thirds of everything under assets/ -- and would never once be
// requested. editor.worker is the shared one and must stay.
const UNUSED_WORKER = /^(ts|css|html|json)\.worker-/;

if (!fs.existsSync(SRC)) {
  console.error(
    `monaco-editor not found at ${SRC}.\n` +
      `It is a peer dependency of @monaco-editor/react -- run npm install.`,
  );
  process.exit(1);
}

let copied = 0;
let skipped = 0;
let bytes = 0;

/** @param {string} from @param {string} to */
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dest);
    } else if (UNUSED_WORKER.test(entry.name)) {
      skipped++;
    } else {
      fs.copyFileSync(src, dest);
      bytes += fs.statSync(dest).size;
      copied++;
    }
  }
}

// Start clean so a Monaco upgrade cannot leave last version's hashed chunks
// lying around next to the new ones.
fs.rmSync(path.join("public", "monaco"), { recursive: true, force: true });
copyDir(SRC, DEST);

const version = JSON.parse(
  fs.readFileSync(path.join("node_modules", "monaco-editor", "package.json")),
).version;

console.log(
  `monaco ${version} -> ${DEST}  (${copied} files, ` +
    `${(bytes / 1048576).toFixed(1)} MB, ${skipped} unused workers skipped)`,
);
