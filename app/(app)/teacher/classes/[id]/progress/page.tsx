import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ArrowLeft, BookOpen, GraduationCap, AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { query } from "@/lib/mysql/pool";
import { LESSONS } from "@/lib/lessons";
import { TOPICS } from "@/lib/cambridge";
import { resolveItem } from "@/lib/progress/items";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";
export const metadata = { title: "Class progress" };

interface Student {
  id: string;
  username: string;
  display_name: string;
}

export default async function ClassProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The layout calls this too, but a layout's redirect does not stop
  // this page rendering: React renders them together, and whatever the
  // page produced is flushed into the redirect response for anyone who
  // reads the body instead of following the Location header.
  await requireTeacher();

  const { id } = await params;
  const localeRaw = await getLocale();
  const en = (isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE) === "en";

  const cls = (
    await query<{ name: string; grade: number }>(
      "SELECT name, grade FROM classes WHERE id = ?",
      [id],
    )
  )[0];
  if (!cls) notFound();

  const students = await query<Student>(
    `SELECT id, username, display_name FROM profiles
      WHERE class_id = ? AND role = 'student'
      ORDER BY display_name`,
    [id],
  );
  const ids = students.map((s) => s.id);

  // Everything below needs at least one student to ask about.
  const progress = ids.length
    ? await query<{ user_id: string; kind: string; n: number }>(
        `SELECT user_id, kind, COUNT(*) AS n FROM content_progress
          WHERE user_id IN (?) GROUP BY user_id, kind`,
        [ids],
      )
    : [];

  const quizPerStudent = ids.length
    ? await query<{
        user_id: string;
        attempts: number;
        right_count: number;
        last_at: string | null;
      }>(
        `SELECT user_id,
                COUNT(*) AS attempts,
                CAST(SUM(correct) AS SIGNED) AS right_count,
                MAX(created_at) AS last_at
           FROM quiz_answers WHERE user_id IN (?) GROUP BY user_id`,
        [ids],
      )
    : [];

  // Only each student's FIRST attempt at a question counts here. Later answers
  // come from the review queue, where they have already been told the answer —
  // including those would make every question look easy.
  const hardest = ids.length
    ? await query<{ item_key: string; attempts: number; right_count: number }>(
        `SELECT item_key,
                COUNT(*) AS attempts,
                CAST(SUM(correct) AS SIGNED) AS right_count
           FROM (
             SELECT user_id, item_key, correct,
                    ROW_NUMBER() OVER (
                      PARTITION BY user_id, item_key ORDER BY created_at
                    ) AS rn
               FROM quiz_answers
              WHERE user_id IN (?)
           ) first_tries
          WHERE rn = 1
          GROUP BY item_key
         HAVING attempts >= 3
          ORDER BY (right_count / attempts) ASC, attempts DESC
          LIMIT 12`,
        [ids],
      )
    : [];

  const lessonsDone = new Map<string, number>();
  const topicsDone = new Map<string, number>();
  for (const p of progress) {
    (p.kind === "lesson" ? lessonsDone : topicsDone).set(p.user_id, Number(p.n));
  }
  const quiz = new Map(quizPerStudent.map((q) => [q.user_id, q]));

  const fmt = (d: string | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : en ? "never" : "хэзээ ч үгүй";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <Link
          href={`/teacher/classes/${id}`}
          className="inline-flex items-center gap-1.5 font-code text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {cls.name}
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {en ? "Course progress" : "Хичээлийн явц"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {en
            ? "What this class has read, and which questions they are getting wrong."
            : "Энэ анги юу уншсан, ямар асуултад буруу хариулж байгаа."}
        </p>
      </div>

      {/* What each student has covered */}
      <section className="space-y-2">
        <h2 className="hud-label flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          {en ? "WHO IS WHERE" : "ХЭН ХААНА ЯВЖ БАЙНА"}
          <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
        </h2>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/15 bg-primary/[0.06]">
                  <th className="hud-label px-3 py-2 text-[10px]">
                    {en ? "STUDENT" : "СУРАГЧ"}
                  </th>
                  <th className="hud-label px-3 py-2 text-[10px]">
                    {en ? "LESSONS" : "ХИЧЭЭЛ"}
                  </th>
                  <th className="hud-label px-3 py-2 text-[10px]">CAMBRIDGE</th>
                  <th className="hud-label px-3 py-2 text-[10px]">
                    {en ? "QUIZ" : "АСУУЛТ"}
                  </th>
                  <th className="hud-label px-3 py-2 text-[10px]">
                    {en ? "LAST SEEN" : "СҮҮЛД"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {students.map((s) => {
                  const l = lessonsDone.get(s.id) ?? 0;
                  const c = topicsDone.get(s.id) ?? 0;
                  const q = quiz.get(s.id);
                  const pct = q?.attempts
                    ? Math.round((Number(q.right_count) / Number(q.attempts)) * 100)
                    : null;
                  return (
                    <tr key={s.id}>
                      <td className="px-3 py-2">
                        <div className="font-medium">{s.display_name}</div>
                        <div className="font-code text-xs text-muted-foreground">
                          {s.username}
                        </div>
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        <span className={cn(l === 0 && "text-muted-foreground")}>
                          {l}
                        </span>
                        <span className="text-muted-foreground">
                          /{LESSONS.length}
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        <span className={cn(c === 0 && "text-muted-foreground")}>
                          {c}
                        </span>
                        <span className="text-muted-foreground">
                          /{TOPICS.length}
                        </span>
                      </td>
                      <td className="px-3 py-2 tabular-nums">
                        {pct === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={cn(
                              pct >= 70
                                ? "text-neon-lime"
                                : pct >= 50
                                  ? "text-neon-amber"
                                  : "text-destructive",
                            )}
                          >
                            {pct}%
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-code text-xs text-muted-foreground">
                        {fmt(q?.last_at ?? null)}
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                      {en ? "No students in this class yet." : "Энэ ангид сурагч алга."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* The questions this class gets wrong */}
      <section className="space-y-2">
        <h2 className="hud-label flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-neon-amber" />
          {en ? "WHAT TO RETEACH" : "ДАХИН ЗААХ ЗҮЙЛ"}
          <span className="h-px flex-1 bg-gradient-to-r from-neon-amber/25 to-transparent" />
        </h2>
        <p className="text-sm text-muted-foreground">
          {en
            ? "Ranked by how many got it wrong on their first attempt. Only questions at least three students have tried."
            : "Анх удаагийн оролдлогод хэдэн хүүхэд буруу хариулснаар эрэмбэлэв. Ядаж гурван сурагч оролдсон асуултууд."}
        </p>

        {hardest.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              {en
                ? "Not enough answers yet. This fills in once the class has worked through some quizzes."
                : "Хангалттай хариулт алга. Анги асуултууд дээр ажиллаж эхлэхэд энэ бөглөгдөнө."}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {hardest.map((h) => {
              const card = resolveItem(h.item_key, en);
              if (!card) return null;
              const attempts = Number(h.attempts);
              const right = Number(h.right_count);
              const pct = Math.round((right / attempts) * 100);
              return (
                <Card key={h.item_key} className="border-neon-amber/25">
                  <CardContent className="space-y-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "font-code text-sm font-bold tabular-nums",
                          pct < 40 ? "text-destructive" : "text-neon-amber",
                        )}
                      >
                        {pct}%
                      </span>
                      <span className="font-code text-xs text-muted-foreground">
                        {right}/{attempts} {en ? "right" : "зөв"}
                      </span>
                      <Link
                        href={card.href}
                        className="ml-auto inline-flex items-center gap-1 font-code text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        {card.label}
                      </Link>
                    </div>
                    <p className="text-sm font-medium">{card.question}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-neon-lime">
                        {card.choices[card.answer]}
                      </span>
                      {" — "}
                      {card.why}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
