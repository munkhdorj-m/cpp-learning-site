import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowLeft, Trophy, Flame, BookOpen } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createServiceClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function ClassRosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations();
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = createServiceClient();

  const { data: cls } = await supabase
    .from("classes")
    .select("name, grade")
    .eq("id", id)
    .maybeSingle();
  if (!cls) notFound();

  const { data: students } = await supabase
    .from("profiles")
    .select(
      "id, username, display_name, xp, level, problems_solved, streak_days",
    )
    .eq("class_id", id)
    .eq("role", "student")
    .order("xp", { ascending: false });

  const studentIds = (students ?? []).map((s) => s.id);
  const lastSubMap = new Map<string, string>();
  let totalSubs = 0;
  let acceptedSubs = 0;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  if (studentIds.length > 0) {
    const [{ data: lastSubs }, { count: subCount }, { count: acCount }] =
      await Promise.all([
        supabase
          .from("submissions")
          .select("user_id, created_at")
          .in("user_id", studentIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .in("user_id", studentIds),
        supabase
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .in("user_id", studentIds)
          .eq("verdict", "accepted"),
      ]);
    for (const s of lastSubs ?? []) {
      if (!lastSubMap.has(s.user_id)) lastSubMap.set(s.user_id, s.created_at);
    }
    totalSubs = subCount ?? 0;
    acceptedSubs = acCount ?? 0;
  }

  // Difficulty breakdown of solved problems
  const { data: solvedProblems } = await supabase
    .from("submissions")
    .select("problem_id")
    .in("user_id", studentIds)
    .eq("verdict", "accepted")
    .eq("is_first_accepted", true);
  if (solvedProblems && solvedProblems.length > 0) {
    const pIds = Array.from(new Set(solvedProblems.map((s) => s.problem_id)));
    const { data: probs } = await supabase
      .from("problems")
      .select("difficulty")
      .in("id", pIds);
    for (const p of probs ?? []) {
      if (p.difficulty === "easy") easySolved++;
      else if (p.difficulty === "medium") mediumSolved++;
      else if (p.difficulty === "hard") hardSolved++;
    }
  }

  const successRate =
    totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/teacher/classes"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{cls.name}</h1>
          <p className="text-xs text-muted-foreground">
            Grade {cls.grade} · {students?.length ?? 0}{" "}
            {t("teacher.classes.students")}
          </p>
        </div>
      </div>

      {/* Class analytics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {students?.length ?? 0}
            </div>
            <div className="text-xs text-muted-foreground">Students</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{totalSubs}</div>
            <div className="text-xs text-muted-foreground">Submissions</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums text-emerald-600">
              {acceptedSubs}
            </div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {successRate}%
            </div>
            <div className="text-xs text-muted-foreground">Success rate</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums text-violet-600">
              {easySolved + mediumSolved + hardSolved}
            </div>
            <div className="text-xs text-muted-foreground">Problems solved</div>
          </div>
        </Card>
      </div>

      {/* Difficulty breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-emerald-200 dark:border-emerald-900">
          <div className="p-4 text-center">
            <div className="text-xl font-bold tabular-nums text-emerald-600">
              {easySolved}
            </div>
            <div className="text-xs text-muted-foreground">Easy solved</div>
          </div>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900">
          <div className="p-4 text-center">
            <div className="text-xl font-bold tabular-nums text-amber-600">
              {mediumSolved}
            </div>
            <div className="text-xs text-muted-foreground">Medium solved</div>
          </div>
        </Card>
        <Card className="border-rose-200 dark:border-rose-900">
          <div className="p-4 text-center">
            <div className="text-xl font-bold tabular-nums text-rose-600">
              {hardSolved}
            </div>
            <div className="text-xs text-muted-foreground">Hard solved</div>
          </div>
        </Card>
      </div>

      {!students || students.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">—</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="hidden md:grid grid-cols-[40px_1fr_80px_80px_90px_140px] gap-3 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div></div>
            <div>{t("leaderboard.student")}</div>
            <div className="text-right">{t("profile.level")}</div>
            <div className="text-right">{t("profile.xp")}</div>
            <div className="text-right">{t("profile.problems_solved")}</div>
            <div className="text-right">Last active</div>
          </div>
          <div className="divide-y">
            {students.map((s) => {
              const initials = s.display_name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const last = lastSubMap.get(s.id);
              return (
                <div
                  key={s.id}
                  className="grid md:grid-cols-[40px_1fr_80px_80px_90px_140px] gap-3 px-4 py-3 items-center"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 text-xs font-bold">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.display_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      @{s.username}
                    </div>
                  </div>
                  <div className="text-right tabular-nums hidden md:flex items-center justify-end gap-1 text-amber-600">
                    <Trophy className="h-3.5 w-3.5" />
                    {s.level}
                  </div>
                  <div className="text-right tabular-nums hidden md:block font-semibold text-violet-600 dark:text-violet-400">
                    {s.xp}
                  </div>
                  <div className="text-right tabular-nums hidden md:flex items-center justify-end gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    {s.problems_solved}
                  </div>
                  <div className="text-right text-xs text-muted-foreground tabular-nums hidden md:flex items-center justify-end gap-1">
                    {s.streak_days > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                        <Flame className="h-3 w-3" />
                        {s.streak_days}
                      </span>
                    )}
                    <span>
                      {last
                        ? new Date(last).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
