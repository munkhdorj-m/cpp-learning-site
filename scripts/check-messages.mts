// Who can read a thread, and whose messages count as unread.
//
//   node_modules/.bin/jiti scripts/check-messages.mts
//
// Both rules are one-liners, and both are the kind of one-liner that is wrong
// in a way nobody notices: an inverted unread test shows a badge to the person
// who wrote the message instead of the person who has to answer it, and a
// loose read rule shows one child's question to another.
//
// A thread has exactly two ends: the student who opened it and the teacher
// they addressed it to. The read rule used to let ANY teacher in, so the tests
// that matter most now are the ones proving a second teacher is refused.
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

// A thread has two ends. The point of this section is that BOTH "another
// student" and "another teacher" are refused — the second one is what changed
// when students started choosing who they write to, and it is the one that
// would silently let every teacher read every child's questions again.

const thread = { student_id: "student-A", teacher_id: "teacher-1" };
const studentA = { id: "student-A", role: "student" };
const studentB = { id: "student-B", role: "student" };
const teacher1 = { id: "teacher-1", role: "teacher" };
const teacher2 = { id: "teacher-2", role: "teacher" };

check("the student who opened it", mayReadThread(thread, studentA), true);
check("another student", mayReadThread(thread, studentB), false);
check("the teacher it was sent to", mayReadThread(thread, teacher1), true);
// The one that matters most here.
check("a DIFFERENT teacher", mayReadThread(thread, teacher2), false);
check(
  "an unknown role that is not the owner",
  mayReadThread(thread, { id: "x", role: "admin" }),
  false,
);

// Threads with no teacher: made before the column existed, or whose teacher's
// account was deleted. Any teacher may pick those up, or a child's question
// becomes unanswerable — but a student still may not read someone else's.
const orphan = { student_id: "student-A", teacher_id: null };
check("an unassigned thread, its own student", mayReadThread(orphan, studentA), true);
check("an unassigned thread, any teacher", mayReadThread(orphan, teacher2), true);
check("an unassigned thread, another student", mayReadThread(orphan, studentB), false);

// A thread row read back from a query that did not select teacher_id must not
// accidentally grant access to everyone.
check(
  "teacher_id absent behaves like unassigned, not like a match",
  mayReadThread({ student_id: "student-A" }, teacher2),
  true,
);

/* --------------------------------------------- the queries are scoped too */

const lib = fs.readFileSync("lib/messages.ts", "utf8");
const scoped = (lib.match(/t\.teacher_id = \?/g) ?? []).length;
if (scoped < 1) {
  problems.push("lib/messages.ts: no query narrows to the reading teacher");
}
if (/listThreads\([^)]*studentId: string \| null/.test(lib)) {
  problems.push("listThreads still has the all-threads mode");
}
if (!/listTeachers/.test(lib)) {
  problems.push("lib/messages.ts: students have no list of teachers to pick from");
}
rows.push("  ok    teacher-scoped SQL present, all-threads mode gone");

const actions = fs.readFileSync("app/actions/messages.ts", "utf8");
// Renamed from isTeacherId when teachers gained the ability to start threads:
// the far end is now verified against whichever role it is supposed to be.
if (!/accountInRole/.test(actions)) {
  problems.push(
    "startThread does not verify the far end's role — a student could address a thread to a classmate and read it as the teacher",
  );
}
if (!/mayReadThread\(thread, profile\)/.test(actions)) {
  problems.push("an action skips the read rule");
}
// Closing must be scoped too, or one teacher can close another's thread.
const closeFn = actions.slice(actions.indexOf("export async function setThreadClosed"));
if (!/mayReadThread/.test(closeFn.slice(0, closeFn.indexOf("await query")))) {
  problems.push("setThreadClosed does not check the thread belongs to this teacher");
}
rows.push("  ok    the chosen teacher is verified, and closing is scoped");

/* ------------------------------------- either side may open a thread */

// A teacher can now start one too. The danger in widening that is the sender
// naming BOTH ends: a teacher opening a thread "from" a student they are not
// allowed to read, or a student opening one and marking themselves teacher.
const startFn = actions.slice(
  actions.indexOf("export async function startThread"),
  actions.indexOf("export async function sendMessage"),
);

if (!/const fromTeacher = profile\.role === "teacher"/.test(startFn)) {
  problems.push("startThread does not derive the sender's role from the session");
}
// The sender's own end must come from the session, never the form.
if (!/studentId = fromTeacher \? otherId : profile\.id/.test(startFn)) {
  problems.push("startThread lets the form choose which student the thread is for");
}
if (!/teacherId = fromTeacher \? profile\.id : otherId/.test(startFn)) {
  problems.push("startThread lets the form choose which teacher the thread is for");
}
// The far end must be checked to be in the role we expect.
if (!/accountInRole\(otherId, fromTeacher \? "student" : "teacher"\)/.test(startFn)) {
  problems.push(
    "startThread does not verify the other end is in the right role — a teacher could open a thread against another teacher",
  );
}
// A teacher opening a thread must not be refused any more.
if (/Threads are started by students/.test(actions)) {
  problems.push("teachers are still blocked from starting a thread");
}
// The first message must be stamped with the real sender's role, not a guess.
if (!/from_teacher, body\)[\s\S]{0,120}fromTeacher \? 1 : 0/.test(startFn)) {
  problems.push("the opening message does not record who actually sent it");
}
rows.push("  ok    either side may open a thread, and neither names both ends");

const lib2 = fs.readFileSync("lib/messages.ts", "utf8");
if (!/listStudents/.test(lib2)) {
  problems.push("lib/messages.ts: teachers have no list of students to pick from");
}
rows.push("  ok    both pickers have a list to draw from");

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
  "components/messages/conversation.tsx",
  "components/messages/new-thread-form.tsx",
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
