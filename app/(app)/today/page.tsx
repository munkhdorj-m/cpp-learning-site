import Link from "next/link";
import { getLocale } from "next-intl/server";
import { ArrowRight, BookOpen, RotateCcw, Code2, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCachedSession, getCachedProfile } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { LESSONS, UNITS } from "@/lib/lessons";
import { primaryTopic } from "@/lib/problem-topics";
import { today } from "@/lib/progress/schedule";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { ReviewDrill } from "./review-drill";

export const dynamic = "force-dynamic";
export const metadata = { title: "Today" };

interface ProblemRow {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  difficulty: string;
  xp_reward: number;
  tags: unknown;
}

/** Everything the page needs, with each piece failing on its own. */
async function load(userId: string) {
  const safe = async <T,>(run: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await run();
    } catch {
      return fallback;
    }
  };

  const doneLessons = await safe(
    async () =>
      new Set(
        (
          await query<{ slug: string }>(
            "SELECT slug FROM content_progress WHERE user_id = ? AND kind = 'lesson'",
            [userId],
          )
        ).map((r) => r.slug),
      ),
    new Set<string>(),
  );

  const dueCount = await safe(async () => {
    const rows = await query<{ n: number }>(
      "SELECT COUNT(*) AS n FROM review_items WHERE user_id = ? AND due_on <= ?",
      [userId, today()],
    );
    return Number(rows[0]?.n ?? 0);
  }, 0);

  const solved = await safe(
    async () =>
      new Set(
        (
          await query<{ problem_id: string }>(
            "SELECT DISTINCT problem_id FROM submissions WHERE user_id = ? AND verdict = 'accepted'",
            [userId],
          )
        ).map((r) => r.problem_id),
      ),
    new Set<string>(),
  );

  const problems = await safe(
    () =>
      query<ProblemRow>(
        `SELECT id, slug, title_mn, title_en, difficulty, xp_reward, tags
           FROM problems WHERE is_public = 1`,
      ),
    [] as ProblemRow[],
  );

  return { doneLessons, dueCount, solved, problems };
}

export default async function TodayPage() {
  const user = await getCachedSession();
  if (!user) return null; // the layout redirects; this keeps types honest

  const localeRaw = await getLocale();
  const en = (isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE) === "en";

  const profile = await getCachedProfile(user.id).catch(() => null);
  const { doneLessons, dueCount, solved, problems } = await load(user.id);

  const nextLesson = LESSONS.find((l) => !doneLessons.has(l.slug)) ?? null;
  const unit = nextLesson
    ? UNITS.find((u) => u.id === nextLesson.unit)
    : undefined;

  // Only suggest problems from lessons the student has actually finished —
  // recommending arrays to someone still on variables is how people give up.
  const ready = problems
    .filter((p) => !solved.has(p.id))
    .map((p) => ({
      p,
      topic: primaryTopic(Array.isArray(p.tags) ? (p.tags as string[]) : []),
    }))
    .filter(({ topic }) => doneLessons.has(topic))
    .sort((a, b) => a.p.xp_reward - b.p.xp_reward)
    .slice(0, 3);

  const doneCount = doneLessons.size;
  const name = profile?.display_name ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">//</span>
          {en ? "TODAY" : "ӨНӨӨДӨР"}
        </div>
        <h1 className="text-3xl font-bold">
          {name
            ? en
              ? `Hello, ${name}`
              : `Сайн уу, ${name}`
            : en
              ? "Hello"
              : "Сайн уу"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {en
            ? "Three things worth doing right now."
            : "Яг одоо хийхэд зохимжтой гурван зүйл."}
        </p>
      </div>

      {/* Keep reading */}
      <Card className="hud-panel">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary"
            style={{ boxShadow: "0 0 22px -8px var(--color-primary)" }}
          >
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-[180px] flex-1">
            <div className="hud-label">
              {en ? "KEEP READING" : "ҮРГЭЛЖЛҮҮЛЭН УНШ"}
            </div>
            {nextLesson ? (
              <>
                <div className="font-semibold">
                  {en ? nextLesson.title_en : nextLesson.title_mn}
                </div>
                <div className="text-xs text-muted-foreground">
                  {unit ? (en ? unit.title_en : unit.title_mn) : ""} ·{" "}
                  {doneCount}/{LESSONS.length} {en ? "done" : "дууссан"}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                {en
                  ? "Every lesson is finished. Well done."
                  : "Бүх хичээл дууслаа. Сайн байна."}
              </div>
            )}
          </div>
          <Link
            href={nextLesson ? `/learn/${nextLesson.slug}` : "/learn"}
            className={cn(buttonVariants(), "font-code")}
          >
            {nextLesson
              ? doneCount === 0
                ? en
                  ? "Start"
                  : "Эхлэх"
                : en
                  ? "Continue"
                  : "Үргэлжлүүлэх"
              : en
                ? "Review"
                : "Дахин үзэх"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      {/* Spaced repetition */}
      <section className="space-y-2">
        <h2 className="hud-label flex items-center gap-2">
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          {en ? "REVIEW" : "ДАВТАЛТ"}
          <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
        </h2>
        <ReviewDrill initialDue={dueCount} en={en} />
      </section>

      {/* Problems they are ready for */}
      <section className="space-y-2">
        <h2 className="hud-label flex items-center gap-2">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          {en ? "SOLVE SOMETHING" : "БОДЛОГО БОД"}
          <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
        </h2>
        {ready.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              {doneCount === 0
                ? en
                  ? "Finish a lesson and problems you can solve will appear here."
                  : "Нэг хичээл дуусгамагц энд бодож чадах бодлогууд гарч ирнэ."
                : en
                  ? "Nothing new for the lessons you have finished — read the next one to unlock more."
                  : "Дууссан хичээлүүдэд шинэ бодлого алга — дараагийн хичээлийг уншвал нэмэгдэнэ."}
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <ul className="divide-y">
              {ready.map(({ p }) => (
                <li key={p.id}>
                  <Link
                    href={`/problems/${p.slug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {en && p.title_en ? p.title_en : p.title_mn}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                      <Trophy className="h-3 w-3" />
                      {p.xp_reward}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
