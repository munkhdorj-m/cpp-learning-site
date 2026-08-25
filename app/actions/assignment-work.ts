"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getCurrentProfile, requireTeacher } from "@/lib/auth-helpers";
import { query } from "@/lib/mysql/pool";
import { MAX_IDE_PROJECTS } from "@/lib/ide-projects";
import { parseStarterFiles } from "@/lib/github-starter";

/**
 * Handing work in, and marking it.
 *
 * The judge marks problems on its own; nothing here touches that. These are
 * the tasks it cannot mark — an essay, a photograph of working, a Python file,
 * a link to a notebook — where a person hands something in and a person reads
 * it.
 */

interface TaskRow {
  id: string;
  assignment_id: string;
  points: number;
  accept_file: number;
  accept_link: number;
  accept_text: number;
  accept_ide: number;
  starter_files: string | null;
  class_id: string;
  start_at: string;
  due_at: string;
  allow_late: number;
}

/** The task, plus the assignment rules that decide whether it is still open. */
async function loadTask(taskId: string): Promise<TaskRow | null> {
  const rows = await query<TaskRow>(
    `SELECT t.id, t.assignment_id, t.points,
            t.accept_file, t.accept_link, t.accept_text, t.accept_ide,
            t.starter_files,
            a.class_id, a.start_at, a.due_at, a.allow_late
       FROM assignment_tasks t
       JOIN assignments a ON a.id = t.assignment_id
      WHERE t.id = ?
      LIMIT 1`,
    [taskId],
  );
  return rows[0] ?? null;
}

const handIn = z.object({
  note: z.string().max(20_000).optional().nullable(),
  link: z.string().trim().max(2000).optional().nullable(),
  upload_id: z.string().uuid().optional().nullable(),
  ide_project_id: z.string().uuid().optional().nullable(),
});

export type HandInInput = z.input<typeof handIn>;

function safeUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString().slice(0, 2000);
  } catch {
    return null;
  }
}

/**
 * A student hands in, or hands in again.
 *
 * One row per student per task, replaced on every hand-in, so the teacher
 * always marks the current version instead of digging through drafts. Handing
 * in again after it was marked clears the mark — the thing that was marked is
 * no longer the thing that is there.
 */
export async function handInTask(taskId: string, input: HandInInput) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const parsed = handIn.safeParse(input);
  if (!parsed.success) return { error: "That hand-in was not valid." };
  const data = parsed.data;

  const task = await loadTask(taskId);
  if (!task) return { error: "That task no longer exists." };
  if (task.class_id !== profile.class_id) {
    return { error: "That work was not set for your class." };
  }

  const now = Date.now();
  if (now < new Date(task.start_at).getTime()) {
    return { error: "This is not open yet." };
  }
  if (now > new Date(task.due_at).getTime() && !task.allow_late) {
    return { error: "The deadline has passed." };
  }

  // Only keep what the task actually asks for. A teacher who turned off links
  // does not want to find one in the box.
  const note = task.accept_text ? (data.note?.trim() || null) : null;
  const link = task.accept_link ? safeUrl(data.link) : null;
  const uploadId = task.accept_file ? (data.upload_id ?? null) : null;
  const projectId = task.accept_ide ? (data.ide_project_id ?? null) : null;

  if (!note && !link && !uploadId && !projectId) {
    return { error: "There is nothing to hand in yet." };
  }

  // A student may only attach their own file, and their own IDE project.
  if (uploadId) {
    const owned = await query<{ ok: number }>(
      "SELECT 1 AS ok FROM uploads WHERE id = ? AND owner_id = ? LIMIT 1",
      [uploadId, profile.id],
    );
    if (!owned.length) return { error: "That file is not yours." };
  }
  if (projectId) {
    const owned = await query<{ ok: number }>(
      "SELECT 1 AS ok FROM ide_projects WHERE id = ? AND user_id = ? LIMIT 1",
      [projectId, profile.id],
    );
    if (!owned.length) return { error: "That project is not yours." };
  }

  await query(
    `INSERT INTO task_submissions
       (id, task_id, user_id, note, link, upload_id, ide_project_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       note = VALUES(note),
       link = VALUES(link),
       upload_id = VALUES(upload_id),
       ide_project_id = VALUES(ide_project_id),
       submitted_at = CURRENT_TIMESTAMP(6),
       score = NULL,
       feedback = NULL,
       marked_by = NULL,
       marked_at = NULL`,
    [randomUUID(), taskId, profile.id, note, link, uploadId, projectId],
  );

  revalidatePath(`/assignments/${task.assignment_id}`);
  revalidatePath(`/teacher/assignments/${task.assignment_id}`);
  return { ok: true as const };
}

/** Take it back, while it is still open. */
export async function withdrawHandIn(taskId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const task = await loadTask(taskId);
  if (!task) return { error: "That task no longer exists." };
  if (task.class_id !== profile.class_id) return { error: "Not your class." };

  await query("DELETE FROM task_submissions WHERE task_id = ? AND user_id = ?", [
    taskId,
    profile.id,
  ]);
  revalidatePath(`/assignments/${task.assignment_id}`);
  revalidatePath(`/teacher/assignments/${task.assignment_id}`);
  return { ok: true as const };
}

const mark = z.object({
  score: z.coerce.number().int().min(0).max(10_000).nullable(),
  feedback: z.string().max(4000).optional().nullable(),
});

