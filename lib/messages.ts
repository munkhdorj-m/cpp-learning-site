import { query } from "./mysql/pool";
import { hasColumn, hasTable } from "./mysql/has-table";

/**
 * Reading side of student ↔ teacher messages.
 *
 * A thread has two ends: the student who opened it and the teacher they
 * addressed it to. Nobody else can read it — not another student, and not
 * another teacher. That is enforced in one place, mayReadThread, and every
 * query below narrows to the same rule.
 *
 * Note this is privacy by access control, not cryptography: the message text
 * sits in the database in plain text and an administrator with database access
 * can read it. It is private from other users of the site, which is what
 * matters for a child asking their teacher a question.
 *
 * Kept apart from app/actions/messages.ts so a server component can import it
 * without pulling in a "use server" module — and so the unread count has
 * exactly one definition rather than one for the header badge and a different
 * one for the list that then disagree.
 */

export interface ThreadSummary {
  id: string;
  subject: string;
  student_id: string;
  student_name: string;
  teacher_id: string | null;
  teacher_name: string | null;
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
  /** A picture or file sent with the message. */
  upload_id: string | null;
  upload_name: string | null;
  upload_mime: string | null;
  upload_bytes: number | null;
}

export interface Viewer {
  id: string;
  role: string;
}

export interface TeacherOption {
  id: string;
  display_name: string;
}

/**
 * Teachers a student may write to.
 *
 * Every teacher, not just the one who owns their class: classes.teacher_id is
 * nullable and mostly unset in this database, so filtering by it would leave
 * most students with an empty list and no way to ask anyone anything.
 */
export async function listTeachers(): Promise<TeacherOption[]> {
  const rows = await query<{ id: string; display_name: string; username: string }>(
    `SELECT id, display_name, username
       FROM profiles
      WHERE role = 'teacher'
      ORDER BY display_name ASC`,
  );
  return rows.map((r) => ({
    id: r.id,
    display_name: r.display_name || r.username,
  }));
}

export interface StudentOption {
  id: string;
  display_name: string;
  class_name: string | null;
}

/**
 * Students a teacher may write to.
 *
 * Every student, for the same reason listTeachers returns every teacher:
 * classes.teacher_id is nullable and mostly unset, so narrowing to "my classes"
 * would leave most teachers unable to message anybody. Ordered by class then
 * name so the picker reads like a register.
 */
export async function listStudents(): Promise<StudentOption[]> {
  const rows = await query<{
    id: string;
    display_name: string;
    username: string;
    class_name: string | null;
  }>(
    `SELECT p.id, p.display_name, p.username, c.name AS class_name
       FROM profiles p
       LEFT JOIN classes c ON c.id = p.class_id
      WHERE p.role = 'student'
      ORDER BY c.name IS NULL, c.name ASC, p.display_name ASC`,
  );
  return rows.map((r) => ({
    id: r.id,
    display_name: r.display_name || r.username,
    class_name: r.class_name,
  }));
}

/**
 * The SQL predicate limiting a teacher to their own threads.
 *
 * `teacher_id IS NULL` is included deliberately: threads created before the
 * teacher column existed, and threads whose teacher's account was deleted,
 * have nobody assigned. Excluding them would leave a student's question
 * permanently unanswerable and invisible. They fall back to the old rule —
 * any teacher may pick them up.
 */
const TEACHER_SCOPE = "(t.teacher_id = ? OR t.teacher_id IS NULL)";

/**
 * Is the teacher column there yet?
 *
 * message_threads shipped before it, so a database that ran add-messages.sql
 * but not add-message-teacher.sql has the table and not the column. hasTable
 * says yes and the query still dies on ER_BAD_FIELD_ERROR — which is what put
 * "Something went wrong" in front of students instead of their messages.
 *
 * Without the column, everything falls back to how chat worked before it
 * existed: any teacher can see any thread. That is worse than the new rule,
 * but it is what the data can support, and it keeps chat working.
 */
function threadTeacherColumn() {
  return hasColumn("message_threads", "teacher_id");
}

/** messages.upload_id arrives with add-message-attachments.sql. */
function messageUploadColumn() {
  return hasColumn("messages", "upload_id");
}

