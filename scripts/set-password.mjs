// Set (or reset) a user's password directly in MySQL.
// Run ON THE SERVER (where MySQL is reachable), inside the Node env:
//   node scripts/set-password.mjs <email> <new-password>
//
// Used to give the two imported accounts a password (Supabase couldn't
// export the old hashes), and as a manual reset tool for any student.

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
