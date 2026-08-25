// The rules in lib/uploads.ts, exercised.
//
//   node_modules/.bin/jiti scripts/check-uploads.mts
//
// This is the first code on the site that takes a file from a person, and the
// two ways it could go badly wrong — writing outside the upload directory, and
// serving something the browser will execute in our origin — are both silent
// when they break. Neither shows up in a page that looks fine.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  MAX_UPLOAD_BYTES,
  displayName,
  humanSize,
  isAllowedType,
  pathForStored,
  readFile,
  removeFile,
  servesInline,
  storeFile,
  uploadDir,
} from "../lib/uploads.ts";

const problems: string[] = [];
const check = (ok: boolean, what: string) => {
  if (!ok) problems.push(what);
};

// Keep the real upload directory out of it.
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "upload-check-"));
process.env.UPLOAD_DIR = sandbox;

/* ------------------------------------------------- names that must not pass */

// Every one of these is a name a browser can be made to send.
const nasty = [
  "../../server.js",
  "..\\..\\.env.local",
  "/etc/passwd",
  "....//....//etc/passwd",
  ".env.local",
  "....",
  "",
];
for (const raw of nasty) {
  const shown = displayName(raw);
  check(
    !shown.includes("/") && !shown.includes("\\"),
    `displayName("${raw}") kept a path separator: "${shown}"`,
  );
  check(!shown.startsWith("."), `displayName("${raw}") kept a leading dot: "${shown}"`);
  check(shown.length > 0, `displayName("${raw}") produced nothing`);
}
check(
  displayName("a" + String.fromCharCode(0) + "b.png") === "ab.png",
  "displayName let a NUL byte through",
);
check(
  displayName("photo.png") === "photo.png",
  "displayName mangled an ordinary name",
);

/* ------------------------------------------- stored names that must not pass */

const forged = [
  "../escape.png",
  "..%2Fescape.png",
  "/etc/passwd",
  "nice-try",
  "0123.png",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png/../../x",
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa..png",
];
for (const name of forged) {
  let threw = false;
  try {
    pathForStored(name);
  } catch {
    threw = true;
  }
  check(threw, `pathForStored accepted a forged name: "${name}"`);
}
// And the shape this module actually generates must resolve.
let realResolved = true;
try {
  pathForStored("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png");
} catch {
  realResolved = false;
}
check(realResolved, "pathForStored rejected a name it generates itself");

/* ------------------------------------------------------------ what may store */

check(isAllowedType("application/pdf", "worksheet.pdf"), "a PDF was refused");
check(isAllowedType("image/png", "photo.png"), "a PNG was refused");
check(isAllowedType("", "answer.py"), "a .py with no type was refused");
check(isAllowedType("", "main.cpp"), "a .cpp with no type was refused");
check(!isAllowedType("application/x-msdownload", "virus.exe"), "an .exe was allowed");
check(!isAllowedType("", "run.sh"), "a shell script was allowed");

/* ------------------------------------------------------ what may show inline */

check(servesInline("application/pdf"), "a PDF should show inline");
check(servesInline("image/png"), "a PNG should show inline");
// The whole point: these are storable but must never render in our origin.
check(!servesInline("image/svg+xml"), "SVG must not be shown inline — it can carry script");
check(!servesInline("text/html"), "HTML must not be shown inline");
check(!servesInline("application/octet-stream"), "unknown types must not be shown inline");

/* --------------------------------------------------------------- round trip */

const body = Buffer.from("print('hello')\n", "utf8");
const stored = await storeFile(body, "text/plain", "answer.py");
check(stored.bytes === body.byteLength, "storeFile reported the wrong size");
check(
  fs.existsSync(path.join(sandbox, stored.storedName)),
  "storeFile did not write into UPLOAD_DIR",
);
check(
  path.dirname(path.resolve(pathForStored(stored.storedName))) === path.resolve(sandbox),
  "the stored file landed outside UPLOAD_DIR",
);
check(
  (await readFile(stored.storedName)).equals(body),
  "readFile did not return what storeFile wrote",
);
await removeFile(stored.storedName);
check(
  !fs.existsSync(path.join(sandbox, stored.storedName)),
  "removeFile left the file behind",
);
// Removing something that is already gone must not throw.
await removeFile(stored.storedName);

/* ------------------------------------------------------------- the limits */

for (const [data, mime, name, why] of [
  [Buffer.alloc(0), "text/plain", "empty.txt", "an empty file"],
  [Buffer.alloc(MAX_UPLOAD_BYTES + 1), "application/pdf", "huge.pdf", "an oversized file"],
  [Buffer.from("x"), "application/x-msdownload", "virus.exe", "a forbidden type"],
] as const) {
  let refused = false;
  try {
    await storeFile(data as Buffer, mime, name);
  } catch {
    refused = true;
  }
  check(refused, `storeFile accepted ${why}`);
}
// Exactly at the limit is fine.
const atLimit = await storeFile(
  Buffer.alloc(MAX_UPLOAD_BYTES),
  "application/pdf",
  "big.pdf",
);
await removeFile(atLimit.storedName);

check(humanSize(900) === "900 B", "humanSize is wrong for bytes");
check(humanSize(2048) === "2 KB", "humanSize is wrong for kilobytes");
check(humanSize(3 * 1048576) === "3.0 MB", "humanSize is wrong for megabytes");

check(uploadDir() === sandbox, "uploadDir ignored UPLOAD_DIR");

fs.rmSync(sandbox, { recursive: true, force: true });

console.log(`upload limit: ${humanSize(MAX_UPLOAD_BYTES)}`);
if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems) console.log("  " + p);
  process.exit(1);
}
console.log("\nno problems");
