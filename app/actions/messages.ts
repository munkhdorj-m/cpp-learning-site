"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth-helpers";
import { query } from "@/lib/mysql/pool";
import { mayReadThread } from "@/lib/messages";
import { hasColumn } from "@/lib/mysql/has-table";

/**
 * Student ↔ teacher messages.
 *
 * Either side can open a thread: a student picks a teacher, a teacher picks a
 * student. Only those two can read it or write to it — see mayReadThread in
 * lib/messages.ts, which is the single place that rule lives.
 *
 * The teacher is chosen rather than derived from the student's class:
 * classes.teacher_id is nullable and mostly unset here, so deriving it would
 * address most threads to nobody.
 *
 * Message bodies are stored verbatim and rendered as plain JSX text children,
 * the same as task_submissions.note: React escapes them, and no markdown or
 * HTML is interpreted. Nothing on either side of this file un-escapes them.
 */

const SUBJECT_MAX = 200;
const BODY_MAX = 4000;

/**
 * Either side may open a thread, and each names the OTHER end.
 *
 * A student sends `teacherId`; a teacher sends `studentId`. Whichever arrives,
 * the sender's own end is taken from their session and never from the form —
 * so nobody can open a conversation on someone else's behalf.
 */
const newThread = z.object({
  subject: z.string().trim().min(1).max(SUBJECT_MAX),
  body: z.string().trim().min(1).max(BODY_MAX),
  teacherId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});

const reply = z.object({
  threadId: z.string().uuid(),
  // A message may be nothing but a picture, so the body can be empty as long
  // as something is attached. Checked below, where both are known.
  body: z.string().trim().max(BODY_MAX),
  uploadId: z.string().uuid().optional().nullable(),
});

interface ThreadRow {
  id: string;
  student_id: string;
  teacher_id: string | null;
  closed_at: string | null;
}

/**
 * message_threads.teacher_id arrives with add-message-teacher.sql, applied by
 * hand. Selecting it before that runs is ER_BAD_FIELD_ERROR, which reaches a
 * student as "Something went wrong". See lib/mysql/has-table.ts.
 */
function threadTeacherColumn() {
  return hasColumn("message_threads", "teacher_id");
}

/** messages.upload_id arrives with add-message-attachments.sql. */
function messageUploadColumn() {
  return hasColumn("messages", "upload_id");
}

/**
 * The file must belong to the person sending it.
 *
 * The id comes from the browser, so without this anyone could attach anyone
 * else's upload to a message by guessing — or reading — an id.
 */
async function ownsUpload(uploadId: string, userId: string): Promise<boolean> {
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM uploads WHERE id = ? AND owner_id = ?",
    [uploadId, userId],
  );
  return Number(rows[0]?.n ?? 0) > 0;
}

