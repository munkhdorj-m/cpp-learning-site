import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Plus, Calendar, Trophy } from "lucide-react";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function TeacherContestsPage() {
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  const { data: contests } = await supabase
    .from("contests")
    .select("id, title, start_at, end_at, class_id")
    .order("start_at", { ascending: false });

  const classIds = Array.from(
    new Set(
      (contests ?? [])
        .map((c) => c.class_id)
        .filter((id): id is string => !!id),
    ),
  );
  const classMap = new Map<string, string>();
  if (classIds.length > 0) {
    const { data: classes } = await supabase
      .from("classes")
      .select("id, name")
      .in("id", classIds);
    for (const c of classes ?? []) classMap.set(c.id, c.name);
  }

  const now = Date.now();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contests</h1>
        <Link
          href="/teacher/contests/new"
          className={cn(buttonVariants({ size: "sm" }), "bg-violet-600 text-white hover:bg-violet-700")}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New
        </Link>
      </div>

      {!contests || contests.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">No contests yet</p>
        </Card>
      ) : (
        <div className="grid gap-2">
          {contests.map((c) => {
            const start = new Date(c.start_at).getTime();
            const end = new Date(c.end_at).getTime();
            const status =
              now < start ? "upcoming" : now > end ? "past" : "live";
            const statusStyle =
              status === "live"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : status === "upcoming"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-muted text-muted-foreground";
            return (
              <Link key={c.id} href={`/teacher/contests/${c.id}`}>
                <Card className="hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                  <div className="p-4 flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.class_id ? classMap.get(c.class_id) ?? "—" : "Open to all"}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md uppercase tracking-wide ${statusStyle}`}
                    >
                      {status}
                    </span>
                    <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(c.start_at).toLocaleDateString(locale, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
