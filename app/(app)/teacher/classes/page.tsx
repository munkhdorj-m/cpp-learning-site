import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";

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

  // Count students per class
  const counts = new Map<string, number>();
  for (const c of classes ?? []) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("class_id", c.id)
      .eq("role", "student");
    counts.set(c.id, count ?? 0);
  }

  const items = (classes ?? []).map((c) => ({ ...c, students: counts.get(c.id) ?? 0 }));

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

  return <ClassesManager items={items} labels={labels} />;
}
