import fs from "node:fs";
import crypto from "node:crypto";
import mysql from "mysql2/promise";

// node _check-rules.mjs
//
// The class_champion rule, against the real database. The guards are the
// point: a class of one, a tie, and zero XP must all award nobody, because a
// "champion" badge that everyone gets is worth nothing.
//
// This also used to cover quest_perfect_day, which went with the daily
// quests — see migration/remove-quest-badges.sql.
const env = {};
for (const f of [".env.development.local", ".env.local"]) {
  if (!fs.existsSync(f)) continue;
  for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(l.trim());
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
process.env.DB_HOST = env.DB_HOST;
process.env.DB_PORT = env.DB_PORT;
process.env.DB_USER = env.DB_USER;
process.env.DB_PASSWORD = env.DB_PASSWORD;
process.env.DB_NAME = env.DB_NAME;

const { earnedClassChampion } = await import(
  "../lib/badge-rules.ts"
);

const db = await mysql.createConnection({
  host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER,
  password: env.DB_PASSWORD, database: env.DB_NAME, connectTimeout: 15000,
});

const problems = [];
const check = (ok, what) => { if (!ok) problems.push(what); };
const made = { profiles: [], classes: [], subs: [] };

async function student(tag, classId) {
  const id = crypto.randomUUID();
  await db.query(
    `INSERT INTO profiles (id, email, username, display_name, avatar_seed, role, class_id)
     VALUES (?, ?, ?, ?, ?, 'student', ?)`,
    [id, `${tag}@rules.local`, tag, tag, tag, classId],
  );
  made.profiles.push(id);
  return id;
}
async function klass(name) {
  const id = crypto.randomUUID();
  await db.query(
    "INSERT INTO classes (id, name, grade, invite_code) VALUES (?, ?, 7, ?)",
    [id, name, "ZZ" + id.slice(0, 6)],
  );
  made.classes.push(id);
  return id;
}
const [[problem]] = await db.query("SELECT id FROM problems LIMIT 1");
async function giveXp(userId, xp) {
  const id = crypto.randomUUID();
  await db.query(
    `INSERT INTO submissions (id, user_id, problem_id, code, language, verdict, xp_awarded, created_at)
     VALUES (?, ?, ?, 'x', 'cpp', 'accepted', ?, NOW())`,
    [id, userId, problem.id, xp],
  );
  made.subs.push(id);
}

/* ------------------------------------------------------- class_champion */

// A class of one: nobody is top of it.
const solo = await klass("zzrules solo");
const alone = await student("zzrules_alone", solo);
await giveXp(alone, 100);
check(
  (await earnedClassChampion(alone, solo)) === false,
  "a class of one awarded class_champion",
);

// A clear winner.
const big = await klass("zzrules big");
const winner = await student("zzrules_winner", big);
const second = await student("zzrules_second", big);
await giveXp(winner, 200);
await giveXp(second, 50);
check(await earnedClassChampion(winner, big), "the clear leader did not get it");
check(
  (await earnedClassChampion(second, big)) === false,
  "the runner-up got class_champion",
);

// A tie awards nobody.
const tied = await klass("zzrules tie");
const tieA = await student("zzrules_tieA", tied);
const tieB = await student("zzrules_tieB", tied);
await giveXp(tieA, 90);
await giveXp(tieB, 90);
check(
  (await earnedClassChampion(tieA, tied)) === false &&
    (await earnedClassChampion(tieB, tied)) === false,
  "a tie awarded class_champion to somebody",
);

// Nobody has earned anything: no champion of nothing.
const idle = await klass("zzrules idle");
const idleA = await student("zzrules_idleA", idle);
await student("zzrules_idleB", idle);
check(
  (await earnedClassChampion(idleA, idle)) === false,
  "a class with zero XP awarded class_champion",
);

// XP older than a week must not count.
const stale = await klass("zzrules stale");
const staleA = await student("zzrules_staleA", stale);
const staleB = await student("zzrules_staleB", stale);
const oldId = crypto.randomUUID();
await db.query(
  `INSERT INTO submissions (id, user_id, problem_id, code, language, verdict, xp_awarded, created_at)
   VALUES (?, ?, ?, 'x', 'cpp', 'accepted', 500, NOW() - INTERVAL 30 DAY)`,
  [oldId, staleA, problem.id],
);
made.subs.push(oldId);
await giveXp(staleB, 10);
check(
  (await earnedClassChampion(staleA, stale)) === false,
  "XP from a month ago counted towards this week",
);
check(
  await earnedClassChampion(staleB, stale),
  "this week's only earner was not the leader",
);

// No class at all.
check(
  (await earnedClassChampion(winner, null)) === false,
  "a student with no class got class_champion",
);

/* -------------------------------------------------------------- clean up */

for (const id of made.subs) await db.query("DELETE FROM submissions WHERE id = ?", [id]);
for (const id of made.profiles) await db.query("DELETE FROM profiles WHERE id = ?", [id]);
for (const id of made.classes) await db.query("DELETE FROM classes WHERE id = ?", [id]);
const [[left]] = await db.query(
  "SELECT COUNT(*) AS n FROM profiles WHERE username LIKE 'zzrules%'",
);
check(Number(left.n) === 0, `${left.n} test profiles were left behind`);
await db.end();

console.log(problems.length ? `${problems.length} problems:` : "no problems");
for (const p of problems) console.log("  " + p);
process.exit(problems.length ? 1 : 0);
