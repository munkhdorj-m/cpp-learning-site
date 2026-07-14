import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Users, BookOpen, GraduationCap, Activity, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { VerdictBadge } from "@/components/verdict-badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const t = await getTranslations("teacher.dashboard");
  const tVerdict = await getTranslations("verdict");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [classesRes, studentsRes, problemsRes, subs24hRes, recentRes] =
    await Promise.all([
      supabase.from("classes").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase.from("problems").select("id", { count: "exact", head: true }),
      supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabase
        .from("submissions")
        .select("id, user_id, problem_id, verdict, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const recent = recentRes.data ?? [];
  const userIds = Array.from(new Set(recent.map((r) => r.user_id)));
  const problemIds = Array.from(new Set(recent.map((r) => r.problem_id)));

  const [profilesByIdRes, problemsByIdRes] = await Promise.all([
    userIds.length
      ? supabase
          .from("profiles")
          .select("id, display_name, username")
          .in("id", userIds)
      : Promise.resolve({ data: [] }),
    problemIds.length
      ? supabase
          .from("problems")
          .select("id, slug, title_mn, title_en")
          .in("id", problemIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map(
    (profilesByIdRes.data ?? []).map((p) => [p.id, p]),
  );
  const problemMap = new Map(
    (problemsByIdRes.data ?? []).map((p) => [p.id, p]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={<Users className="h-4 w-4" />}
          label={t("stat_classes")}
          value={classesRes.count ?? 0}
          color="violet"
        />
        <Stat
          icon={<GraduationCap className="h-4 w-4" />}
          label={t("stat_students")}
          value={studentsRes.count ?? 0}
          color="emerald"
        />
        <Stat
          icon={<BookOpen className="h-4 w-4" />}
          label={t("stat_problems")}
          value={problemsRes.count ?? 0}
          color="amber"
        />
        <Stat
          icon={<Activity className="h-4 w-4" />}
          label={t("stat_submissions_24h")}
          value={subs24hRes.count ?? 0}
          color="rose"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("quick_actions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link
            href="/teacher/classes"
            className={cn(buttonVariants({ size: "sm" }), "bg-violet-600 text-white hover:bg-violet-700")}
          >
            <Plus className="h-4 w-4 mr-1.5" /> {t("create_class")}
          </Link>
          <Link
            href="/teacher/problems/new"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <Plus className="h-4 w-4 mr-1.5" /> {t("create_problem")}
          </Link>
          <Link
            href="/teacher/assignments/new"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <Plus className="h-4 w-4 mr-1.5" /> {t("create_assignment")}
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recent_submissions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">—</p>
          ) : (
            <div className="space-y-1.5">
              {recent.map((s) => {
                const prof = profileMap.get(s.user_id);
                const prob = problemMap.get(s.problem_id);
                const probTitle = prob
                  ? locale === "en" && prob.title_en
                    ? prob.title_en
                    : prob.title_mn
                  : "—";
                return (
                  <div
                    key={s.id}
                    className="grid grid-cols-[180px_1fr_auto_auto] gap-3 items-center p-2 rounded hover:bg-muted text-sm"
                  >
                    <span className="truncate font-medium">
                      {prof?.display_name ?? "?"}
                    </span>
                    <Link
                      href={prob ? `/problems/${prob.slug}` : "#"}
                      className="truncate text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {probTitle}
                    </Link>
                    <VerdictBadge
                      verdict={s.verdict}
                      label={tVerdict(s.verdict)}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                      {new Date(s.created_at).toLocaleString(locale, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "violet" | "emerald" | "amber" | "rose";
}) {
  const styles = {
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[color]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-semibold text-lg tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
