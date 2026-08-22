// Turn migration/backup/*.json (from Supabase) into one MySQL import file:
//   migration/mysql-data.sql
// You then import that in phpMyAdmin, same as the schema.
//
// Handles: timestamptz -> DATETIME(6), arrays/jsonb -> JSON, bool -> 1/0,
// merges auth emails into profiles, sets blank password_hash (set later),
// renames notifications.read -> is_read. FK checks off during load.
//
// Run:  node scripts/generate-mysql-inserts.mjs

import mysql from "mysql2";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const IN = join("migration", "backup");
const OUT = join("migration", "mysql-data.sql");
const esc = mysql.escape;

const read = (t) => {
  const p = join(IN, `${t}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : [];
};

// ISO "2026-06-17T11:07:10.945+00:00" -> "2026-06-17 11:07:10.945" (UTC)
const toDateTime = (v) =>
  v == null
    ? null
    : String(v)
        .replace("T", " ")
        .replace(/(?:Z|[+-]\d{2}:?\d{2})$/, "");
const toDate = (v) => (v == null ? null : String(v).slice(0, 10));

// Column spec per table: string = auto (escape as-is); or [col, type];
// type: 't'=datetime 'd'=date 'j'=json(nullable) 'J'=json(NOT NULL, null->[])
// [col, type, src] lets the source key differ from the column name.
const T = {
  classes: ["id", "name", "grade", "invite_code", "teacher_id", ["created_at", "t"]],
  profiles: [
    "id", "email", "password_hash", "username", "display_name", "role",
    "class_id", "xp", "level", "problems_solved", "streak_days",
    ["last_solve_date", "d"], "avatar_seed", "preferred_locale",
    ["created_at", "t"], ["updated_at", "t"],
  ],
  problems: [
    "id", "slug", "title_mn", "title_en", "statement_mn", "statement_en",
    "input_format_mn", "input_format_en", "output_format_mn", "output_format_en",
    "constraints_mn", "constraints_en", "difficulty", "time_limit_ms",
    "memory_limit_kb", ["tags", "J"], "xp_reward", "is_public", "created_by",
    ["created_at", "t"], ["updated_at", "t"],
  ],
  test_cases: ["id", "problem_id", "stdin", "expected_stdout", "is_sample", "order_idx"],
  submissions: [
    "id", "user_id", "problem_id", "code", "language", "verdict", "runtime_ms",
    "memory_kb", "passed_tests", "total_tests", "failed_test_idx",
    "compile_output", "stderr_output", ["judge_response", "j"], "assignment_id",
    "contest_id", "is_first_accepted", "xp_awarded", ["created_at", "t"],
  ],
  assignments: [
    "id", "class_id", "title", "description", ["start_at", "t"], ["due_at", "t"],
    "allow_late", "late_penalty_pct", "created_by", ["created_at", "t"],
  ],
  assignment_problems: ["assignment_id", "problem_id", "points", "order_idx"],
  contests: [
    "id", "title", "description", ["start_at", "t"], ["end_at", "t"],
    "class_id", "created_by", ["created_at", "t"],
  ],
  contest_problems: ["contest_id", "problem_id", "points", "order_idx"],
  badges: [
    "id", "code", "name_mn", "name_en", "description_mn", "description_en",
    "icon", "color", ["created_at", "t"],
  ],
  user_badges: ["user_id", "badge_id", ["earned_at", "t"]],
  code_similarity: [
    "id", "submission_a_id", "submission_b_id", "problem_id", "similarity",
    "class_id", "reviewed", ["created_at", "t"],
  ],
  quests: [
    "id", "slug", "type", "prompt_mn", "prompt_en", "code_snippet",
    ["choices_mn", "j"], ["choices_en", "j"], "correct_answer",
    "explanation_mn", "explanation_en", "difficulty", "xp_reward",
    ["tags", "J"], "is_active", "created_by", ["created_at", "t"], ["updated_at", "t"],
  ],
  user_quest_attempts: [
    "user_id", "quest_id", "was_correct", "user_answer", "xp_awarded", ["answered_at", "t"],
  ],
  game_attempts: [
    "user_id", ["day", "d"], "score", "xp_awarded", "plays", "best_combo", ["played_at", "t"],
  ],
  robot_levels: [
    "id", "course", "name_mn", "name_en", "hint_mn", "hint_en", "width", "height",
    ["layout", "J"], "robot_x", "robot_y", "robot_dir", ["targets", "j"],
    ["dangers", "j"], ["palette", "j"], "max_blocks", "xp_reward", "created_by",
    ["created_at", "t"], ["updated_at", "t"], ["hints_mn", "J"], ["hints_en", "J"],
  ],
  robot_progress: [
    "user_id", "level_id", "xp_awarded", "instruction_count", ["completed_at", "t"],
  ],
  notifications: [
    "id", "user_id", "type", "title", "body", "link",
    ["is_read", "b", "read"], ["created_at", "t"],
  ],
};

// Merge auth emails into profiles + set blank password.
const authUsers = read("auth_users");
const emailById = new Map(authUsers.map((u) => [u.id, u.email]));

function formatValue(row, spec) {
  const col = Array.isArray(spec) ? spec[0] : spec;
  const type = Array.isArray(spec) ? spec[1] : null;
  const src = Array.isArray(spec) && spec[2] ? spec[2] : col;
  let v = row[src];
  if (v === undefined) v = null;
  switch (type) {
    case "t": return esc(toDateTime(v));
    case "d": return esc(toDate(v));
    case "j": return v == null ? "NULL" : esc(JSON.stringify(v));
    case "J": return esc(JSON.stringify(v == null ? [] : v));
    case "b": return v ? 1 : 0;
    default: return esc(v);
  }
}

const lines = [
  "-- CPP Judge data import (generated from Supabase export)",
  "-- Import in phpMyAdmin AFTER mysql-schema.sql.",
  "SET NAMES utf8mb4;",
  "SET FOREIGN_KEY_CHECKS = 0;",
  "SET UNIQUE_CHECKS = 0;",
  "START TRANSACTION;",
  "",
];

const summary = [];
for (const [table, cols] of Object.entries(T)) {
  let rows = read(table);
  if (table === "profiles") {
    rows = rows.map((r) => ({
      ...r,
      email: emailById.get(r.id) || `${r.username}@local.invalid`,
      password_hash: "",
    }));
  }
  if (rows.length === 0) {
    summary.push(`${table}: 0 (skipped)`);
    continue;
  }
  const colNames = cols.map((c) => (Array.isArray(c) ? c[0] : c));
  const colList = colNames.map((c) => `\`${c}\``).join(", ");
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const tuples = chunk
      .map((row) => `(${cols.map((c) => formatValue(row, c)).join(", ")})`)
      .join(",\n");
    lines.push(`INSERT INTO \`${table}\` (${colList}) VALUES\n${tuples};`);
  }
  summary.push(`${table}: ${rows.length}`);
}

lines.push("", "COMMIT;", "SET UNIQUE_CHECKS = 1;", "SET FOREIGN_KEY_CHECKS = 1;", "");
writeFileSync(OUT, lines.join("\n"));

console.log("=== rows written ===");
for (const s of summary) console.log("  " + s);
console.log(`\nWrote ${OUT}`);
