// Read-only export of all Supabase data → migration/backup/<table>.json
// Safe: only SELECTs, never writes. Uses the service role key (bypasses RLS)
// so it captures every row. Also exports the auth user list (emails/ids) via
// the admin API — but NOT password hashes (Supabase doesn't expose them, so
// students will set new passwords under the custom-auth system).
//
// Run:  node scripts/export-supabase.mjs

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

dotenv.config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const OUT_DIR = join("migration", "backup");
mkdirSync(OUT_DIR, { recursive: true });

// Every table we care about, in rough dependency order.
const TABLES = [
  "classes",
  "profiles",
  "problems",
  "test_cases",
  "submissions",
  "assignments",
  "assignment_problems",
  "contests",
  "contest_problems",
  "badges",
  "user_badges",
  "code_similarity",
  "quests",
  "user_quest_attempts",
  "game_attempts",
  "robot_progress",
  "robot_levels",
  "notifications",
];

const PAGE = 1000;
const summary = [];

async function dumpTable(table) {
  let all = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE - 1);
    if (error) {
      // Table may not exist (migration not applied) — record and skip.
      summary.push({ table, rows: null, note: error.message });
      return;
    }
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  writeFileSync(join(OUT_DIR, `${table}.json`), JSON.stringify(all, null, 2));
  summary.push({ table, rows: all.length });
}

async function dumpAuthUsers() {
  let all = [];
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      summary.push({ table: "auth.users", rows: null, note: error.message });
      return;
    }
    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    }));
    all = all.concat(users);
    if (data.users.length < 1000) break;
    page += 1;
  }
  writeFileSync(join(OUT_DIR, `auth_users.json`), JSON.stringify(all, null, 2));
  summary.push({ table: "auth.users (emails only, NO passwords)", rows: all.length });
}

console.log("Exporting from", url, "\n");
for (const t of TABLES) await dumpTable(t);
await dumpAuthUsers();

console.log("=== EXPORT SUMMARY ===");
for (const s of summary) {
  if (s.rows === null) console.log(`  ${s.table.padEnd(38)} SKIPPED (${s.note})`);
  else console.log(`  ${s.table.padEnd(38)} ${s.rows} rows`);
}
console.log(`\nSaved to ${OUT_DIR}/`);
