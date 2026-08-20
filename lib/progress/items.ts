// Turning a stored item key back into a question.
//
// The review queue stores keys, not question text, so that a reworded question
// improves for everyone rather than leaving stale copies in people's queues.
// The cost is that a key must be resolvable back to real content — that is
// what this file does.
//
//   lesson:variables#0                    a lesson's own quiz
//   lessonpy:variables#0                  the Python version of it
//   cambridge:igcse/number-systems#2      a Cambridge topic quiz

import { LESSONS, findLesson } from "@/lib/lessons";
import { TOPICS, findTopic, quizFor } from "@/lib/cambridge";

export type ItemSource = "lesson" | "lessonpy" | "cambridge";

export interface ItemKey {
  source: ItemSource;
  /** Lesson slug, or "<level>/<topic>" for Cambridge. */
  scope: string;
  index: number;
}

export function itemKey(source: ItemSource, scope: string, index: number): string {
  return `${source}:${scope}#${index}`;
}

export function parseItemKey(key: string): ItemKey | null {
  const m = key.match(/^(lesson|lessonpy|cambridge):(.+)#(\d+)$/);
  if (!m) return null;
  return {
    source: m[1] as ItemSource,
    scope: m[2],
    index: Number(m[3]),
  };
}

export interface ReviewCard {
  key: string;
  question: string;
  choices: string[];
  answer: number;
  why: string;
  /** Where it came from, for the "back to the lesson" link. */
  label: string;
  href: string;
}

/**
 * The question a key refers to, or null if it no longer exists — a quiz may
 * have been shortened or a topic renamed since the row was written.
 */
export function resolveItem(key: string, en: boolean): ReviewCard | null {
  const parsed = parseItemKey(key);
  if (!parsed) return null;
  const { source, scope, index } = parsed;

  if (source === "cambridge") {
    const slash = scope.indexOf("/");
    if (slash < 0) return null;
    const level = scope.slice(0, slash);
    const slug = scope.slice(slash + 1);
    const topic = findTopic(level, slug);
    const quiz = quizFor(level, slug);
    if (!topic || !quiz || !quiz[index]) return null;
    const q = quiz[index];
    return {
      key,
      question: q.q,
      choices: q.choices,
      answer: q.answer,
      why: q.why,
      label: topic.title,
      href: `/cambridge/${level}/${slug}`,
    };
  }

  const lesson = findLesson(scope);
  if (!lesson) return null;
  const quiz = source === "lessonpy" ? lesson.python?.quiz : lesson.quiz;
  // Lesson quizzes hold a single question today, so any index but 0 is stale.
  if (!quiz || index !== 0) return null;

  return {
    key,
    question: en ? quiz.question_en : quiz.question_mn,
    choices: quiz.choices,
    answer: quiz.answer,
    why: en ? quiz.explain_en : quiz.explain_mn,
    label: en ? lesson.title_en : lesson.title_mn,
    href: `/learn/${lesson.slug}`,
  };
}

/** Every question that exists, for the teacher's item analysis. */
export function allItemKeys(): string[] {
  const keys: string[] = [];
  for (const l of LESSONS) {
    if (l.quiz) keys.push(itemKey("lesson", l.slug, 0));
    if (l.python?.quiz) keys.push(itemKey("lessonpy", l.slug, 0));
  }
  for (const t of TOPICS) {
    const quiz = quizFor(t.level, t.slug);
    if (!quiz) continue;
    for (let i = 0; i < quiz.length; i++) {
      keys.push(itemKey("cambridge", `${t.level}/${t.slug}`, i));
    }
  }
  return keys;
}
