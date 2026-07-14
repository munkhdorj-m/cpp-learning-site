import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations();
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, description, start_at, due_at, allow_late, late_penalty_pct")
    .eq("id", id)
    .maybeSingle();
  if (!assignment) notFound();

  const { data: links } = await supabase
    .from("assignment_problems")
    .select("problem_id, points, order_idx")
    .eq("assignment_id", id)
    .order("order_idx", { ascending: true });

  const problemIds = (links ?? []).map((l) => l.problem_id);
  const { data: problems } = problemIds.length
    ? await supabase
        .from("problems")
        .select("id, slug, title_mn, title_en, difficulty")
        .in("id", problemIds)
    : { data: [] as { id: string; slug: string; title_mn: string; title_en: string | null; difficulty: "easy" | "medium" | "hard" }[] };
  const problemById = new Map((problems ?? []).map((p) => [p.id, p]));

  const solvedSet = new Set<string>();
  if (problemIds.length > 0) {
    const { data: mySubs } = await supabase
      .from("submissions")
      .select("problem_id")
      .eq("user_id", user.id)
      .eq("verdict", "accepted")
      .eq("is_first_accepted", true)
      .in("problem_id", problemIds);
    for (const s of mySubs ?? []) solvedSet.add(s.problem_id);
  }

  const totalProblems = (links ?? []).length;
  const totalPoints = (links ?? []).reduce((sum, l) => sum + l.points, 0);
  const earned = (links ?? []).reduce(
    (sum, l) => sum + (solvedSet.has(l.problem_id) ? l.points : 0),
    0,
  );
  const solvedCount = (links ?? []).filter((l) =>
    solvedSet.has(l.problem_id),
  ).length;

  const now = Date.now();
  const start = new Date(assignment.start_at).getTime();
  const due = new Date(assignment.due_at).getTime();
  const status = now < start ? "upcoming" : now > due ? "past" : "live";

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/assignments"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3 text-sm">
          <StatusPill status={status} />
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Due{" "}
            {new Date(assignment.due_at).toLocaleString(locale, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {status === "past" && !assignment.allow_late && (
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              Closed
            </span>
          )}
          {status === "past" && assignment.allow_late && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Late: -{assignment.late_penalty_pct}%
            </span>
          )}
        </CardContent>
      </Card>

      {assignment.description && (
        <Card>
          <CardContent className="p-4">
            <Markdown>{assignment.description}</Markdown>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-semibold">Progress</span>
              <span className="text-muted-foreground tabular-nums">
                {solvedCount} / {totalProblems} · {earned} / {totalPoints} pts
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                style={{
                  width: `${totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("teacher.assignments.field.problems")}
        </div>
        <div className="divide-y">
          {(links ?? []).map((link, i) => {
            const p = problemById.get(link.problem_id);
            if (!p) return null;
            const solved = solvedSet.has(p.id);
            const title = locale === "en" && p.title_en ? p.title_en : p.title_mn;
            const diffStyle =
              p.difficulty === "easy"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : p.difficulty === "medium"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
            return (
              <Link
                key={p.id}
                href={`/problems/${p.slug}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 transition-colors",
                  solved
                    ? "bg-emerald-50/60 dark:bg-emerald-950/15 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/30"
                    : "hover:bg-muted/40",
                )}
              >
                <span className="text-xs text-muted-foreground tabular-nums w-6 text-right shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="shrink-0">
                  {solved ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </span>
                <span
                  className={cn(
                    "flex-1 truncate font-medium",
                    solved && "text-emerald-900 dark:text-emerald-200",
                  )}
                >
                  {title}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md shrink-0 ${diffStyle}`}>
                  {t(`problems.difficulty.${p.difficulty}`)}
                </span>
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold tabular-nums shrink-0">
                  <Sparkles className="h-3 w-3" />
                  {link.points}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
          {(links ?? []).length === 0 && (
            <p className="text-center text-muted-foreground py-8">—</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatusPill({ status }: { status: "live" | "upcoming" | "past" }) {
  const labels = { live: "Active", upcoming: "Upcoming", past: "Past" };
  const styles = {
    live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    upcoming: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    past: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status === "live" && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {labels[status]}
    </span>
  );
}
