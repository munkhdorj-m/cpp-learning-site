import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { UnassignedStudents } from "@/components/unassigned-students";

import { ClassesManager } from "./classes-manager";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const t = await getTranslations("teacher.classes");
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade, invite_code")
    .order("grade", { ascending: true })
    .order("name", { ascending: true });

  // Student counts per class. One query for every class, tallied here —
  // previously this ran a separate COUNT per class.
  const { data: rows } = await supabase
    .from("profiles")
    .select("class_id")
    .eq("role", "student");
  const counts = new Map<string, number>();
  for (const r of rows ?? []) {
    if (r.class_id) counts.set(r.class_id, (counts.get(r.class_id) ?? 0) + 1);
  }

  const items = (classes ?? []).map((c) => ({ ...c, students: counts.get(c.id) ?? 0 }));

  // Students orphaned by a deleted class. Without listing them here they are
  // invisible in the UI but still counted on the leaderboard.
  const { data: unassigned } = await supabase
    .from("profiles")
    .select("id, username, display_name, xp, problems_solved")
    .is("class_id", null)
    .eq("role", "student")
    .order("display_name", { ascending: true });

  const labels = {
    title: t("title"),
    new: t("new"),
    name: t("name"),
    grade: t("grade"),
    invite_code: t("invite_code"),
    students: t("students"),
    regenerate: t("regenerate"),
    create_title: t("create_title"),
    create_button: t("create_button"),
    no_classes: t("no_classes"),
    copy_code: t("copy_code"),
    code_copied: t("code_copied"),
    regenerate_confirm: t("regenerate_confirm"),
  };

  return (
    <div className="space-y-4">
      <ClassesManager items={items} labels={labels} />
      <UnassignedStudents
        students={unassigned ?? []}
        classes={(classes ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          grade: c.grade,
        }))}
      />
    </div>
  );
}
