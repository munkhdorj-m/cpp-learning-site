import { getTranslations } from "next-intl/server";
import { GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTeacherForm } from "@/components/teacher/add-teacher-form";
import { createClient } from "@/lib/supabase/server";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

interface TeacherRow {
  id: string;
  display_name: string;
  username: string;
  email: string;
  created_at: string;
}

export default async function TeacherAccountsPage() {
  // The layout guards too, but a layout's redirect does not stop this page
  // rendering — React renders them together and the body is flushed into the
  // redirect response. Same reasoning as the dashboard.
  const me = await requireTeacher();

  const t = await getTranslations("teacher.teachers");
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, username, email, created_at")
    .eq("role", "teacher")
    .order("created_at", { ascending: true });

  const teachers = (data ?? []) as TeacherRow[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">{"//"}</span>
          TEACHER.ACCOUNTS
        </div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4" />
            {t("existing", { count: teachers.length })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {teachers.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5"
              >
                <span className="font-medium">{row.display_name}</span>
                {row.id === me.id && (
                  <span className="hud-chip">{t("you")}</span>
                )}
                <span className="font-code text-xs text-muted-foreground">
                  {row.username}
                </span>
                <span className="ml-auto font-code text-xs text-muted-foreground">
                  {row.email}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <AddTeacherForm />
    </div>
  );
}
