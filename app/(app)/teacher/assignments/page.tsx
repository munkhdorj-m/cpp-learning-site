import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Plus, Calendar } from "lucide-react";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function TeacherAssignmentsPage() {
  const t = await getTranslations("teacher.assignments");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, class_id, title, start_at, due_at")
    .order("due_at", { ascending: false });

  const classIds = Array.from(
    new Set((assignments ?? []).map((a) => a.class_id)),
  );
  const classMap = new Map<string, string>();
  if (classIds.length > 0) {
    const { data: classes } = await supabase
      .from("classes")
      .select("id, name")
      .in("id", classIds);
    for (const c of classes ?? []) classMap.set(c.id, c.name);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/teacher/assignments/new"
          className={cn(buttonVariants({ size: "sm" }), "bg-violet-600 text-white hover:bg-violet-700")}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t("new")}
        </Link>
      </div>

      {!assignments || assignments.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">
            {t("no_assignments")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-2">
          {assignments.map((a) => (
            <Link key={a.id} href={`/teacher/assignments/${a.id}`}>
              <Card className="hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                <div className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {classMap.get(a.class_id) ?? "—"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(a.due_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
