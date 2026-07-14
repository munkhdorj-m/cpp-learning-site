// Seed 30 hand-written easy problems from easy-problems.mjs.
// For each: compile reference, validate against sample, run on extras to
// capture expected outputs, insert into Supabase.

import { createClient } from "@supabase/supabase-js";
import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { PROBLEMS } from "./easy-problems.mjs";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const dry = process.argv.includes("--dry-run");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env"); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });

function compile(cpp, exe) {
  const src = path.join(tmpdir(), `seed_${Date.now()}_${Math.random().toString(36).slice(2)}.cpp`);
  writeFileSync(src, cpp, "utf8");
  try {
    execFileSync("g++", ["-O2", "-std=c++17", "-w", src, "-o", exe], { timeout: 15000, stdio: "pipe" });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.stderr?.toString() || e.message };
  } finally {
    try { unlinkSync(src); } catch { /* noop */ }
  }
}

function runRef(exe, stdin) {
  const r = spawnSync(exe, [], { input: stdin, encoding: "utf8", timeout: 5000 });
  if (r.status !== 0) return { ok: false, err: `exit ${r.status}: ${(r.stderr||"").slice(0,200)}` };
  return { ok: true, stdout: (r.stdout || "").replace(/\r\n/g, "\n").replace(/\s+$/g, "") + "\n" };
}

function normalize(s) { return s.replace(/\r\n/g,"\n").replace(/[ \t]+\n/g,"\n").replace(/\s+$/g,""); }

async function main() {
  let inserted = 0, skipped = 0, refFailed = 0, dbFailed = 0;
  for (const p of PROBLEMS) {
    console.log(`\n=== ${p.slug} :: ${p.title_mn} ===`);
    const exe = path.join(tmpdir(), `seed_${p.slug}.exe`);
    const c = compile(p.reference_cpp, exe);
    if (!c.ok) {
      refFailed++;
      console.error(`  COMPILE FAIL\n${c.error?.slice(0,500)}`);
      continue;
    }
    // Validate samples
    let okSamples = true;
    for (const s of p.samples) {
      const r = runRef(exe, s.input);
      if (!r.ok) { okSamples = false; console.error(`  SAMPLE RUN FAIL: ${r.err}`); break; }
      if (normalize(r.stdout) !== normalize(s.output)) {
        okSamples = false;
        console.error(`  SAMPLE MISMATCH for input=${JSON.stringify(s.input)}`);
        console.error(`    expected: ${JSON.stringify(s.output)}`);
        console.error(`    got     : ${JSON.stringify(r.stdout)}`);
        break;
      }
    }
    if (!okSamples) { refFailed++; try { unlinkSync(exe); } catch {} continue; }

    // Capture outputs for extras
    const extraTests = [];
    for (const stdin of (p.extra_inputs || [])) {
      const r = runRef(exe, stdin);
      if (!r.ok) { console.error(`  EXTRA FAIL for ${JSON.stringify(stdin)}: ${r.err}`); continue; }
      extraTests.push({ stdin, stdout: r.stdout });
    }
    try { unlinkSync(exe); } catch {}

    if (dry) {
      console.log(`  [dry] would insert (${p.samples.length} samples + ${extraTests.length} extras)`);
      continue;
    }

    // Idempotent
    const { data: existing } = await supabase.from("problems").select("id").eq("slug", p.slug).maybeSingle();
    if (existing) {
      console.log(`  skip (exists)`);
      skipped++;
      continue;
    }

    const { data: ins, error: pErr } = await supabase.from("problems").insert({
      slug: p.slug,
      title_mn: p.title_mn,
      title_en: p.title_en,
      statement_mn: p.statement_mn,
      statement_en: p.statement_en,
      input_format_mn: p.input_format_mn,
      input_format_en: p.input_format_en,
      output_format_mn: p.output_format_mn,
      output_format_en: p.output_format_en,
      difficulty: "easy",
      time_limit_ms: 1000,
      memory_limit_kb: 65536,
      tags: p.tags,
      xp_reward: 10,
      is_public: true,
    }).select("id").single();
    if (pErr) { dbFailed++; console.error(`  DB FAIL: ${pErr.message}`); continue; }

    const tests = [
      ...p.samples.map((s, i) => ({
        problem_id: ins.id, stdin: s.input, expected_stdout: s.output,
        is_sample: true, order_idx: i,
      })),
      ...extraTests.map((t, i) => ({
        problem_id: ins.id, stdin: t.stdin, expected_stdout: t.stdout,
        is_sample: false, order_idx: p.samples.length + i,
      })),
    ];
    const { error: tErr } = await supabase.from("test_cases").insert(tests);
    if (tErr) { dbFailed++; console.error(`  DB FAIL (tests): ${tErr.message}`); continue; }
    inserted++;
    console.log(`  ✓ inserted (${tests.length} tests)`);
  }
  console.log(`\nDone. inserted=${inserted}, skipped=${skipped}, ref_failed=${refFailed}, db_failed=${dbFailed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
