import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { LESSONS, findLesson, lessonIndex } from "@/lib/lessons";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { LessonView } from "./lesson-view";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = findLesson(slug);
  return { title: lesson ? lesson.title_en : "Learn" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = findLesson(slug);
  if (!lesson) notFound();

  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const en = locale === "en";

  const i = lessonIndex(slug);
  const prev = i > 0 ? LESSONS[i - 1] : null;
  const next = i < LESSONS.length - 1 ? LESSONS[i + 1] : null;

  return (
    <LessonView
      en={en}
      lesson={{
        slug: lesson.slug,
        n: i + 1,
        total: LESSONS.length,
        title: en ? lesson.title_en : lesson.title_mn,
        goal: en ? lesson.goal_en : lesson.goal_mn,
        intro: en ? lesson.intro_en : lesson.intro_mn,
        code: lesson.code,
        output: lesson.output,
        lines: lesson.lines.map((l) => ({
          code: l.code,
          note: en ? l.note_en : l.note_mn,
        })),
        terms: (lesson.terms ?? []).map((t) => ({
          term: t.term,
          def: en ? t.def_en : t.def_mn,
        })),
        mistakes: (lesson.mistakes ?? []).map((m) => ({
          wrong: m.wrong,
          fix: m.fix,
          why: en ? m.why_en : m.why_mn,
        })),
        quiz: lesson.quiz
          ? {
              question: en ? lesson.quiz.question_en : lesson.quiz.question_mn,
              choices: lesson.quiz.choices,
              answer: lesson.quiz.answer,
              explain: en ? lesson.quiz.explain_en : lesson.quiz.explain_mn,
            }
          : null,
        challenge: en
          ? (lesson.challenge_en ?? null)
          : (lesson.challenge_mn ?? null),
        prev: prev
          ? { slug: prev.slug, title: en ? prev.title_en : prev.title_mn }
          : null,
        next: next
          ? { slug: next.slug, title: en ? next.title_en : next.title_mn }
          : null,
      }}
    />
  );
}
