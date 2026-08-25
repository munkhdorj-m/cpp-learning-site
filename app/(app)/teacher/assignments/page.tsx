import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { query } from "@/lib/mysql/pool";
import { requireTeacher } from "@/lib/auth-helpers";

import { AssignmentBrowser, type AssignmentRow } from "./assignment-browser";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  class_id: string;
  class_name: string | null;
  start_at: string;
  due_at: string;
  problems: number;
  materials: number;
  tasks: number;
  unmarked: number;
}

export default async function TeacherAssignmentsPage() {
  // The layout calls this too, but a layout's redirect does not stop
  // this page rendering: React renders them together, and whatever the
  // page produced is flushed into the redirect response for anyone who
  // reads the body instead of following the Location header.
  await requireTeacher();

  const t = await getTranslations("teacher.assignments");

  // One query rather than four plus a loop. The counts are what make the list
  // useful — "3 problems, 1 task, 12 to mark" is the difference between a name
  // and something a teacher can act on — and fetching them per row would be
  // one round trip per assignment on a shared host.
  const rows = await query<Row>(
    `SELECT a.id,
            a.title,
            a.class_id,
            c.name AS class_name,
            a.start_at,
            a.due_at,
            (SELECT COUNT(*) FROM assignment_problems  ap WHERE ap.assignment_id = a.id) AS problems,
            (SELECT COUNT(*) FROM assignment_materials am WHERE am.assignment_id = a.id) AS materials,
            (SELECT COUNT(*) FROM assignment_tasks     at WHERE at.assignment_id = a.id) AS tasks,
            (SELECT COUNT(*)
               FROM task_submissions ts
               JOIN assignment_tasks t2 ON t2.id = ts.task_id
              WHERE t2.assignment_id = a.id
                AND ts.score IS NULL) AS unmarked
       FROM assignments a
       LEFT JOIN classes c ON c.id = a.class_id
      ORDER BY a.due_at DESC`,
  );

  const list: AssignmentRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    class_id: r.class_id,
    class_name: r.class_name ?? "—",
    start_at: String(r.start_at),
    due_at: String(r.due_at),
    problems: Number(r.problems),
    materials: Number(r.materials),
    tasks: Number(r.tasks),
    unmarked: Number(r.unmarked),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/teacher/assignments/new"
          className={cn(buttonVariants({ size: "sm" }), "font-code")}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {t("new")}
        </Link>
      </div>

      {list.length === 0 ? (
        <Card>
          <p className="py-12 text-center text-muted-foreground">
            {t("no_assignments")}
          </p>
        </Card>
      ) : (
        <AssignmentBrowser rows={list} />
      )}
    </div>
  );
}
