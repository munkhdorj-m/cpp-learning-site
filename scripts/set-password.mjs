// Set (or reset) a user's password directly in MySQL.
// Run ON THE SERVER (where MySQL is reachable), inside the Node env:
//   node scripts/set-password.mjs <email> <new-password>
//
// Used to give the two imported accounts a password (Supabase couldn't
// export the old hashes), and as a manual reset tool for any student.

import fs from "node:fs";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// This used to `import dotenv`, which meant the script died with
// ERR_MODULE_NOT_FOUND on the one machine its own header tells you to run it
// on: dotenv is a devDependency, and cPanel installs production dependencies
// only. Reading the file directly costs six lines and no dependency.
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

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/set-password.mjs <email> <new-password>");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: env.DB_HOST || "localhost",
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

const hash = await bcrypt.hash(password, 10);
const [res] = await conn.execute(
  "UPDATE profiles SET password_hash = ? WHERE email = ?",
  [hash, email],
);
const affected = res.affectedRows ?? 0;
console.log(
  affected > 0
    ? `✓ Password updated for ${email}`
    : `✗ No account found with email ${email}`,
);
await conn.end();
