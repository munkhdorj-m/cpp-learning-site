// Re-compute difficulty + xp_reward for every problem in the DB based on
// SPOJ's acceptance rate (scraped to data/spoj-listing.json).
//
// Usage:  node scripts/update-difficulty.mjs
//         node scripts/update-difficulty.mjs --dry-run

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILT_DIR = path.resolve(SCRIPT_DIR, "data/spoj-rgb7-built");
const LISTING = path.resolve(SCRIPT_DIR, "data/spoj-listing.json");
const dry = process.argv.includes("--dry-run");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env"); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });

function sanitizeSlug(raw) {
  return (raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "problem";
}

// Bucket an imported problem by its rank within the imported subset (0=easiest).
// Distributes problems into 6 equal-sized tiers; SPOJ's natural listing order
// (most-attempted first ≈ easiest) is the primary signal.
function bucketFor(rank, total) {
  const q = rank / total; // 0..1
  if (q < 1 / 6) return { difficulty: "easy",   xp_reward: 10  };
  if (q < 2 / 6) return { difficulty: "easy",   xp_reward: 20  };
  if (q < 3 / 6) return { difficulty: "medium", xp_reward: 40  };
  if (q < 4 / 6) return { difficulty: "medium", xp_reward: 80  };
  if (q < 5 / 6) return { difficulty: "hard",   xp_reward: 150 };
  return            { difficulty: "hard",   xp_reward: 250 };
}

async function main() {
  const listing = JSON.parse(await readFile(LISTING, "utf8"));
  const positionByCode = new Map(listing.map((r) => [r.code, r.position]));
  console.log(`Loaded ${listing.length} listing entries.`);

  // Step 1: collect every imported "ok" problem with its SPOJ listing position.
  const files = (await readdir(BUILT_DIR)).filter((f) => f.endsWith(".json"));
  const imported = [];
  for (const file of files) {
    const built = JSON.parse(await readFile(path.join(BUILT_DIR, file), "utf8"));
    if (built.status !== "ok") continue;
    const code = file.replace(/\.json$/, "");
    const position = positionByCode.has(code) ? positionByCode.get(code) : Infinity;
    imported.push({
      code,
      slug: sanitizeSlug(built.data.slug),
      title: built.data.title_mn,
      position,
    });
  }
  // Step 2: rank our imports by SPOJ position (lower = more popular = easier).
  imported.sort((a, b) => a.position - b.position);
  imported.forEach((p, i) => { p.rank = i; });

  console.log(`${imported.length} imported problems to update.`);

  let updated = 0, missing = 0, failed = 0;
  const counts = { easy_10: 0, easy_20: 0, med_40: 0, med_80: 0, hard_150: 0, hard_250: 0 };
  for (const p of imported) {
    const { difficulty, xp_reward } = bucketFor(p.rank, imported.length);
    const key = `${difficulty}_${xp_reward}`.replace("medium_", "med_");
    counts[key] = (counts[key] || 0) + 1;

    if (dry) {
      console.log(`[dry] rank=${String(p.rank).padStart(3)} pos=${String(p.position).padStart(3)} ${p.slug.padEnd(40)} → ${difficulty}/${xp_reward}xp  | ${p.title?.slice(0, 30) || ""}`);
      updated++;
      continue;
    }
    const { error, count } = await supabase
      .from("problems")
      .update({ difficulty, xp_reward })
      .eq("slug", p.slug)
      .select("*", { count: "exact", head: true });
    if (error) {
      failed++;
      console.error(`  FAIL ${p.slug}: ${error.message}`);
    } else if (count === 0) {
      missing++;
      console.log(`  no row in DB for slug=${p.slug}`);
    } else {
      updated++;
    }
  }
  console.log(`\nDone. updated=${updated}, missing=${missing}, failed=${failed}`);
  console.log("Distribution:", counts);
}

main().catch((e) => { console.error(e); process.exit(1); });
