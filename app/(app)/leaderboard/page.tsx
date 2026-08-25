import { getTranslations, getLocale } from "next-intl/server";
import { Trophy, Crown, Medal, Sparkles, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/get-session";
import { dicebearUrl, initials } from "@/lib/avatars";
import { requireAuth } from "@/lib/auth-helpers";

// Render fresh from the local MySQL DB (fast — no external round-trips).
import { buildDivisions, type ClassRow } from "@/lib/class-cup";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  // 50 students' names, class and XP — verified high-severity leak
  await requireAuth();

  const t = await getTranslations("leaderboard");
  const locale = await getLocale();
  const en = locale === "en";
  const youLabel = en ? "YOU" : "ТА";
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

  // Ranked by XP per student, inside a division of comparable years — see
  // lib/class-cup.ts for why total XP in one table was the wrong measure.
  const divisions = buildDivisions((classCup ?? []) as ClassRow[]);

  const allRows = rows ?? [];
  const top3 = allRows.slice(0, 3);
  const rest = allRows.slice(3);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">{"//"}</span>
          RANKING.TOP50
        </div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      {divisions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-arcade-yellow" />
              {t("class_cup")}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t("class_cup_note")}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {divisions.map((div) => (
              <div key={div.key} className="space-y-2">
                <div className="hud-label flex items-center gap-2">
                  {div.key === "senior"
                    ? t("division_senior", {
                        from: div.grades[0] ?? 9,
                        to: div.grades[div.grades.length - 1] ?? 12,
                      })
                    : t("division_grade", { grade: div.grades[0] ?? 0 })}
                  <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
                </div>

                {div.classes.map((c) => (
                  <div key={c.class_id} className="space-y-1">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                        <RankIcon rank={c.rank} />
                      </span>
                      <span className="flex-1 font-semibold">
                        {c.class_name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {c.student_count}
                      </span>
                      {/* The average is what the table is ordered by, so it is
                          the number that gets the emphasis; the total is kept
                          beside it because a class still wants to see it. */}
                      <span className="inline-flex min-w-[92px] items-center justify-end gap-1 font-semibold tabular-nums text-primary">
                        <Sparkles className="h-3 w-3" />
                        {c.average}
                        <span className="font-code text-[10px] font-normal text-muted-foreground">
                          {t("xp_each")}
                        </span>
                      </span>
                      <span className="hidden min-w-[64px] justify-end font-code text-[11px] tabular-nums text-muted-foreground sm:inline-flex">
                        {c.week_xp} {t("xp_total")}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          c.rank === 1
                            ? "bg-arcade-yellow"
                            : c.rank === 2
                              ? "bg-arcade-cyan"
                              : c.rank === 3
                                ? "bg-arcade-mag"
                                : "bg-primary/50"
                        }`}
                        style={{ width: `${c.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {top3.length > 0 && (
        <Podium
          top3={top3}
          meId={user?.id}
          youLabel={youLabel}
          classMap={classMap}
        />
      )}

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
                className={`relative grid grid-cols-[60px_1fr_60px_80px] sm:grid-cols-[60px_1fr_100px_100px_100px] gap-2 p-3 items-center transition-colors ${
                  isMe
                    ? "bg-primary/[0.1] ring-1 ring-inset ring-primary/35 hover:bg-primary/[0.15]"
                    : "hover:bg-muted/30"
                }`}
              >
                {isMe && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[3px] bg-primary shadow-[0_0_10px_1px_var(--color-primary)]"
                  />
                )}
                <div className="flex items-center justify-center">
                  <RankIcon rank={rank} />
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar
                    className={`h-8 w-8 shrink-0 ${isMe ? "ring-2 ring-primary/60 ring-offset-1 ring-offset-background" : ""}`}
                  >
                    <AvatarImage src={avatarUrl} alt={row.display_name} />
                    <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 text-xs font-bold">
                      {initials(row.display_name) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`truncate font-medium ${isMe ? "text-primary text-glow-soft" : ""}`}
                      >
                        {row.display_name}
                      </span>
                      {isMe && (
                        <span className="hud-chip shrink-0">{youLabel}</span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground sm:hidden">
                      Lv {row.level} · {row.xp} XP
                    </div>
                  </div>
                </div>
                <div className="hidden text-center text-sm sm:block">
                  {className}
                </div>
                <div
                  className={`hidden text-right font-semibold tabular-nums sm:block ${isMe ? "text-primary" : "text-violet-600 dark:text-violet-400"}`}
                >
                  {row.xp}
                </div>
                <div className="text-right text-sm tabular-nums">
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
  if (rank === 2) return <Medal className="h-5 w-5 text-amber-soft" />;
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
  class_id: string | null;
}

/**
 * Pixel flames for first place.
 *
 * Stepped polygons rather than curves, so the fire belongs to the same world
 * as the rest of the cabinet. Three tongues, each flickering on its own clock
 * (see .flame-tongue in globals.css) — one shared animation would look like a
 * single shape wobbling rather than something burning.
 */
function Flames() {
  return (
    <svg
      viewBox="0 0 48 34"
      className="pointer-events-none absolute -top-[26px] left-1/2 h-[34px] w-12 -translate-x-1/2"
      aria-hidden="true"
    >
      <polygon
        className="flame-tongue"
        fill="var(--fire-edge)"
        points="24,0 30,8 28,12 34,14 32,22 38,26 36,34 12,34 10,26 16,22 14,14 20,12 18,8"
      />
      <polygon
        className="flame-tongue"
        fill="var(--fire-mid)"
        points="24,6 29,14 27,18 31,22 29,34 19,34 17,22 21,18 19,14"
      />
      <polygon
        className="flame-tongue"
        fill="var(--fire-core)"
        points="24,14 27,20 25,24 27,28 25,34 21,34 21,28 23,24 21,20"
      />
    </svg>
  );
}

function Podium({
  top3,
  meId,
  youLabel,
  classMap,
}: {
  top3: PodiumStudent[];
  meId?: string;
  youLabel: string;
  classMap: Map<string, string>;
}) {
  // Reorder: [2nd, 1st, 3rd] for visual layout
  const ordered =
    top3.length >= 3
      ? [top3[1], top3[0], top3[2]]
      : top3.length === 2
        ? [top3[1], top3[0]]
        : [top3[0]];

  return (
    <div className="flex items-end justify-center gap-2 pt-10 pb-2 sm:gap-4">
      {ordered.map((student) => {
        // original rank: if 3 entries, ordered = [2nd, 1st, 3rd]; if 2 entries, [2nd, 1st]; if 1, [1st]
        const rank = top3.indexOf(student) + 1;
        const first = rank === 1;
        const isMe = !!meId && student.id === meId;
        const avatarUrl = dicebearUrl(student.avatar_seed);
        const grade = student.class_id
          ? (classMap.get(student.class_id) ?? null)
          : null;

        // One hue per place, straight from the arcade palette. The pedestal
        // text is --background, which inverts with the theme exactly as the
        // pedestal does, so it stays readable in both.
        const hue =
          rank === 1
            ? "var(--arcade-yellow)"
            : rank === 2
              ? "var(--arcade-cyan)"
              : "var(--arcade-mag)";

        const plinth = first
          ? "h-24 sm:h-32"
          : rank === 2
            ? "h-16 sm:h-24"
            : "h-12 sm:h-16";

        return (
          <div
            key={student.id}
            /* Wide enough for a full Mongolian name on two lines. The old
               fixed w-20 with truncate is what cut "Гэрэлтуяа Т…" short. */
            className="flex w-[104px] flex-col items-center sm:w-[148px]"
          >
            <div className={first ? "podium-bob" : undefined}>
              <div className="relative flex justify-center">
                {first && <Flames />}
                {first && (
                  <Crown
                    className="absolute -top-[9px] left-1/2 h-4 w-4 -translate-x-1/2 text-[var(--fire-core)]"
                    aria-hidden
                  />
                )}
                <Avatar
                  className="rounded-none"
                  style={{
                    width: first ? 68 : 52,
                    height: first ? 68 : 52,
                    border: `${first ? 4 : 3}px solid ${hue}`,
                    boxShadow: `${first ? 6 : 4}px ${first ? 6 : 4}px 0 0 var(--drop)`,
                  }}
                >
                  <AvatarImage src={avatarUrl} alt={student.display_name} />
                  <AvatarFallback className="rounded-none text-sm font-bold">
                    {initials(student.display_name) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="hud-label absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5"
                  style={{ background: hue, color: "var(--background)" }}
                >
                  {rank}
                </span>
              </div>
            </div>

            {/* Full name: wraps, never truncates. */}
            <p className="mt-4 text-center text-[13px] font-semibold leading-tight text-balance sm:text-sm">
              {student.display_name}
            </p>

            <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
              {grade && (
                <span
                  className="hud-chip"
                  style={{ ["--glow" as string]: hue }}
                >
                  {grade}
                </span>
              )}
              {isMe && <span className="hud-chip">{youLabel}</span>}
            </div>

            <p className="mt-1 font-code text-[11px] text-muted-foreground tabular-nums">
              Lv{student.level} · {student.xp} XP
            </p>

            <div
              className={`mt-2 flex w-full ${plinth} items-start justify-center pt-1.5`}
              style={{
                background: hue,
                color: "var(--background)",
                boxShadow: "6px 6px 0 0 var(--drop)",
              }}
            >
              <span className="font-heading text-lg leading-none sm:text-2xl">
                {rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
