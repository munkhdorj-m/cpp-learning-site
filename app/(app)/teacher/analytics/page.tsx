import { getLocale } from "next-intl/server";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ProblemStat {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  difficulty: string;
  total_subs: number;
  accepted_subs: number;
  unique_attempters: number;
  unique_solvers: number;
}

export default async function TeacherAnalyticsPage() {
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = createServiceClient();

  // Fetch all problems
  const { data: problems } = await supabase
    .from("problems")
    .select("id, slug, title_mn, title_en, difficulty")
    .eq("is_public", true)
    .order("difficulty", { ascending: true })
    .order("created_at", { ascending: true });

  // Fetch submission stats per problem
  const { data: subs } = await supabase
    .from("submissions")
    .select("problem_id, verdict, user_id, is_first_accepted");

  // Aggregate
  const statsMap = new Map<string, ProblemStat>();
  for (const p of problems ?? []) {
    statsMap.set(p.id, {
      id: p.id,
      slug: p.slug,
      title_mn: p.title_mn,
      title_en: p.title_en,
      difficulty: p.difficulty,
      total_subs: 0,
      accepted_subs: 0,
      unique_attempters: new Set<string>().size,
      unique_solvers: 0,
    });
  }

  const attemptersMap = new Map<string, Set<string>>();
  const solversMap = new Map<string, Set<string>>();

  for (const s of subs ?? []) {
    const stat = statsMap.get(s.problem_id);
    if (!stat) continue;
    stat.total_subs++;

    if (!attemptersMap.has(s.problem_id)) {
      attemptersMap.set(s.problem_id, new Set());
    }
    attemptersMap.get(s.problem_id)!.add(s.user_id);

    if (s.verdict === "accepted") {
      stat.accepted_subs++;
      if (!solversMap.has(s.problem_id)) {
        solversMap.set(s.problem_id, new Set());
      }
      solversMap.get(s.problem_id)!.add(s.user_id);
    }
  }

  for (const [pid, set] of attemptersMap) {
    const stat = statsMap.get(pid);
    if (stat) stat.unique_attempters = set.size;
  }
  for (const [pid, set] of solversMap) {
    const stat = statsMap.get(pid);
    if (stat) stat.unique_solvers = set.size;
  }

  const stats = Array.from(statsMap.values()).filter((s) => s.total_subs > 0);

  const diffColor: Record<string, string> = {
    easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    medium:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    hard: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Problem Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Solve rates and attempt counts per problem — helps calibrate
          difficulty
        </p>
      </div>

      {stats.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">
            No submission data yet
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="hidden md:grid grid-cols-[1fr_80px_80px_80px_80px_100px] gap-3 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div>Problem</div>
            <div className="text-right">Subs</div>
            <div className="text-right">AC</div>
            <div className="text-right">Tried</div>
            <div className="text-right">Solved</div>
            <div className="text-right">Solve rate</div>
          </div>
          <div className="divide-y">
            {stats.map((s) => {
              const title =
                locale === "en" && s.title_en ? s.title_en : s.title_mn;
              const solveRate =
                s.unique_attempters > 0
                  ? Math.round((s.unique_solvers / s.unique_attempters) * 100)
                  : 0;
              const acRate =
                s.total_subs > 0
                  ? Math.round((s.accepted_subs / s.total_subs) * 100)
                  : 0;
              return (
                <div
                  key={s.id}
                  className="grid md:grid-cols-[1fr_80px_80px_80px_80px_100px] gap-3 px-4 py-2.5 items-center text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{title}</div>
                    <span
                      className={cn(
                        "inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5",
                        diffColor[s.difficulty],
                      )}
                    >
                      {s.difficulty}
                    </span>
                  </div>
                  <div className="text-right tabular-nums text-muted-foreground">
                    {s.total_subs}
                  </div>
                  <div className="text-right tabular-nums text-emerald-600">
                    {s.accepted_subs}
                  </div>
                  <div className="text-right tabular-nums text-muted-foreground">
                    {s.unique_attempters}
                  </div>
                  <div className="text-right tabular-nums text-violet-600">
                    {s.unique_solvers}
                  </div>
                  <div className="text-right tabular-nums">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-semibold",
                        solveRate >= 70
                          ? "text-emerald-600"
                          : solveRate >= 30
                            ? "text-amber-600"
                            : "text-rose-600",
                      )}
                    >
                      {solveRate >= 70 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : solveRate >= 30 ? (
                        <Minus className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {solveRate}%
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
