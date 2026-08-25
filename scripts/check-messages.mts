// Who can read a thread, and whose messages count as unread.
//
//   node_modules/.bin/jiti scripts/check-messages.mts
//
// Both rules are one-liners, and both are the kind of one-liner that is wrong
// in a way nobody notices: an inverted unread test shows a badge to the person
// who wrote the message instead of the person who has to answer it, and a
// loose read rule shows one child's question to another.
//
// The read rule is deliberately asymmetric — a teacher sees everything — so
// the test that matters is the student one.
import fs from "node:fs";

import { isUnreadFor, mayReadThread } from "../lib/messages.ts";

const problems: string[] = [];
const rows: string[] = [];

function check(name: string, got: boolean, want: boolean) {
  const ok = got === want;
  rows.push(`  ${ok ? "ok  " : "FAIL"}  ${name} -> ${got}`);
  if (!ok) problems.push(`${name}: got ${got}, expected ${want}`);
}

/* --------------------------------------------------------------- unread */

const unread = { read_at: null } as const;
const read = { read_at: "2026-01-01 10:00:00" } as const;

// A student is waiting on the teacher's reply.
check("student, teacher wrote it, unopened", isUnreadFor({ ...unread, from_teacher: 1 }, false), true);
// Their own question is not news to them.
check("student, their own message", isUnreadFor({ ...unread, from_teacher: 0 }, false), false);
// A teacher is waiting on students' questions.
check("teacher, student wrote it, unopened", isUnreadFor({ ...unread, from_teacher: 0 }, true), true);
// Not their own reply.
check("teacher, their own reply", isUnreadFor({ ...unread, from_teacher: 1 }, true), false);
// Opened is opened, whoever wrote it.
check("student, teacher wrote it, already read", isUnreadFor({ ...read, from_teacher: 1 }, false), false);
check("teacher, student wrote it, already read", isUnreadFor({ ...read, from_teacher: 0 }, true), false);
// Booleans and MySQL's 0/1 must behave identically.
check("boolean true behaves as 1", isUnreadFor({ ...unread, from_teacher: true }, false), true);
check("boolean false behaves as 0", isUnreadFor({ ...unread, from_teacher: false }, true), true);

/* ----------------------------------------------------------------- read */

const thread = { student_id: "student-A" };
const studentA = { id: "student-A", role: "student" };
const studentB = { id: "student-B", role: "student" };
const teacher = { id: "teacher-1", role: "teacher" };

check("owner opens their own thread", mayReadThread(thread, studentA), true);
// The one that would be a real problem.
check("another student opens it", mayReadThread(thread, studentB), false);
check("a teacher opens it", mayReadThread(thread, teacher), true);
// A role string that is neither must not fall through to allowed.
check(
  "an unknown role that is not the owner",
  mayReadThread(thread, { id: "x", role: "admin" }),
  false,
);

/* ------------------------------------------------------------ the wiring */

// Both locales must carry every key the message pages ask for, or half the
// school reads raw key names.
const en = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));
const mn = JSON.parse(fs.readFileSync("messages/mn.json", "utf8"));

const used = new Set<string>();
for (const f of [
  "app/(app)/messages/page.tsx",
  "app/(app)/messages/[id]/page.tsx",
  "app/(app)/teacher/messages/page.tsx",
  "components/messages/ask-form.tsx",
  "components/messages/reply-box.tsx",
]) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/\bt\(\s*"([a-z0-9_]+)"/gi)) used.add(m[1]);
  // The teacher list builds keys as t(`group_${g.key}`).
  for (const m of src.matchAll(/key:\s*"([a-z0-9_]+)"/gi)) used.add(`group_${m[1]}`);
}

for (const key of [...used].sort()) {
  if (en.messages?.[key] === undefined) problems.push(`messages/en.json: messages.${key} missing`);
  if (mn.messages?.[key] === undefined) problems.push(`messages/mn.json: messages.${key} missing`);
}
rows.push(`  ok    ${used.size} message keys present in both locales`);

const enKeys = Object.keys(en.messages ?? {});
const mnKeys = Object.keys(mn.messages ?? {});
const onlyEn = enKeys.filter((k) => !mnKeys.includes(k));
const onlyMn = mnKeys.filter((k) => !enKeys.includes(k));
if (onlyEn.length) problems.push(`en-only message keys: ${onlyEn.join(", ")}`);
if (onlyMn.length) problems.push(`mn-only message keys: ${onlyMn.join(", ")}`);

// The nav badge links somewhere that exists for each role.
for (const p of ["app/(app)/messages/page.tsx", "app/(app)/teacher/messages/page.tsx"]) {
  if (!fs.existsSync(p)) problems.push(`the header links to a page that is missing: ${p}`);
}

console.log(rows.join("\n"));
console.log(problems.length ? "\nPROBLEMS:" : "\nno problems");
for (const p of problems) console.log("  - " + p);
process.exit(problems.length ? 1 : 0);
