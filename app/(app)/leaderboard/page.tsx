import { getTranslations } from "next-intl/server";
import { Trophy, Crown, Medal, Sparkles, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/get-session";
import { dicebearUrl, initials } from "@/lib/avatars";

export const revalidate = 300; // ISR: serve cached page for 5min — reduces Tokyo round-trips

export default async function LeaderboardPage() {
  const t = await getTranslations("leaderboard");
  const supabase = await createClient();
  const user = await getCachedSession();

  const [{ data: classCup }, { data: rows }] = await Promise.all([
    supabase.rpc("class_week_xp"),
    supabase
      .from("profiles")
      .select(
        "id, username, display_name, xp, level, problems_solved, class_id, avatar_seed",
      )
      .eq("role", "student")
      .order("xp", { ascending: false })
      .order("problems_solved", { ascending: false })
      .limit(50),
  ]);

  const classIds = Array.from(
    new Set(
      (rows ?? []).map((r) => r.class_id).filter((id): id is string => !!id),
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

  const topClasses = (classCup ?? []).filter((c) => c.student_count > 0);
  const topWeekXp = topClasses[0]?.week_xp ?? 0;

  const allRows = rows ?? [];
  const top3 = allRows.slice(0, 3);
  const rest = allRows.slice(3);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {topClasses.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />7 хоногийн анги —
              Class Cup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topClasses.map((c, i) => {
              const rank = i + 1;
              const pct = topWeekXp > 0 ? (c.week_xp / topWeekXp) * 100 : 0;
              return (
                <div key={c.class_id} className="space-y-1">
                  <div className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center shrink-0">
                      <RankIcon rank={rank} />
                    </span>
                    <span className="font-semibold flex-1">{c.class_name}</span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {c.student_count}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400 tabular-nums min-w-[60px] justify-end">
                      <Sparkles className="h-3 w-3" />
                      {c.week_xp}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        rank === 1
                          ? "bg-gradient-to-r from-amber-400 to-amber-500"
                          : rank === 2
                            ? "bg-gradient-to-r from-slate-400 to-slate-500"
                            : rank === 3
                              ? "bg-gradient-to-r from-amber-700 to-amber-800"
                              : "bg-gradient-to-r from-violet-400 to-violet-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {top3.length > 0 && <Podium top3={top3} />}

      <Card>
        <div className="hidden sm:grid grid-cols-[60px_1fr_100px_100px_100px] gap-2 p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
          <div>{t("rank")}</div>
          <div>{t("student")}</div>
          <div className="text-center">{t("class")}</div>
          <div className="text-right">{t("xp")}</div>
          <div className="text-right">{t("problems")}</div>
        </div>
        <div className="divide-y">
          {rest.map((row, i) => {
            const isMe = user?.id === row.id;
            const rank = i + 4;
            const className = row.class_id
              ? (classMap.get(row.class_id) ?? "—")
              : "—";
            const avatarUrl = dicebearUrl(row.avatar_seed);
            return (
              <div
                key={row.id}
                className={`grid grid-cols-[60px_1fr_60px_80px] sm:grid-cols-[60px_1fr_100px_100px_100px] gap-2 p-3 items-center hover:bg-muted/30 transition-colors ${
                  isMe ? "bg-violet-50 dark:bg-violet-950/30" : ""
                }`}
              >
                <div className="flex items-center justify-center">
                  <RankIcon rank={rank} />
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={avatarUrl} alt={row.display_name} />
                    <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 text-xs font-bold">
                      {initials(row.display_name) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {row.display_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate sm:hidden">
                      Lv {row.level} · {row.xp} XP
                    </div>
                  </div>
                </div>
                <div className="text-sm text-center hidden sm:block">
                  {className}
                </div>
                <div className="hidden sm:block text-right tabular-nums font-semibold text-violet-600">
                  {row.xp}
                </div>
                <div className="text-right tabular-nums text-sm">
                  {row.problems_solved}
                </div>
              </div>
            );
          })}
          {(!rows || rows.length === 0) && (
            <p className="text-center text-muted-foreground py-12">—</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
  return (
    <span className="text-sm font-semibold text-muted-foreground tabular-nums">
      {rank}
    </span>
  );
}

/* ---- Podium for top 3 ---- */

interface PodiumStudent {
  id: string;
  display_name: string;
  avatar_seed: string;
  xp: number;
  level: number;
}

function Podium({ top3 }: { top3: PodiumStudent[] }) {
  // Reorder: [2nd, 1st, 3rd] for visual layout
  const ordered =
    top3.length >= 3
      ? [top3[1], top3[0], top3[2]]
      : top3.length === 2
        ? [top3[1], top3[0]]
        : [top3[0]];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 pt-4 pb-2">
      {ordered.map((student, i) => {
        // original rank: if 3 entries, ordered = [2nd, 1st, 3rd]; if 2 entries, [2nd, 1st]; if 1, [1st]
        const originalIndex = top3.indexOf(student);
        const rank = originalIndex + 1;
        const heightClass =
          rank === 1
            ? "h-28 sm:h-36"
            : rank === 2
              ? "h-20 sm:h-28"
              : "h-16 sm:h-20";
        const bgClass =
          rank === 1
            ? "from-amber-400 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            : rank === 2
              ? "from-slate-400 to-slate-500 shadow-[0_0_15px_rgba(148,163,184,0.25)]"
              : "from-amber-700 to-amber-800 shadow-[0_0_12px_rgba(180,83,9,0.2)]";
        const ringColor =
          rank === 1
            ? "ring-amber-400"
            : rank === 2
              ? "ring-slate-300"
              : "ring-amber-600";
        const avatarUrl = dicebearUrl(student.avatar_seed);

        return (
          <div key={student.id} className="flex flex-col items-center gap-1.5">
            <div className="relative">
              <Avatar
                className={`h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-offset-2 ring-offset-background ${ringColor}`}
              >
                <AvatarImage src={avatarUrl} alt={student.display_name} />
                <AvatarFallback className="bg-violet-100 text-violet-700 text-sm font-bold">
                  {initials(student.display_name) || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background border text-[10px] font-bold">
                {rank}
              </span>
            </div>
            <div
              className={`w-20 sm:w-24 ${heightClass} rounded-t-lg bg-gradient-to-b ${bgClass} flex flex-col items-center justify-end pb-2 text-white`}
            >
              <span className="text-[10px] sm:text-xs font-semibold leading-tight text-center px-1 truncate max-w-full">
                {student.display_name}
              </span>
              <span className="text-[10px] sm:text-xs opacity-80">
                Lv{student.level} · {student.xp} XP
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
