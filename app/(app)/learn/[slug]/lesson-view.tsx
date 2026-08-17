"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Play,
  BookMarked,
  HelpCircle,
  List,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readDone, setDone } from "@/lib/lesson-progress";
import { LanguagePicker } from "@/components/language-picker";
import { PractiseLink } from "@/components/learn/practise-link";
import { Prose, plainText } from "@/components/learn/prose";
import { Figure } from "@/components/learn/figure";
import {
  LessonBlocks,
  type ViewSection,
} from "@/components/learn/lesson-blocks";
import { OnThisPage, type PageAnchor } from "@/components/learn/on-this-page";
import { CourseRail, type RailLesson } from "@/components/learn/course-rail";
import { LANGUAGES, toLanguage, type LanguageId } from "@/lib/languages";

export interface LessonViewData {
  slug: string;
  n: number;
  total: number;
  unitTitle: string;
  title: string;
  goal: string;
  intro: string;
  code: string;
  output: string;
  lines: { code: string; note: string }[];
  sections: ViewSection[];
  terms: { term: string; def: string }[];
  mistakes: { wrong: string; fix: string; why: string }[];
  quiz: {
    question: string;
    choices: string[];
    answer: number;
    explain: string;
  } | null;
  challenge: string | null;
  /** The same lesson in Python, when available. */
  python: {
    code: string;
    output: string;
    lines: { code: string; note: string }[];
    mistakes: { wrong: string; fix: string; why: string }[];
    terms: { term: string; def: string }[];
    quiz: {
      question: string;
      choices: string[];
      answer: number;
      explain: string;
    } | null;
  } | null;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

/** Section heading that doubles as a scroll-spy target and a link anchor. */
function Heading({
  id,
  children,
  tone = "primary",
}: {
  id: string;
  children: React.ReactNode;
  tone?: "primary" | "amber";
}) {
  return (
    <h2
      id={id}
      className="hud-label flex scroll-mt-24 items-center gap-2 pt-1"
    >
      <span className={tone === "amber" ? "text-neon-amber" : "text-primary"}>
        //
      </span>
      {children}
      <span
        className={cn(
          "h-px flex-1 bg-gradient-to-r to-transparent",
          tone === "amber" ? "from-neon-amber/25" : "from-primary/25",
        )}
      />
    </h2>
  );
}

/** A reference section written for this lesson, with a normal heading. */
function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 border-b border-primary/15 pb-1.5 text-xl font-bold"
    >
      <Prose text={title} />
    </h2>
  );
}

