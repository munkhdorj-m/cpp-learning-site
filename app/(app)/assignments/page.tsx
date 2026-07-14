import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Calendar, ClipboardList, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentAssignmentsPage() {
  const t = await getTranslations("nav");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // RLS already restricts assignments to the student's class.
  const { data: assignments } = await supabase
    .from("assignments")
    .select("id, title, description, start_at, due_at")
    .order("due_at", { ascending: true });

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  type LinkRow = { assignment_id: string; problem_id: string; points: number };
  let links: LinkRow[] = [];
  if (assignmentIds.length > 0) {
    const { data } = await supabase
      .from("assignment_problems")
      .select("assignment_id, problem_id, points")
      .in("assignment_id", assignmentIds);
    links = data ?? [];
  }

  // Collect unique problem ids and fetch this student's first-AC submissions for them.
  const problemIds = Array.from(new Set(links.map((l) => l.problem_id)));
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

  // Aggregate per-assignment progress
  const progress = new Map<
    string,
    { total: number; solved: number; score: number; max: number }
  >();
  for (const l of links) {
    const agg = progress.get(l.assignment_id) ?? {
      total: 0,
      solved: 0,
      score: 0,
      max: 0,
    };
    agg.total += 1;
    agg.max += l.points;
    if (solvedSet.has(l.problem_id)) {
      agg.solved += 1;
      agg.score += l.points;
    }
    progress.set(l.assignment_id, agg);
  }

  const now = Date.now();
  const live: typeof assignments = [];
  const past: typeof assignments = [];
  const upcoming: typeof assignments = [];
  for (const a of assignments ?? []) {
    const start = new Date(a.start_at).getTime();
    const due = new Date(a.due_at).getTime();
    if (now < start) upcoming!.push(a);
    else if (now > due) past!.push(a);
    else live!.push(a);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{t("assignments")}</h1>

      <Section title="Идэвхтэй" items={live} locale={locale} progress={progress} accent />
      <Section title="Удахгүй" items={upcoming} locale={locale} progress={progress} />
      <Section title="Дууссан" items={past} locale={locale} progress={progress} muted />

      {(!live || live.length === 0) &&
        (!upcoming || upcoming.length === 0) &&
        (!past || past.length === 0) && (
          <Card>
            <p className="text-center text-muted-foreground py-12">
              Одоогоор даалгавар алга
            </p>
          </Card>
        )}
    </div>
  );
}

interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  due_at: string;
}

function Section({
  title,
  items,
  locale,
  progress,
  accent,
  muted,
}: {
  title: string;
  items: AssignmentRow[] | null;
  locale: string;
  progress: Map<string, { total: number; solved: number; score: number; max: number }>;
  accent?: boolean;
  muted?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-2">
        {items.map((a) => {
          const p = progress.get(a.id) ?? { total: 0, solved: 0, score: 0, max: 0 };
          const done = p.total > 0 && p.solved === p.total;
          const pct = p.total > 0 ? (p.solved / p.total) * 100 : 0;
          return (
            <Link key={a.id} href={`/assignments/${a.id}`}>
              <Card
                className={cn(
                  "hover:border-violet-300 dark:hover:border-violet-700 transition-colors",
                  accent &&
                    "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/15",
                  muted && "opacity-70",
                  done && "border-emerald-400 dark:border-emerald-700",
                )}
              >
                <div className="p-4 flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <ClipboardList className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{a.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 max-w-[140px] h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            done
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-violet-400 to-violet-500",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {p.solved} / {p.total}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(a.due_at).toLocaleDateString(locale, {
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
    </div>
  );
}