/** A teacher scores one hand-in. */
export async function markHandIn(
  submissionId: string,
  input: z.input<typeof mark>,
) {
  const teacher = await requireTeacher();
  const parsed = mark.safeParse(input);
  if (!parsed.success) return { error: "That mark was not valid." };

  const rows = await query<{ assignment_id: string; points: number }>(
    `SELECT t.assignment_id, t.points
       FROM task_submissions s
       JOIN assignment_tasks t ON t.id = s.task_id
      WHERE s.id = ?
      LIMIT 1`,
    [submissionId],
  );
  const row = rows[0];
  if (!row) return { error: "That hand-in no longer exists." };

  const score = parsed.data.score;
  if (score !== null && score > row.points) {
    return { error: `The task is out of ${row.points}.` };
  }

  await query(
    `UPDATE task_submissions
        SET score = ?, feedback = ?, marked_by = ?, marked_at = CURRENT_TIMESTAMP(6)
      WHERE id = ?`,
    [score, parsed.data.feedback?.trim() || null, teacher.id, submissionId],
  );

  revalidatePath(`/teacher/assignments/${row.assignment_id}`);
  revalidatePath(`/assignments/${row.assignment_id}`);
  return { ok: true as const };
}

/**
 * Copy a task's starter code into the student's own IDE.
 *
 * This is the GitHub Classroom shape without the GitHub accounts: the teacher
 * imported the repo once when setting the task, and every student gets their
 * own copy from ours. Returns the project id so the caller can open it.
 */
export async function startFromStarter(taskId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const task = await loadTask(taskId);
  if (!task) return { error: "That task no longer exists." };
  if (task.class_id !== profile.class_id) return { error: "Not your class." };
  if (!task.starter_files) return { error: "This task has no starter code." };

  const files = parseStarterFiles(task.starter_files);
  if (!files.length) return { error: "The starter code could not be read." };

  const existing = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM ide_projects WHERE user_id = ?",
    [profile.id],
  );
  const used = Number(existing[0]?.n ?? 0);
  if (used + files.length > MAX_IDE_PROJECTS) {
    return {
      error: `This needs ${files.length} of your ${MAX_IDE_PROJECTS} saved files and you have ${used}. Delete some in the editor first.`,
    };
  }

  let firstId = "";
  for (const f of files) {
    const id = randomUUID();
    if (!firstId) firstId = id;
    await query(
      `INSERT INTO ide_projects (id, user_id, name, language, code, stdin)
       VALUES (?, ?, ?, ?, ?, '')`,
      [id, profile.id, f.name, f.language, f.code],
    );
  }

  revalidatePath("/ide");
  revalidatePath(`/assignments/${task.assignment_id}`);
  return { ok: true as const, projectId: firstId };
}

/* ---------------------------------------------------------------------------
   Turning the whole assignment in.

   Separate from the per-task hand-ins above, and deliberately so: a teacher
   can set an assignment made only of judge problems, or only of a worksheet to
   read, and until now neither had any way for a student to say they were
   finished. The judge filling a progress bar is not the same thing as a
   student saying "this is my work, look at it".

   Nothing here marks or scores. It records that a student says they are done,
   and when — which is what the list on /assignments sorts by, and what a
   teacher needs to know before chasing anyone.
   ------------------------------------------------------------------------- */

interface AssignmentGate {
  id: string;
  class_id: string;
  start_at: string;
  due_at: string;
  allow_late: number;
}

async function loadAssignmentGate(id: string): Promise<AssignmentGate | null> {
  const rows = await query<AssignmentGate>(
    `SELECT id, class_id, start_at, due_at, allow_late
       FROM assignments
      WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function turnInAssignment(assignmentId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const a = await loadAssignmentGate(assignmentId);
  if (!a) return { error: "That assignment no longer exists." };
  if (a.class_id !== profile.class_id) {
    return { error: "That work was not set for your class." };
  }

  const now = Date.now();
  if (now < new Date(a.start_at).getTime()) {
    return { error: "This is not open yet." };
  }
  const late = now > new Date(a.due_at).getTime();
  if (late && !a.allow_late) return { error: "The deadline has passed." };

  // Re-turning in after taking it back keeps the original row's key but
  // re-stamps the time, so the teacher sees when the work they are looking at
  // was actually finished.
  await query(
    `INSERT INTO assignment_turnins (assignment_id, user_id, turned_in_at, late)
     VALUES (?, ?, CURRENT_TIMESTAMP(6), ?)
     ON DUPLICATE KEY UPDATE turned_in_at = CURRENT_TIMESTAMP(6), late = VALUES(late)`,
    [assignmentId, profile.id, late ? 1 : 0],
  );

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  return { ok: true as const, late };
}

export async function undoTurnInAssignment(assignmentId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in first." };

  const a = await loadAssignmentGate(assignmentId);
  if (!a) return { error: "That assignment no longer exists." };
  if (a.class_id !== profile.class_id) {
    return { error: "That work was not set for your class." };
  }

  // Once it is closed, taking it back would let a student erase a late mark —
  // or quietly withdraw work a teacher has already read.
  const closed = Date.now() > new Date(a.due_at).getTime() && !a.allow_late;
  if (closed) return { error: "The deadline has passed." };

  await query(
    "DELETE FROM assignment_turnins WHERE assignment_id = ? AND user_id = ?",
    [assignmentId, profile.id],
  );

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  return { ok: true as const };
}
