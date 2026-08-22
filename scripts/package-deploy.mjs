// Build + package the app for cPanel deployment.
//   node scripts/package-deploy.mjs
// Produces  ~/Desktop/cppjudge-deploy.tar.gz  ready to upload.
//
// Excludes node_modules (installed on the server), git, caches, the data
// backups/PII, and .env.development.local (local-dev only).

import { execSync, execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { homedir } from "node:os";

const OUT = join(homedir(), "Desktop", "cppjudge-deploy.tar.gz");
// GNU tar treats "C:/path" as a REMOTE HOST named C, so pass a relative,
// forward-slashed path instead — no drive letter, no ambiguity.
const OUT_REL = relative(process.cwd(), OUT).replace(/\\/g, "/");

// Anything the running server does not read. Authoring tools, scraped
// source data and the old Postgres schema stay in git but are not shipped.
const EXCLUDES = [
  "./node_modules",
  "./.git",
  "./.next/cache",
  "./tsconfig.tsbuildinfo",
  "./levels",
  "./.claude",
  "./migration",
  "./.env.development.local",
  "./scripts/data", // ~7 MB of scraped problem JSON, import-time only
  "./supabase", // superseded by migration/ after the MySQL move
  "./docs",
  "./README.md",
];

console.log("1/2  Building production bundle...");
execSync("npm run build", { stdio: "inherit" });

if (!existsSync(".next/BUILD_ID")) {
  console.error("Build output missing (.next/BUILD_ID) — aborting.");
  process.exit(1);
}

console.log("\n2/2  Packaging...");
// execFileSync (no shell) — avoids Windows arg mangling of --exclude paths.
execFileSync(
  "tar",
  ["-czf", OUT_REL, ...EXCLUDES.map((e) => `--exclude=${e}`), "."],
  { stdio: "inherit" },
);

const mb = (statSync(OUT).size / 1024 / 1024).toFixed(1);
console.log(`\n✓ Ready: ${OUT}  (${mb} MB)\n`);
console.log("Next steps:");
console.log("  1. cPanel > File Manager > upload it to /home/orkhoncs");
console.log("  2. Terminal (one line):");
console.log("     tar -xzf ~/cppjudge-deploy.tar.gz -C ~/cppjudge");
console.log("  3. Only if you added packages (one line):");
console.log("     source ~/nodevenv/cppjudge/22/bin/activate && cd ~/cppjudge && npm install --no-audit --no-fund");
console.log("  4. cPanel > Setup Node.js App > RESTART");