/** Messages written by the other side that this reader has not opened. */
export async function unreadCount(
  userId: string,
  role: string,
): Promise<number> {
  if (!(await hasTable("messages"))) return 0;

  // A teacher counts unread student messages in threads addressed to them; a
  // student counts unread teacher replies in their own threads.
  const withTeacher = await threadTeacherColumn();

  const rows =
    role === "teacher"
      ? await query<{ n: number }>(
          `SELECT COUNT(*) AS n
             FROM messages m
             JOIN message_threads t ON t.id = m.thread_id
            WHERE ${withTeacher ? TEACHER_SCOPE : "TRUE"}
              AND m.read_at IS NULL
              AND m.from_teacher = FALSE`,
          withTeacher ? [userId] : [],
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
 * Threads this viewer may see.
 *
 * A student gets their own; a teacher gets the ones addressed to them. There
 * is no "all threads" mode any more — a teacher reading another teacher's
 * conversations was the thing this change removed.
 */
export async function listThreads(viewer: Viewer): Promise<ThreadSummary[]> {
  if (!(await hasTable("message_threads"))) return [];

  const isTeacher = viewer.role === "teacher";
  const withTeacher = await threadTeacherColumn();
  const scope = isTeacher
    ? withTeacher
      ? TEACHER_SCOPE
      : "TRUE"
    : "t.student_id = ?";
  // Unread to a teacher is a student's message, and vice versa.
  const unreadFrom = isTeacher ? 0 : 1;

  const rows = await query<ThreadSummary>(
    `SELECT t.id, t.subject, t.student_id,
            ${withTeacher ? "t.teacher_id," : "NULL AS teacher_id,"}
            p.display_name AS student_name,
            ${withTeacher ? "tp.display_name AS teacher_name," : "NULL AS teacher_name,"}
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
       ${withTeacher ? "LEFT JOIN profiles tp ON tp.id = t.teacher_id" : ""}
       LEFT JOIN classes c ON c.id = t.class_id
      WHERE ${scope}
      ORDER BY t.last_message_at DESC
      LIMIT 200`,
    // The scope binds the viewer only when it actually has a `?` in it.
    scope === "TRUE" ? [unreadFrom] : [unreadFrom, viewer.id],
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

  const withTeacher = await threadTeacherColumn();
  const threads = await query<ThreadSummary>(
    `SELECT t.id, t.subject, t.student_id,
            ${withTeacher ? "t.teacher_id," : "NULL AS teacher_id,"}
            p.display_name AS student_name,
            ${withTeacher ? "tp.display_name AS teacher_name," : "NULL AS teacher_name,"}
            c.name AS class_name,
            t.last_message_at, t.closed_at,
            '' AS preview, 0 AS unread
       FROM message_threads t
       JOIN profiles p ON p.id = t.student_id
       ${withTeacher ? "LEFT JOIN profiles tp ON tp.id = t.teacher_id" : ""}
       LEFT JOIN classes c ON c.id = t.class_id
      WHERE t.id = ?`,
    [threadId],
  );
  const thread = threads[0] ?? null;
  if (!thread) return { thread: null, messages: [] };

  const withUpload = await messageUploadColumn();
  const messages = await query<MessageRow>(
    `SELECT m.id, m.sender_id, m.from_teacher, m.body, m.created_at, m.read_at,
            p.display_name AS sender_name,
            ${
              withUpload
                ? `m.upload_id,
            u.original_name AS upload_name,
            u.mime AS upload_mime,
            u.bytes AS upload_bytes`
                : `NULL AS upload_id,
            NULL AS upload_name,
            NULL AS upload_mime,
            NULL AS upload_bytes`
            }
       FROM messages m
       JOIN profiles p ON p.id = m.sender_id
       ${withUpload ? "LEFT JOIN uploads u ON u.id = m.upload_id" : ""}
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
 * Exactly two people can: the student who opened it, and the teacher they
 * addressed it to. A different student cannot, and — the part that changed —
 * neither can a different teacher.
 *
 * The one exception is a thread with no teacher on it: one created before the
 * teacher column existed, or one whose teacher's account has since been
 * deleted. Those stay open to any teacher, because the alternative is a
 * child's question that nobody is able to answer.
 */
export function mayReadThread(
  thread: { student_id: string; teacher_id?: string | null },
  profile: { id: string; role: string },
): boolean {
  if (thread.student_id === profile.id) return true;
  if (profile.role !== "teacher") return false;
  return thread.teacher_id === profile.id || !thread.teacher_id;
}
