// Create a teacher account.
//
//   node scripts/add-teacher.mjs <email> <username> "<Display Name>" <password>
//
// Run ON THE SERVER, where MySQL is reachable:
//   source ~/nodevenv/cppjudge/22/bin/activate && cd ~/cppjudge
//   node scripts/add-teacher.mjs bat@school.mn bat_bagsh "Батбаяр Дорж" 'somepassword'
//
// There is no UI for this on purpose: public signup was removed, and the
// teacher dashboard only creates students. A teacher is the account that can
// read every class, reset passwords and see the plagiarism report, so it is
// made deliberately, by hand, on the box.
//
// Deliberately does NOT use dotenv. dotenv is a devDependency, and cPanel
// installs production dependencies only — scripts/set-password.mjs imports it
// and therefore dies on the server it tells you to run it on. mysql2 and
// bcryptjs are both real dependencies, so this needs nothing extra.

import fs from "node:fs";
import { randomUUID } from "node:crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

function readEnv(file) {
  const out = {};
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return out;
  }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...readEnv(".env.local"), ...process.env };

const [email, username, displayName, password] = process.argv.slice(2);

const usage = `Usage:
  node scripts/add-teacher.mjs <email> <username> "<Display Name>" <password>

  email        used to log in, must be unique
  username     3-20 characters, letters/digits/underscore, must be unique
  Display Name shown in the nav and on the leaderboard (quote it)
  password     at least 6 characters`;

if (!email || !username || !displayName || !password) {
  console.error(usage);
  process.exit(1);
}

const problems = [];
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  problems.push(`"${email}" does not look like an email address.`);
}
// Mirrors chk_profiles_username_len and uq_profiles_username in the schema.
if (!/^[a-z0-9_]{3,20}$/.test(username)) {
  problems.push(
    `Username must be 3-20 characters, lower-case letters, digits or underscore. Got "${username}".`,
  );
}
if (password.length < 6) {
  problems.push("Password must be at least 6 characters.");
}
if (problems.length) {
  console.error("Cannot create this account:\n  - " + problems.join("\n  - "));
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: env.DB_HOST || "localhost",
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: "utf8mb4",
});

try {
  // Check both unique keys first so the failure is a sentence rather than a
  // MySQL duplicate-key error naming a constraint.
  const [clash] = await conn.execute(
    "SELECT email, username, role FROM profiles WHERE email = ? OR username = ?",
    [email, username],
  );
  if (clash.length) {
    for (const row of clash) {
      if (row.email === email) {
        console.error(
          `An account already uses ${email} (role: ${row.role}).\n` +
            `To give it a new password instead:\n` +
            `  node scripts/set-password.mjs ${email} <new-password>\n` +
            `To make that existing account a teacher:\n` +
            `  UPDATE profiles SET role = 'teacher' WHERE email = '${email}';`,
        );
      }
      if (row.username === username) {
        console.error(`The username "${username}" is already taken.`);
      }
    }
    process.exit(1);
  }

  const id = randomUUID();
  await conn.execute(
    `INSERT INTO profiles
       (id, email, password_hash, username, display_name, role, avatar_seed)
     VALUES (?, ?, ?, ?, ?, 'teacher', ?)`,
    [id, email, await bcrypt.hash(password, 10), username, displayName, randomUUID()],
  );

  console.log(`Teacher created.

  name      ${displayName}
  email     ${email}     <- log in with this
  username  ${username}  <- or this
  id        ${id}

They can sign in at /login straight away. The password is not stored anywhere
else, so give it to them now and have them change it.`);
} finally {
  await conn.end();
}
