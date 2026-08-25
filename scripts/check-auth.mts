// Session & authorisation regression checks.
//
// Run against a *production* build (`next start`), because dev and production
// stream server components differently and the interesting failures live in
// that difference. Point it at the dev database, never the live one — it signs
// its own session cookies with AUTH_SECRET and reads real rows.
//
//   set -a; . ./.env.development.local; set +a
//   npx next start -p 3100
//   npx tsx scripts/check-auth.mts
//
// Every check here exists because it once failed:
//   * x-user-id arrives from a browser as easily as from the middleware, and
//     getCachedSession() takes it as proof of identity.
//   * A layout that redirects does not stop its page rendering — whatever the
//     page produced is flushed into the redirect body for anyone who reads it
//     instead of following the Location header.
//   * The session cookie outlived the student on a shared classroom machine.

import fs from "node:fs";
import { SignJWT } from "jose";
import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2/promise";

const BASE = process.env.CHECK_BASE || "http://localhost:3100";

function readEnv(file: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const local = readEnv(".env.local");
const dev = readEnv(".env.development.local");
const AUTH_SECRET = process.env.AUTH_SECRET || local.AUTH_SECRET;
if (!AUTH_SECRET) throw new Error("AUTH_SECRET not found (.env.local)");
const secret = new TextEncoder().encode(AUTH_SECRET);

const db = await mysql.createConnection({
  host: dev.DB_HOST,
  port: Number(dev.DB_PORT),
  user: dev.DB_USER,
  password: dev.DB_PASSWORD,
  database: dev.DB_NAME,
});
interface ProfileRow extends RowDataPacket {
  id: string;
  username: string;
  display_name: string;
  role: string;
}
interface SlugRow extends RowDataPacket {
  slug: string;
}
interface TestRow extends RowDataPacket {
  stdin: string | null;
  expected_stdout: string | null;
}

const [people] = await db.query<ProfileRow[]>(
  "SELECT id, username, display_name, role FROM profiles",
);
const teacher = people.find((p) => p.role === "teacher");
const student = people.find((p) => p.role === "student");
if (!teacher || !student) {
  throw new Error("need at least one teacher and one student in the dev DB");
}

const [problems] = await db.query<SlugRow[]>("SELECT slug FROM problems");
const [tests] = await db.query<TestRow[]>(
  "SELECT stdin, expected_stdout FROM test_cases WHERE is_sample = 0 LIMIT 40",
);
await db.end();

// Strings that should never reach someone not entitled to them.
const secrets = new Set<string>();
for (const p of people) {
  secrets.add(p.username);
  secrets.add(p.display_name);
}
for (const p of problems) secrets.add(p.slug);
for (const t of tests) {
  for (const v of [t.stdin, t.expected_stdout]) {
    if (v && String(v).trim().length > 5) secrets.add(String(v).trim());
  }
}

/** A session cookie issued `ageSeconds` ago that lives for `lifeSeconds`. */
async function mint(sub: string, ageSeconds = 0, lifeSeconds = 7200) {
  const iat = Math.floor(Date.now() / 1000) - ageSeconds;
  return new SignJWT({ email: "" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt(iat)
    .setExpirationTime(iat + lifeSeconds)
    .sign(secret);
}

const results: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail = "") =>
  results.push({ name, pass, detail });

async function get(path: string, headers: Record<string, string> = {}) {
  const r = await fetch(BASE + path, { headers, redirect: "manual" });
  return { r, body: await r.text() };
}

const TEACHER_PAGES = [
  "/teacher",
  "/teacher/classes",
  "/teacher/analytics",
  "/teacher/plagiarism",
  "/teacher/problems",
  "/teacher/assignments",
  "/teacher/contests",
  "/teacher/robot-levels",
];

const teacherCookie = { cookie: "session=" + (await mint(teacher.id)) };
const studentCookie = { cookie: "session=" + (await mint(student.id)) };

// Site chrome legitimately repeats DB strings — the nav, the student's own
// name, the problem list they are entitled to browse. Discount it, or every
// page looks like a leak.
const chrome = new Set<string>();
for (const [path, headers] of [
  ["/problems", studentCookie],
  ["/login", {}],
] as const) {
  const { body } = await get(path, headers as Record<string, string>);
  for (const s of secrets) if (body.includes(s)) chrome.add(s);
}

// --- the header must not be able to authenticate anyone ---
{
  const { r, body } = await get("/teacher", { "x-user-id": teacher.id });
  check(
    "a browser-supplied x-user-id opens nothing",
    r.status === 307 && !body.includes(teacher.display_name),
    "HTTP " + r.status,
  );
}
{
  const r = await fetch(BASE + "/api/progress", {
    headers: { "x-user-id": teacher.id },
  });
  const body = JSON.stringify(await r.json());
  check(
    "a browser-supplied x-user-id gets no data from the API",
    body === JSON.stringify({ lesson: [], cambridge: [] }),
    body,
  );
}

// --- teacher pages must not hand their body to the unauthorised ---
for (const [who, headers] of [
  ["anonymous", {}],
  ["a logged-in student", studentCookie],
] as const) {
  const leaked: string[] = [];
  for (const path of TEACHER_PAGES) {
    const { body } = await get(path, headers as Record<string, string>);
    for (const s of secrets) {
      if (!chrome.has(s) && body.includes(s)) {
        leaked.push(path + ":" + s.slice(0, 24));
      }
    }
  }
  check(
    "no teacher page leaks its data to " + who,
    leaked.length === 0,
    leaked.slice(0, 4).join(" "),
  );
}
{
  const { r, body } = await get("/teacher", studentCookie);
  check(
    "a student landing on /teacher is sent away",
    body.includes("__next-page-redirect") || r.status === 307,
    "HTTP " + r.status,
  );
}

// --- the teacher must still be able to work ---
{
  const bad: string[] = [];
  const pages = TEACHER_PAGES.concat([
    "/teacher/problems/new",
    "/teacher/robot-levels/new",
  ]);
  for (const path of pages) {
    const { r } = await get(path, teacherCookie);
    if (r.status !== 200) bad.push(path + "=" + r.status);
  }
  check("a real teacher still reaches every teacher page", bad.length === 0, bad.join(" "));
}

// --- session lifetime on a shared classroom machine ---
{
  const { r } = await get("/today", teacherCookie);
  check(
    "signed-in pages are not left in the browser cache",
    (r.headers.get("cache-control") || "").includes("no-store"),
    r.headers.get("cache-control") || "(none)",
  );
  check(
    "a just-issued session is not re-signed on every request",
    !/session=ey/.test(r.headers.get("set-cookie") || ""),
  );
}
{
  const { r } = await get("/today", {
    cookie: "session=" + (await mint(teacher.id, 45 * 60)),
  });
  const sc = r.headers.get("set-cookie") || "";
  check("a session in use slides forward", /session=ey/.test(sc));
  check(
    "the cookie carries no Expires/Max-Age, so it dies with the browser",
    /session=ey/.test(sc) && !/max-age/i.test(sc) && !/expires/i.test(sc),
    sc.replace(/session=[^;]+/, "session=<jwt>"),
  );
}
{
  const r = await fetch(BASE + "/api/progress", {
    headers: { cookie: "session=" + (await mint(teacher.id, 45 * 60)) },
  });
  check(
    "working through the API keeps the session alive too",
    /session=ey/.test(r.headers.get("set-cookie") || ""),
  );
}
{
  const { r } = await get("/teacher", {
    cookie: "session=" + (await mint(teacher.id, 7300, 7200)),
  });
  const sc = r.headers.get("set-cookie") || "";
  check(
    "an idled-out session is refused and the dead cookie cleared",
    r.status === 307 && /session=;/.test(sc) && /Max-Age=0/i.test(sc),
    "HTTP " + r.status,
  );
}

// --- logging in and out ---
{
  const r = await fetch(BASE + "/api/auth/logout", {
    method: "POST",
    headers: { cookie: "session=" + (await mint(teacher.id, 45 * 60)) },
  });
  const sc = r.headers.get("set-cookie") || "";
  check(
    "logout clears the cookie and nothing re-issues it",
    /session=;/.test(sc) && !/session=ey/.test(sc),
    sc.slice(0, 80),
  );
  check(
    "the logout response is not cached",
    (r.headers.get("cache-control") || "").includes("no-store"),
  );
}
{
  const r = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: "session=" + (await mint(teacher.id, 7300, 7200)),
    },
    body: JSON.stringify({ login: "nobody-at-all", password: "wrong" }),
  });
  check("a stale cookie does not break the login route", r.status === 401, "HTTP " + r.status);
  check(
    "the middleware does not fight /api/auth/* over Set-Cookie",
    !/Max-Age=0/i.test(r.headers.get("set-cookie") || ""),
  );
}

let failed = 0;
for (const { name, pass, detail } of results) {
  if (!pass) failed++;
  const suffix = detail && !pass ? "\n        " + detail : "";
  console.log((pass ? "PASS  " : "FAIL  ") + name + suffix);
}
console.log("\n" + (results.length - failed) + "/" + results.length + " passed");
process.exit(failed ? 1 : 0);
