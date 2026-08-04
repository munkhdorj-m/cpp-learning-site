import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { LESSONS, UNITS, findLesson, lessonIndex } from "@/lib/lessons";
import type { Section } from "@/lib/lessons";
import type {
  ViewBlock,
  ViewSection,
} from "@/components/learn/lesson-blocks";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { LessonView } from "./lesson-view";

/** Pick one language out of a section's bilingual content. */
function localize(sections: Section[] | undefined, en: boolean): ViewSection[] {
  return (sections ?? []).map((s) => ({
    id: s.id,
    title: en ? s.title_en : s.title_mn,
    cppOnly: s.cppOnly,
    blocks: s.blocks.map((b): ViewBlock => {
      switch (b.kind) {
        case "text":
          return { kind: "text", text: en ? b.en : b.mn };
        case "code":
          return {
            kind: "code",
            cpp: b.cpp,
            py: b.py,
            output: b.output,
            caption: en ? b.caption_en : b.caption_mn,
          };
        case "list":
          return {
            kind: "list",
            items: en ? b.en : b.mn,
            ordered: b.ordered,
          };
        case "note":
          return { kind: "note", tone: b.tone, text: en ? b.en : b.mn };
        case "table":
          return {
            kind: "table",
            head: en ? b.head_en : b.head_mn,
            rows: b.rows,
          };
      }
    }),
  }));
}

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

  const unit = UNITS.find((u) => u.id === lesson.unit);

  return (
    <LessonView
      en={en}
      lessons={LESSONS.map((l) => ({
        slug: l.slug,
        title: en ? l.title_en : l.title_mn,
        unit: l.unit,
      }))}
      lesson={{
        slug: lesson.slug,
        n: i + 1,
        total: LESSONS.length,
        unitTitle: unit ? (en ? unit.title_en : unit.title_mn) : "",
        sections: localize(lesson.sections, en),
        title: en ? lesson.title_en : lesson.title_mn,
        goal: en ? lesson.goal_en : lesson.goal_mn,
        intro: en ? lesson.intro_en : lesson.intro_mn,
        code: lesson.code,
        output: lesson.output,
        lines: lesson.lines.map((l) => ({
          code: l.code,
          note: en ? l.note_en : l.note_mn,
        })),
        // Same lesson written in Python, when we have it.
        python: lesson.python
          ? {
              code: lesson.python.code,
              output: lesson.python.output,
              lines: lesson.python.lines.map((l) => ({
                code: l.code,
                note: en ? l.note_en : l.note_mn,
              })),
              mistakes: (lesson.python.mistakes ?? []).map((m) => ({
                wrong: m.wrong,
                fix: m.fix,
                why: en ? m.why_en : m.why_mn,
              })),
              terms: (lesson.python.terms ?? []).map((t) => ({
                term: t.term,
                def: en ? t.def_en : t.def_mn,
              })),
              quiz: lesson.python.quiz
                ? {
                    question: en
                      ? lesson.python.quiz.question_en
                      : lesson.python.quiz.question_mn,
                    choices: lesson.python.quiz.choices,
                    answer: lesson.python.quiz.answer,
                    explain: en
                      ? lesson.python.quiz.explain_en
                      : lesson.python.quiz.explain_mn,
                  }
                : null,
            }
          : null,
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