export function LessonView({
  lesson,
  lessons,
  en,
}: {
  lesson: LessonViewData;
  lessons: RailLesson[];
  en: boolean;
}) {
  const [done, setDoneState] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<number | null>(null);
  // Shared with the playground and problem pages, so a Python student stays
  // in Python everywhere.
  const [language, setLanguage] = useState<LanguageId>("cpp");

  useEffect(() => {
    setDoneState(readDone());
    setPicked(null);
  }, [lesson.slug]);

  useEffect(() => {
    setLanguage(toLanguage(window.localStorage.getItem("preferred-language")));
  }, []);

  const changeLanguage = (next: LanguageId) => {
    setLanguage(next);
    try {
      window.localStorage.setItem("preferred-language", next);
    } catch {
      // Private mode — the choice just won't be remembered.
    }
  };

  // Fall back to C++ if this lesson has no Python version yet.
  const usePython = language === "python" && !!lesson.python;
  const shown =
    usePython && lesson.python
      ? {
          code: lesson.python.code,
          output: lesson.python.output,
          lines: lesson.python.lines,
          mistakes: lesson.python.mistakes,
          // Where a lesson's terms or quiz are language-specific, the Python
          // variant supplies its own. Where they are about the idea rather
          // than the syntax, fall back to the shared version.
          terms: lesson.python.terms.length
            ? lesson.python.terms
            : lesson.terms,
          quiz: lesson.python.quiz ?? lesson.quiz,
        }
      : {
          code: lesson.code,
          output: lesson.output,
          lines: lesson.lines,
          mistakes: lesson.mistakes,
          terms: lesson.terms,
          quiz: lesson.quiz,
        };

  // Sections about C++-only ideas (pointers, `auto`, casts) are dropped for a
  // student reading in Python rather than shown as if they applied.
  const sections = useMemo(
    () => lesson.sections.filter((s) => !(usePython && s.cppOnly)),
    [lesson.sections, usePython],
  );

  const isDone = done.has(lesson.slug);

  const toggleDone = () => {
    setDoneState(setDone(lesson.slug, !isDone));
  };

  const idePath = `/ide?lang=${usePython ? "python" : "cpp"}&code=${encodeURIComponent(shown.code)}`;

  // The left rail lists exactly what is on the page, in the order it appears.
  const anchors: PageAnchor[] = useMemo(() => {
    const out: PageAnchor[] = [
      { id: "example", title: en ? "The example" : "Жишээ" },
      { id: "line-by-line", title: en ? "Line by line" : "Мөр тус бүр" },
      // The rail is plain text, so any `code` markup in a title is stripped.
      ...sections.map((s) => ({ id: s.id, title: plainText(s.title) })),
    ];
    if (shown.mistakes.length)
      out.push({
        id: "mistakes",
        title: en ? "Common mistakes" : "Түгээмэл алдаа",
      });
    if (shown.terms.length)
      out.push({ id: "key-words", title: en ? "Key words" : "Шинэ үг" });
    if (shown.quiz)
      out.push({ id: "check", title: en ? "Quick check" : "Өөрийгөө шалга" });
    if (lesson.challenge)
      out.push({ id: "practice", title: en ? "Now you try" : "Одоо чи хий" });
    return out;
  }, [sections, shown.mistakes.length, shown.terms.length, shown.quiz, lesson.challenge, en]);

  return (
    <div className="flex w-full gap-6 xl:gap-8">
      {/* Left rail — sections of this page */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-[4.5rem] max-h-[calc(100vh-6rem)] overflow-y-auto pb-6">
          <OnThisPage items={anchors} en={en} />
        </div>
      </aside>

      <article className="min-w-0 flex-1 space-y-5 pb-6 lg:max-w-3xl">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 font-code text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {en ? "All lessons" : "Бүх хичээл"}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hud-chip">
              {en ? "LESSON" : "ХИЧЭЭЛ"} {lesson.n}/{lesson.total}
            </span>
            <span className="font-code text-xs text-muted-foreground">
              {lesson.unitTitle}
            </span>
            {isDone && (
              <span
                className="hud-chip"
                style={{ ["--glow" as string]: "var(--neon-lime)" }}
              >
                <CheckCircle2 className="h-3 w-3" />
                {en ? "Done" : "Дууссан"}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
          <p className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/[0.07] p-3 text-sm">
            <BookMarked className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="hud-label mr-1">
                {en ? "GOAL" : "ЗОРИЛГО"}
              </span>
              {lesson.goal}
            </span>
          </p>
        </div>

        {/* A picture of the idea, before any code. Every lesson has one. */}
        <Figure id={lesson.slug} priority />

        {/* Explanation */}
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          <Prose text={lesson.intro} />
        </p>

        {/* On this page — small screens have no left rail */}
        <details className="rounded-lg border border-primary/20 bg-primary/[0.04] lg:hidden">
          <summary className="hud-label flex cursor-pointer items-center gap-2 p-3">
            <List className="h-3.5 w-3.5 text-primary" />
            {en ? "ON THIS PAGE" : "ЭНЭ ХУУДСАНД"}
          </summary>
          <ul className="space-y-0.5 px-2 pb-2">
            {anchors.map((a) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground"
                >
                  {a.title}
                </a>
              </li>
            ))}
          </ul>
        </details>

        {/* Language switch — the explanation is the same either way, only the
            example changes. */}
        {lesson.python && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="hud-label">
              {en ? "SHOW EXAMPLE IN" : "ЖИШЭЭГ ХАРУУЛАХ"}
            </span>
            <LanguagePicker value={language} onChange={changeLanguage} />
          </div>
        )}

        {/* Code + output */}
        <section className="space-y-3">
          <Heading id="example">{en ? "THE EXAMPLE" : "ЖИШЭЭ"}</Heading>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-primary/15">
              <div className="flex items-center gap-1.5 border-b border-primary/15 bg-black/25 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-neon-pink/70" />
                <span className="h-2 w-2 rounded-full bg-neon-amber/70" />
                <span className="h-2 w-2 rounded-full bg-neon-lime/70" />
                <span className="ml-1 font-code text-[10px] tracking-widest text-muted-foreground">
                  {usePython
                    ? LANGUAGES.python.filename
                    : LANGUAGES.cpp.filename}
                </span>
              </div>
              <pre className="overflow-x-auto whitespace-pre bg-[oklch(0.16_0.02_264)] p-3 font-mono text-xs leading-relaxed text-primary">
                {shown.code}
              </pre>
            </div>
            <div className="overflow-hidden rounded-lg border border-neon-lime/25">
              <div className="border-b border-neon-lime/20 bg-neon-lime/[0.08] px-3 py-1.5 font-code text-[10px] tracking-widest text-neon-lime">
                {en ? "> what you see" : "> гарах хариу"}
              </div>
              <pre className="whitespace-pre-wrap bg-[oklch(0.16_0.02_264)] p-3 font-mono text-xs leading-relaxed text-neon-lime">
                {shown.output}
              </pre>
            </div>
          </div>

          <Link href={idePath} className={cn(buttonVariants(), "font-code")}>
            <Play className="mr-1.5 h-4 w-4" />
            {en ? "Try this code" : "Энэ кодыг турших"}
          </Link>
        </section>

        {/* Line by line */}
        <section className="space-y-2">
          <Heading id="line-by-line">
            {en ? "LINE BY LINE" : "МӨР ТУС БҮР"}
          </Heading>
          <div className="space-y-2">
            {shown.lines.map((l, i) => (
              <Card key={i}>
                <CardContent className="space-y-1.5 p-3">
                  <code className="block overflow-x-auto whitespace-pre rounded bg-[oklch(0.16_0.02_264)] px-2 py-1 font-mono text-xs text-primary">
                    {l.code}
                  </code>
                  <p className="text-sm text-muted-foreground">
                    <Prose text={l.note} />
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Reference sections — the bulk of the page */}
        {sections.map((s) => (
          <section key={s.id} className="space-y-3">
            <SectionHeading id={s.id} title={s.title} />
            <LessonBlocks blocks={s.blocks} python={usePython} en={en} />
          </section>
        ))}

        {/* Common mistakes */}
        {shown.mistakes.length > 0 && (
          <section className="space-y-2">
            <Heading id="mistakes" tone="amber">
              {en ? "COMMON MISTAKES" : "ТҮГЭЭМЭЛ АЛДАА"}
            </Heading>
            {shown.mistakes.map((m, i) => (
              <Card key={i} className="border-neon-amber/25">
                <CardContent className="space-y-2 p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 font-code text-[10px] tracking-widest text-destructive">
                        ✗ {en ? "wrong" : "буруу"}
                      </div>
                      <pre className="overflow-x-auto whitespace-pre rounded bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive">
                        {m.wrong}
                      </pre>
                    </div>
                    <div>
                      <div className="mb-1 font-code text-[10px] tracking-widest text-neon-lime">
                        ✓ {en ? "right" : "зөв"}
                      </div>
                      <pre className="overflow-x-auto whitespace-pre rounded bg-neon-lime/10 px-2 py-1 font-mono text-xs text-neon-lime">
                        {m.fix}
                      </pre>
                    </div>
                  </div>
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-amber" />
                    <span>
                      <Prose text={m.why} />
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Key words */}
        {shown.terms.length > 0 && (
          <section className="space-y-2">
            <Heading id="key-words">{en ? "KEY WORDS" : "ШИНЭ ҮГ"}</Heading>
            <Card>
              <CardContent className="divide-y divide-primary/10 p-0">
                {shown.terms.map((t) => (
                  <div key={t.term} className="flex gap-3 p-3">
                    <code className="shrink-0 font-mono text-xs font-bold text-primary">
                      {t.term}
                    </code>
                    <p className="text-sm text-muted-foreground">
                      <Prose text={t.def} />
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Self check */}
        {shown.quiz && (
          <section className="space-y-2">
            <Heading id="check">
              {en ? "QUICK CHECK" : "ӨӨРИЙГӨӨ ШАЛГА"}
            </Heading>
            <Card className="hud-panel">
              <CardContent className="space-y-2 p-4">
                <p className="flex items-start gap-2 font-medium">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <Prose text={shown.quiz.question} />
                  </span>
                </p>
                <div className="space-y-1.5">
                  {shown.quiz.choices.map((c, i) => {
                    const chosen = picked === i;
                    const correct = i === shown.quiz!.answer;
                    const show = picked !== null;
                    return (
                      <button
                        key={i}
                        onClick={() => setPicked(i)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          !show && "hover:bg-muted",
                          show &&
                            correct &&
                            "border-neon-lime/50 bg-neon-lime/10 text-neon-lime",
                          show &&
                            chosen &&
                            !correct &&
                            "border-destructive/50 bg-destructive/10 text-destructive",
                          show && !chosen && !correct && "opacity-60",
                        )}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <p className="rounded-lg bg-muted/50 p-2.5 text-sm text-muted-foreground">
                    {picked === shown.quiz.answer
                      ? en
                        ? "Correct! "
                        : "Зөв! "
                      : en
                        ? "Not quite. "
                        : "Болоогүй байна. "}
                    <Prose text={shown.quiz.explain} />
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Challenge */}
        {lesson.challenge && (
          <section className="space-y-2">
            <Heading id="practice">
              {en ? "NOW YOU TRY" : "ОДОО ЧИ ХИЙ"}
            </Heading>
            <Card className="border-neon-lime/30 bg-neon-lime/[0.05]">
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <Lightbulb className="h-4 w-4 shrink-0 text-neon-lime" />
                <p className="min-w-[180px] flex-1 text-sm">
                  <Prose text={lesson.challenge} />
                </p>
                <Link
                  href={idePath}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "font-code",
                  )}
                >
                  {en ? "Open editor" : "Засварлагч нээх"}
                </Link>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Problems that practise this lesson, when there are any */}
        <PractiseLink slug={lesson.slug} en={en} />

        {/* Footer: mark done + prev/next */}
        <div className="space-y-3 border-t border-primary/15 pt-4">
          <Button
            onClick={toggleDone}
            variant={isDone ? "outline" : "default"}
            className="w-full font-code sm:w-auto"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {isDone
              ? en
                ? "Mark as not done"
                : "Дуусаагүй болгох"
              : en
                ? "I understand this"
                : "Ойлголоо"}
          </Button>

          <div className="flex flex-wrap gap-2">
            {lesson.prev && (
              <Link
                href={`/learn/${lesson.prev.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "min-w-0 flex-1",
                )}
              >
                <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" />
                <span className="truncate">{lesson.prev.title}</span>
              </Link>
            )}
            {lesson.next && (
              <Link
                href={`/learn/${lesson.next.slug}`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "min-w-0 flex-1 font-code",
                )}
              >
                <span className="truncate">{lesson.next.title}</span>
                <ArrowRight className="ml-1.5 h-4 w-4 shrink-0" />
              </Link>
            )}
            {!lesson.next && (
              <Link
                href="/learn"
                className={cn(buttonVariants({ size: "sm" }), "font-code")}
              >
                {en ? "Back to all lessons" : "Бүх хичээл рүү"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </article>

      {/* Right rail — where this sits in the course */}
      <aside className="hidden w-[19rem] shrink-0 xl:block">
        <div className="sticky top-[4.5rem] pb-6">
          <CourseRail
            lessons={lessons}
            current={lesson.slug}
            unitTitle={lesson.unitTitle}
            done={done}
            prev={lesson.prev}
            next={lesson.next}
            en={en}
          />
        </div>
      </aside>
    </div>
  );
}
