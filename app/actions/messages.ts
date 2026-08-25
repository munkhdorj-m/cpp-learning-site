"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth-helpers";
import { query } from "@/lib/mysql/pool";
import { mayReadThread } from "@/lib/messages";

/**
 * Student ↔ teacher messages.
 *
 * A student opens a thread with a question; any teacher can answer it. There
 * is no per-class routing, because classes.teacher_id is nullable and mostly
 * unset here — a thread routed to "this class's teacher" would be routed to
 * nobody. See the header of migration/add-messages.sql.
 *
 * Message bodies are stored verbatim and rendered as plain JSX text children,
 * the same as task_submissions.note: React escapes them, and no markdown or
 * HTML is interpreted. Nothing on either side of this file un-escapes them.
 */

const SUBJECT_MAX = 200;
const BODY_MAX = 4000;

const newThread = z.object({
  subject: z.string().trim().min(1).max(SUBJECT_MAX),
  body: z.string().trim().min(1).max(BODY_MAX),
});

const reply = z.object({
  threadId: z.string().uuid(),
  body: z.string().trim().min(1).max(BODY_MAX),
});

interface ThreadRow {
  id: string;
  student_id: string;
  closed_at: string | null;
}

async function loadThread(id: string): Promise<ThreadRow | null> {
  const rows = await query<ThreadRow>(
    "SELECT id, student_id, closed_at FROM message_threads WHERE id = ?",
    [id],
  );
  return rows[0] ?? null;
}

export async function startThread(input: {
  subject: string;
  body: string;
}) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };
  if (profile.role === "teacher") {
    // A teacher writing to nobody in particular has no thread to belong to.
    // Teachers answer threads; they do not open them.
    return { error: "Threads are started by students." };
  }

  const parsed = newThread.safeParse(input);
  if (!parsed.success) return { error: "Write a subject and a message." };

  const threadId = randomUUID();
  await query(
    `INSERT INTO message_threads (id, student_id, class_id, subject)
     VALUES (?, ?, ?, ?)`,
    [threadId, profile.id, profile.class_id ?? null, parsed.data.subject],
  );
  await query(
    `INSERT INTO messages (id, thread_id, sender_id, from_teacher, body)
     VALUES (?, ?, ?, FALSE, ?)`,
    [randomUUID(), threadId, profile.id, parsed.data.body],
  );

  revalidatePath("/messages");
  revalidatePath("/teacher/messages");
  return { ok: true as const, threadId };
}

export async function sendMessage(input: { threadId: string; body: string }) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const parsed = reply.safeParse(input);
  if (!parsed.success) return { error: "Write a message first." };

  const thread = await loadThread(parsed.data.threadId);
  if (!thread) return { error: "That conversation no longer exists." };
  if (!mayReadThread(thread, profile)) return { error: "That is not your message." };
  if (thread.closed_at) return { error: "That conversation is closed." };

  const fromTeacher = profile.role === "teacher";

  await query(
    `INSERT INTO messages (id, thread_id, sender_id, from_teacher, body)
     VALUES (?, ?, ?, ?, ?)`,
    [randomUUID(), thread.id, profile.id, fromTeacher ? 1 : 0, parsed.data.body],
  );
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
