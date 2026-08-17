// Seeds the lesson practice problems into MySQL.
//
//   node scripts/seed-lesson-problems.mjs --dry-run   check everything, touch nothing
//   node scripts/seed-lesson-problems.mjs             insert the problems
//
// For every problem it compiles the reference solution, runs it on each input
// and stores what it printed as the expected output. Nobody types an expected
// answer by hand, so a statement and its tests cannot drift apart.
//
// It also checks which lesson each problem will be filed under, because a
// problem that lands in the wrong lesson is invisible to the student who
// needs it.

import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import mysql from "mysql2/promise";

import { LESSON_PROBLEMS } from "./lesson-problems.mjs";

const dry = process.argv.includes("--dry-run");
const work = mkdtempSync(path.join(tmpdir(), "seedprob-"));
const EXE = path.join(work, process.platform === "win32" ? "ref.exe" : "ref");

function env() {
  const out = {};
  for (const file of [".env.development.local", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !(m[1] in out)) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

function compile(cpp) {
  const src = path.join(work, "ref.cpp");
  writeFileSync(src, cpp, "utf8");
  try {
    // g++ 6 on this machine, so stay on C++14 rather than C++17.
    execFileSync("g++", ["-O2", "-std=c++14", "-w", src, "-o", EXE], {
      timeout: 20000,
      stdio: "pipe",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e.stderr?.toString() || e.message).slice(0, 300) };
  } finally {
    try { unlinkSync(src); } catch {}
  }
}

function run(stdin) {
  const r = spawnSync(EXE, [], { input: stdin, encoding: "utf8", timeout: 5000 });
  if (r.error) return { ok: false, err: r.error.message };
  if (r.status !== 0) return { ok: false, err: `exit ${r.status}` };
  // Trailing whitespace is not meaningful to a judge; normalise it away.
  return { ok: true, out: (r.stdout || "").replace(/\r\n/g, "\n").replace(/\s+$/, "") + "\n" };
}

// Which lesson will each problem be filed under? Mirrors lib/problem-topics.ts
// closely enough to catch a mis-tagged problem before it reaches the database.
const topicSrc = fs.readFileSync("lib/problem-topics.ts", "utf8");
const TAG_TO_LESSON = {};
for (const m of topicSrc.matchAll(/assign\("([a-z-]+)",\s*\[([^\]]*)\]\)/g)) {
  for (const t of m[2].matchAll(/"([^"]+)"/g)) TAG_TO_LESSON[t[1]] = m[1];
}

const problems = [];
let failed = 0;

for (const p of LESSON_PROBLEMS) {
  const c = compile(p.reference_cpp);
  if (!c.ok) {
    console.log(`  ✗ ${p.slug}: reference will not compile\n     ${c.error}`);
    failed++;
    continue;
  }

  const cases = [];
  let bad = false;
  const inputs = [
    ...p.samples.map((s) => ({ stdin: s.input, sample: true })),
    ...p.extra_inputs.map((i) => ({ stdin: i, sample: false })),
  ];
  for (const { stdin, sample } of inputs) {
    const r = run(stdin);
    if (!r.ok) {
      console.log(`  ✗ ${p.slug}: reference failed on ${JSON.stringify(stdin)} — ${r.err}`);
      bad = true;
      break;
    }
    cases.push({ stdin, expected: r.out, sample });
  }
  if (bad) { failed++; continue; }

  const lessons = [...new Set(p.tags.map((t) => TAG_TO_LESSON[t]).filter(Boolean))];
  if (lessons.length === 0) {
    console.log(`  ✗ ${p.slug}: none of its tags (${p.tags.join(", ")}) maps to a lesson`);
    failed++;
    continue;
  }

  problems.push({ ...p, cases, lesson: lessons[0] });
  process.stdout.write(".");
}

console.log(`\n\ncompiled and ran ${problems.length}/${LESSON_PROBLEMS.length}`);
if (failed) console.log(`${failed} had problems (see above)`);

const byLesson = {};
for (const p of problems) byLesson[p.lesson] = (byLesson[p.lesson] ?? 0) + 1;
console.log("\nproblems per lesson:");
for (const [l, n] of Object.entries(byLesson).sort()) console.log(`  ${String(n).padStart(2)}  ${l}`);
console.log(`\ntest cases generated: ${problems.reduce((s, p) => s + p.cases.length, 0)}`);

if (dry) {
  console.log("\n--dry-run: nothing was written to the database");
  process.exit(failed ? 1 : 0);
}
if (failed) {
  console.log("\nrefusing to seed while any problem is broken");
  process.exit(1);
}

const e = env();
const db = await mysql.createConnection({
  host: e.DB_HOST, port: Number(e.DB_PORT || 3306),
  user: e.DB_USER, password: e.DB_PASSWORD, database: e.DB_NAME,
});

let inserted = 0, skipped = 0;
for (const p of problems) {
  const [rows] = await db.execute("SELECT id FROM problems WHERE slug = ?", [p.slug]);
  if (rows.length) { skipped++; continue; }

  const id = crypto.randomUUID();
  await db.execute(
    `INSERT INTO problems
       (id, slug, title_mn, title_en, statement_mn, statement_en,
        input_format_mn, input_format_en, output_format_mn, output_format_en,
        difficulty, tags, xp_reward, is_public)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, p.slug, p.title_mn, p.title_en, p.statement_mn, p.statement_en,
      p.input_format_mn, p.input_format_en, p.output_format_mn, p.output_format_en,
      "easy", JSON.stringify(p.tags), 10, 1,
    ],
  );
  for (let i = 0; i < p.cases.length; i++) {
    const c = p.cases[i];
    await db.execute(
      `INSERT INTO test_cases (id, problem_id, stdin, expected_stdout, is_sample, order_idx)
       VALUES (?,?,?,?,?,?)`,
      [crypto.randomUUID(), id, c.stdin, c.expected, c.sample ? 1 : 0, i],
    );
  }
  inserted++;
}

await db.end();
console.log(`\ninserted ${inserted}, skipped ${skipped} already present`);
