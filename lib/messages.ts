import { query } from "./mysql/pool";
import { hasTable } from "./mysql/has-table";

/**
 * Reading side of student ↔ teacher messages.
 *
 * Kept apart from app/actions/messages.ts so a server component can import it
 * without pulling a "use server" module — and so the unread count has exactly
 * one definition, rather than one for the header badge and a different one for
 * the list that then disagree.
 */

export interface ThreadSummary {
  id: string;
  subject: string;
  student_id: string;
  student_name: string;
  class_name: string | null;
  last_message_at: string;
  closed_at: string | null;
  /** First line of the newest message, for the list. */
  preview: string;
  unread: number;
}

export interface MessageRow {
  id: string;
  sender_id: string;
  sender_name: string;
  from_teacher: number;
  body: string;
  created_at: string;
  read_at: string | null;
}

/** Messages written by the other side that this reader has not opened. */
export async function unreadCount(
  userId: string,
  role: string,
): Promise<number> {
  if (!(await hasTable("messages"))) return 0;

  // A teacher counts unread student messages across every thread; a student
  // counts unread teacher replies in their own threads only.
  const rows =
    role === "teacher"
      ? await query<{ n: number }>(
          `SELECT COUNT(*) AS n
             FROM messages m
            WHERE m.read_at IS NULL AND m.from_teacher = FALSE`,
        )
      : await query<{ n: number }>(
          `SELECT COUNT(*) AS n
             FROM messages m
             JOIN message_threads t ON t.id = m.thread_id
            WHERE t.student_id = ?
              AND m.read_at IS NULL
              AND m.from_teacher = TRUE`,
          [userId],
        );
  return Number(rows[0]?.n ?? 0);
}

/**
 * Threads for the list page.
 *
 * A student passes their own id and gets their own threads. A teacher passes
 * null and gets every thread — which is how every other teacher page in this
 * app scopes things (the role is global; class ownership is not enforced
 * anywhere, and classes.teacher_id is usually unset).
 */
export async function listThreads(
  studentId: string | null,
): Promise<ThreadSummary[]> {
  if (!(await hasTable("message_threads"))) return [];

  const forStudent = studentId !== null;
  const rows = await query<ThreadSummary>(
    `SELECT t.id, t.subject, t.student_id,
            p.display_name AS student_name,
            c.name AS class_name,
            t.last_message_at, t.closed_at,
            (SELECT m.body FROM messages m
              WHERE m.thread_id = t.id
              ORDER BY m.created_at DESC LIMIT 1) AS preview,
            (SELECT COUNT(*) FROM messages m
              WHERE m.thread_id = t.id
                AND m.read_at IS NULL
                AND m.from_teacher = ?) AS unread
       FROM message_threads t
       JOIN profiles p ON p.id = t.student_id
       LEFT JOIN classes c ON c.id = t.class_id
      ${forStudent ? "WHERE t.student_id = ?" : ""}
      ORDER BY t.last_message_at DESC
      LIMIT 200`,
    forStudent ? [1, studentId] : [0],
  );

  return rows.map((r) => ({
    ...r,
    unread: Number(r.unread),
    last_message_at: String(r.last_message_at),
    closed_at: r.closed_at ? String(r.closed_at) : null,
  }));
}

export async function loadConversation(threadId: string): Promise<{
  thread: ThreadSummary | null;
  messages: MessageRow[];
}> {
  if (!(await hasTable("message_threads"))) {
    return { thread: null, messages: [] };
  }

  const threads = await query<ThreadSummary>(
    `SELECT t.id, t.subject, t.student_id,
            p.display_name AS student_name,
            c.name AS class_name,
            t.last_message_at, t.closed_at,
            '' AS preview, 0 AS unread
       FROM message_threads t
       JOIN profiles p ON p.id = t.student_id
       LEFT JOIN classes c ON c.id = t.class_id
      WHERE t.id = ?`,
    [threadId],
  );
  const thread = threads[0] ?? null;
  if (!thread) return { thread: null, messages: [] };

  const messages = await query<MessageRow>(
    `SELECT m.id, m.sender_id, m.from_teacher, m.body, m.created_at, m.read_at,
            p.display_name AS sender_name
       FROM messages m
       JOIN profiles p ON p.id = m.sender_id
      WHERE m.thread_id = ?
      ORDER BY m.created_at ASC`,
    [threadId],
  );

  return {
    thread: {
      ...thread,
      last_message_at: String(thread.last_message_at),
      closed_at: thread.closed_at ? String(thread.closed_at) : null,
    },
    messages: messages.map((m) => ({
      ...m,
      created_at: String(m.created_at),
      read_at: m.read_at ? String(m.read_at) : null,
    })),
  };
}

/* ------------------------------------------------------------------ rules */

/**
 * Is this message unread *to this reader*?
 *
 * A student's unread is a message from a teacher; a teacher's unread is a
 * message from a student. So the test is simply "was it written by the other
 * role" — which is why it reads as an inequality rather than a pair of ifs.
 * Getting this backwards shows the wrong badge to everyone, and it did once.
 */
export function isUnreadFor(
  message: { from_teacher: number | boolean; read_at: string | null },
  readerIsTeacher: boolean,
): boolean {
  if (message.read_at) return false;
  return !!message.from_teacher !== readerIsTeacher;
}

/**
 * May this person open this thread?
 *
 * A student may open their own and no others. A teacher may open any, which is
 * how every teacher page in this app already scopes access — the role is
 * global and classes.teacher_id is usually unset, so anything narrower would
 * hide students' questions from the only teacher who could answer them.
 */
export function mayReadThread(
  thread: { student_id: string },
  profile: { id: string; role: string },
): boolean {
  return profile.role === "teacher" || thread.student_id === profile.id;
}
