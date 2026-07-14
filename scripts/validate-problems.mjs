// Validate every problem in easy-problems.mjs:
//   1. compile reference_cpp with g++ -O2 -std=c++17 -w
//   2. run against each sample — output must match exactly
//   3. run against each extra input — must not crash/timeout
// Reports a per-problem pass/fail summary. No DB writes.

import { execFileSync, spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PROBLEMS } from "./easy-problems.mjs";

function compile(cpp, exe) {
  const src = exe + ".cpp";
  writeFileSync(src, cpp, "utf8");
  try {
    execFileSync("g++", ["-O2", "-std=c++17", "-w", src, "-o", exe], {
      timeout: 15000,
      stdio: "pipe",
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e.stderr?.toString() || e.message).slice(0, 600) };
  } finally {
    try { unlinkSync(src); } catch { /* noop */ }
  }
}

function runRef(exe, stdin) {
  const r = spawnSync(exe, [], { input: stdin, encoding: "utf8", timeout: 5000 });
  if (r.status !== 0) return { ok: false, err: `exit ${r.status}: ${(r.stderr || "").slice(0, 200)}` };
  return { ok: true, stdout: (r.stdout || "").replace(/\r\n/g, "\n") };
}

function normalize(s) {
  return s.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\s+$/g, "");
}

async function main() {
  const tmp = path.join(tmpdir(), "validate_easy");
  try { mkdirSync(tmp, { recursive: true }); } catch { /* noop */ }

  let pass = 0, fail = 0;
  const failures = [];

  for (const p of PROBLEMS) {
    const exe = path.join(tmp, `v_${p.slug}.exe`);
    const c = compile(p.reference_cpp, exe);
    if (!c.ok) {
      fail++;
      failures.push({ slug: p.slug, kind: "COMPILE", detail: c.error });
      console.log(`✗ ${p.slug}  COMPILE FAIL: ${c.error.split("\n")[0]}`);
      continue;
    }

    // Validate samples
    let okSamples = true;
    let mismatchDetail = "";
    for (let i = 0; i < p.samples.length; i++) {
      const s = p.samples[i];
      const r = runRef(exe, s.input);
      if (!r.ok) {
        okSamples = false;
        mismatchDetail = `SAMPLE RUN FAIL #${i}: ${r.err}`;
        break;
      }
      if (normalize(r.stdout) !== normalize(s.output)) {
        okSamples = false;
        mismatchDetail = `SAMPLE MISMATCH #${i}: expected=${JSON.stringify(s.output)} got=${JSON.stringify(r.stdout)}`;
        break;
      }
    }

    if (!okSamples) {
      fail++;
      failures.push({ slug: p.slug, kind: "SAMPLE", detail: mismatchDetail });
      console.log(`✗ ${p.slug}  ${mismatchDetail.slice(0, 120)}`);
      try { unlinkSync(exe); } catch { /* noop */ }
      continue;
    }

    // Check extras don't crash
    let extraErrors = 0;
    for (const stdin of (p.extra_inputs || [])) {
      const r = runRef(exe, stdin);
      if (!r.ok) {
        extraErrors++;
        mismatchDetail = `EXTRA CRASH for ${JSON.stringify(stdin)}: ${r.err}`;
      }
    }
    try { unlinkSync(exe); } catch { /* noop */ }

    if (extraErrors > 0) {
      fail++;
      failures.push({ slug: p.slug, kind: "EXTRA", detail: mismatchDetail });
      console.log(`✗ ${p.slug}  ${mismatchDetail.slice(0, 120)}`);
      continue;
    }

    pass++;
    const testCount = p.samples.length + (p.extra_inputs?.length || 0);
    console.log(`✓ ${p.slug}  (${testCount} tests)`);
  }

  console.log(`\n══════════════════════════════════════════`);
  console.log(`PASS: ${pass}   FAIL: ${fail}   TOTAL: ${PROBLEMS.length}`);
  if (failures.length > 0) {
    console.log(`\nFailures:`);
    for (const f of failures) {
      console.log(`  [${f.kind}] ${f.slug}: ${f.detail.slice(0, 200)}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
