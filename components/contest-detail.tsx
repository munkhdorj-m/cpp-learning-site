import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Calendar, Crown, Medal, Trophy, Sparkles, ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Markdown } from "@/components/markdown";
import { createServiceClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

interface Props {
  contestId: string;
  currentUserId?: string | null;
  headerActions?: React.ReactNode;
}

export async function ContestDetail({
  contestId,
  currentUserId,
  headerActions,
}: Props) {
  const t = await getTranslations();
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = createServiceClient();

  const [{ data: contest }, { data: problemLinks }, leaderboardRes] = await Promise.all([
    supabase.from("contests").select("*").eq("id", contestId).maybeSingle(),
    supabase
      .from("contest_problems")
      .select("problem_id, points, order_idx")
      .eq("contest_id", contestId)
      .order("order_idx", { ascending: true }),
    supabase.rpc("contest_leaderboard", { contest_id_in: contestId }),
  ]);

  if (!contest) return null;

  const problemIds = (problemLinks ?? []).map((p) => p.problem_id);
  const { data: problems } = problemIds.length
    ? await supabase
        .from("problems")
        .select("id, slug, title_mn, title_en, difficulty")
        .in("id", problemIds)
    : { data: [] };
  const problemById = new Map(
    (problems ?? []).map((p) => [
      p.id,
      {
        slug: p.slug,
        title: locale === "en" && p.title_en ? p.title_en : p.title_mn,
        difficulty: p.difficulty,
      },
    ]),
  );

  let className: string | null = null;
  if (contest.class_id) {
    const { data: cls } = await supabase
      .from("classes")
      .select("name")
      .eq("id", contest.class_id)
      .maybeSingle();
    className = cls?.name ?? null;
  }

  const now = Date.now();
  const start = new Date(contest.start_at).getTime();
  const end = new Date(contest.end_at).getTime();
  const status = now < start ? "upcoming" : now > end ? "past" : "live";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold">{contest.title}</h1>
            <p className="text-xs text-muted-foreground">
              {className ? className : "Open to all"}
            </p>
          </div>
        </div>
        {headerActions}
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3 text-sm">
          <StatusPill status={status} />
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(contest.start_at).toLocaleString(locale, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            <span>→</span>
            {new Date(contest.end_at).toLocaleString(locale, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </CardContent>
      </Card>

      {contest.description && (
        <Card>
          <CardContent className="p-4">
            <Markdown>{contest.description}</Markdown>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <Card className="overflow-hidden p-0">
          <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Problems
          </div>
          <div className="divide-y">
            {(problemLinks ?? []).map((link, i) => {
              const p = problemById.get(link.problem_id);
              if (!p) return null;
              const diffStyle =
                p.difficulty === "easy"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : p.difficulty === "medium"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
              return (
                <Link
                  key={link.problem_id}
                  href={`/problems/${p.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs text-muted-foreground tabular-nums w-6 text-right shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 truncate font-medium">{p.title}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-md ${diffStyle}`}
                  >
                    {t(`problems.difficulty.${p.difficulty}`)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold tabular-nums">
                    <Sparkles className="h-3 w-3" />
                    {link.points}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              );
            })}
            {(problemLinks ?? []).length === 0 && (
              <p className="text-center text-muted-foreground py-8">—</p>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Leaderboard
          </div>
          <div className="divide-y">
            {(leaderboardRes.data ?? []).slice(0, 30).map((row, i) => {
              const rank = i + 1;
              const initials = row.display_name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const isMe = currentUserId === row.user_id;
              return (
                <div
                  key={row.user_id}
                  className={`flex items-center gap-2 px-3 py-2 ${
                    isMe ? "bg-violet-50 dark:bg-violet-950/30" : ""
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center shrink-0">
                    <RankIcon rank={rank} />
                  </span>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 text-xs font-bold">
                      {initials || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {row.display_name}
                    </div>
                    {row.class_name && (
                      <div className="text-xs text-muted-foreground truncate">
                        {row.class_name}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 tabular-nums">
                    {row.score}
                  </span>
                </div>
              );
            })}
            {(leaderboardRes.data ?? []).length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">—</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "live" | "upcoming" | "past" }) {
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
      {status}
    </span>
  );
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Trophy className="h-4 w-4 text-amber-700" />;
  return <span className="text-xs font-semibold text-muted-foreground tabular-nums">{rank}</span>;
}