async function loadThread(id: string): Promise<ThreadRow | null> {
  const withTeacher = await threadTeacherColumn();
  const rows = await query<ThreadRow>(
    `SELECT id, student_id, closed_at,
            ${withTeacher ? "teacher_id" : "NULL AS teacher_id"}
       FROM message_threads WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

/**
 * The id must be a real account in the role we expect, not just a uuid the
 * form happened to carry. Without this a student could address a thread to a
 * classmate and read it as "the teacher", or a teacher could open one against
 * another teacher's account.
 *
 * Returns the account's class as well, so a teacher-started thread can record
 * which class it came from — the teacher has no class of their own to copy.
 */
async function accountInRole(
  id: string,
  role: "teacher" | "student",
): Promise<{ class_id: string | null } | null> {
  const rows = await query<{ class_id: string | null }>(
    "SELECT class_id FROM profiles WHERE id = ? AND role = ?",
    [id, role],
  );
  return rows[0] ?? null;
}

export async function startThread(input: {
  subject: string;
  body: string;
  /** A student picks the teacher. */
  teacherId?: string;
  /** A teacher picks the student. */
  studentId?: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const parsed = newThread.safeParse(input);
  if (!parsed.success) {
    return { error: "Pick someone, and write a subject and a message." };
  }

  const fromTeacher = profile.role === "teacher";
  // The sender is always themselves; only the far end comes from the form.
  const otherId = fromTeacher ? parsed.data.studentId : parsed.data.teacherId;
  if (!otherId) {
    return {
      error: fromTeacher ? "Pick a student." : "Pick a teacher.",
    };
  }

  const other = await accountInRole(otherId, fromTeacher ? "student" : "teacher");
  if (!other) {
    return {
      error: fromTeacher ? "That student was not found." : "That teacher was not found.",
    };
  }

  const studentId = fromTeacher ? otherId : profile.id;
  const teacherId = fromTeacher ? profile.id : otherId;
  // The class is the student's, whoever started the conversation.
  const classId = fromTeacher ? other.class_id : (profile.class_id ?? null);

  const threadId = randomUUID();
  // Without the column the thread simply has no teacher on it, which is how
  // every thread worked before add-message-teacher.sql — any teacher answers.
  if (await threadTeacherColumn()) {
    await query(
      `INSERT INTO message_threads (id, student_id, teacher_id, class_id, subject)
       VALUES (?, ?, ?, ?, ?)`,
      [threadId, studentId, teacherId, classId, parsed.data.subject],
    );
  } else {
    await query(
      `INSERT INTO message_threads (id, student_id, class_id, subject)
       VALUES (?, ?, ?, ?)`,
      [threadId, studentId, classId, parsed.data.subject],
    );
  }
  await query(
    `INSERT INTO messages (id, thread_id, sender_id, from_teacher, body)
     VALUES (?, ?, ?, ?, ?)`,
    [randomUUID(), threadId, profile.id, fromTeacher ? 1 : 0, parsed.data.body],
  );

  revalidatePath("/messages");
  revalidatePath("/teacher/messages");
  return { ok: true as const, threadId };
}

export async function sendMessage(input: {
  threadId: string;
  body: string;
  uploadId?: string | null;
}) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const parsed = reply.safeParse(input);
  if (!parsed.success) return { error: "Write a message first." };

  const withUpload = await messageUploadColumn();
  const uploadId = withUpload ? (parsed.data.uploadId ?? null) : null;

  // Words, a file, or both — but not nothing.
  if (!parsed.data.body && !uploadId) return { error: "Write a message first." };

  if (uploadId && !(await ownsUpload(uploadId, profile.id))) {
    return { error: "That file is not yours." };
  }

  const thread = await loadThread(parsed.data.threadId);
  if (!thread) return { error: "That conversation no longer exists." };
  if (!mayReadThread(thread, profile)) return { error: "That is not your message." };
  if (thread.closed_at) return { error: "That conversation is closed." };

  const fromTeacher = profile.role === "teacher";

  if (uploadId) {
    await query(
      `INSERT INTO messages (id, thread_id, sender_id, from_teacher, body, upload_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [randomUUID(), thread.id, profile.id, fromTeacher ? 1 : 0, parsed.data.body, uploadId],
    );
  } else {
    await query(
      `INSERT INTO messages (id, thread_id, sender_id, from_teacher, body)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), thread.id, profile.id, fromTeacher ? 1 : 0, parsed.data.body],
    );
  }
  await query(
    "UPDATE message_threads SET last_message_at = CURRENT_TIMESTAMP(6) WHERE id = ?",
    [thread.id],
  );

  revalidatePath("/messages");
  revalidatePath(`/messages/${thread.id}`);
  revalidatePath("/teacher/messages");
  return { ok: true as const };
}

/**
 * Mark what the other side wrote as read.
 *
 * Only ever clears the unread flag on messages this reader did NOT write, so
 * opening your own thread does not mark your own question answered.
 */
export async function markThreadRead(threadId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const thread = await loadThread(threadId);
  if (!thread) return { error: "That conversation no longer exists." };
  if (!mayReadThread(thread, profile)) return { error: "That is not your message." };

  const wantTeacherMessages = profile.role !== "teacher";
  await query(
    `UPDATE messages
        SET read_at = CURRENT_TIMESTAMP(6)
      WHERE thread_id = ?
        AND read_at IS NULL
        AND from_teacher = ?`,
    [threadId, wantTeacherMessages ? 1 : 0],
  );

  return { ok: true as const };
}

/**
 * A teacher marking a question dealt with.
 *
 * A closed thread takes no more messages from either side — sendMessage
 * refuses one. A student with a follow-up starts a new thread, which keeps
 * one question to one thread; a teacher can reopen this one instead.
 */
export async function setThreadClosed(threadId: string, closed: boolean) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };
  if (profile.role !== "teacher") return { error: "Teachers only." };

  const thread = await loadThread(threadId);
  if (!thread) return { error: "That conversation no longer exists." };
  // Same rule as reading it: a teacher may only close a thread addressed to
  // them (or an unassigned one).
  if (!mayReadThread(thread, profile)) {
    return { error: "That is not your conversation." };
  }

  await query(
    `UPDATE message_threads
        SET closed_at = ${closed ? "CURRENT_TIMESTAMP(6)" : "NULL"}
      WHERE id = ?`,
    [threadId],
  );

  revalidatePath("/teacher/messages");
  revalidatePath(`/messages/${threadId}`);
  return { ok: true as const };
}
