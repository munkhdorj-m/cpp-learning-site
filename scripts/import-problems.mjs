// Bulk-insert every problem in scripts/data/spoj-rgb7-built/ whose
// build-tests output succeeded (status: "ok") into Supabase.
//
// Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// (read from .env.local automatically).
//
// Usage:  node scripts/import-problems.mjs
//         node scripts/import-problems.mjs --dry-run

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILT_DIR = path.resolve(SCRIPT_DIR, "data/spoj-rgb7-built");
const dry = process.argv.includes("--dry-run");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

function normalizeTags(raw) {
  if (Array.isArray(raw)) return raw.filter((t) => typeof t === "string" && t.trim());
  if (typeof raw === "string") {
    // Try JSON first (handles '["a","b"]'), then fall back to comma-split
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((t) => typeof t === "string" && t.trim());
    } catch { /* not JSON */ }
    return raw.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function sanitizeSlug(raw) {
  // Schema check: ^[a-z0-9-]+$
  return (raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "problem";
}

async function main() {
  const files = (await readdir(BUILT_DIR)).filter((f) => f.endsWith(".json"));
  console.log(`${files.length} built problems available.`);

  let ok = 0, skipped = 0, failed = 0;
  for (const file of files) {
    const built = JSON.parse(await readFile(path.join(BUILT_DIR, file), "utf8"));
    if (built.status !== "ok") { skipped++; continue; }
    const d = built.data;

    const problemRow = {
      slug: sanitizeSlug(d.slug),
      title_mn: d.title_mn,
      title_en: d.title_en || null,
      statement_mn: d.statement_mn,
      statement_en: d.statement_en || null,
      input_format_mn: d.input_format_mn || null,
      input_format_en: d.input_format_en || null,
      output_format_mn: d.output_format_mn || null,
      output_format_en: d.output_format_en || null,
      constraints_mn: d.constraints_mn || null,
      constraints_en: d.constraints_en || null,
      difficulty: d.difficulty,
      time_limit_ms: d.time_limit_ms,
      memory_limit_kb: d.memory_limit_kb,
      tags: normalizeTags(d.tags),
      xp_reward: d.xp_reward,
      is_public: true,
    };

    if (dry) {
      console.log(`[dry] would insert ${problemRow.slug} (${d.samples.length} samples + ${built.extraTests.filter((t) => !t.error).length} extras)`);
      ok++;
      continue;
    }

    // Idempotency: skip if slug exists
    const { data: existing } = await supabase
      .from("problems")
      .select("id")
      .eq("slug", problemRow.slug)
      .maybeSingle();
    if (existing) {
      console.log(`  skip (exists): ${problemRow.slug}`);
      skipped++;
      continue;
    }

    const { data: inserted, error: pErr } = await supabase
      .from("problems")
      .insert(problemRow)
      .select("id")
      .single();
    if (pErr) {
      console.error(`  FAIL ${problemRow.slug}: ${pErr.message}`);
      failed++;
      continue;
    }

    const tests = [
      ...d.samples.map((s, i) => ({
        problem_id: inserted.id,
        stdin: s.input,
        expected_stdout: s.output,
        is_sample: true,
        order_idx: i,
      })),
      ...built.extraTests
        .filter((t) => !t.error)
        .map((t, i) => ({
          problem_id: inserted.id,
          stdin: t.stdin,
          expected_stdout: t.stdout,
          is_sample: false,
          order_idx: d.samples.length + i,
        })),
    ];
    const { error: tErr } = await supabase.from("test_cases").insert(tests);
    if (tErr) {
      console.error(`  FAIL tests ${problemRow.slug}: ${tErr.message}`);
      failed++;
      continue;
    }
    ok++;
    console.log(`  ✓ ${problemRow.slug} (${tests.length} tests)`);
  }

  console.log(`\nDone. inserted=${ok}, skipped=${skipped}, failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
