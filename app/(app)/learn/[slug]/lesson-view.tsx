"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readDone, setDone } from "@/lib/lesson-progress";

export interface LessonViewData {
  slug: string;
  n: number;
  total: number;
  title: string;
  goal: string;
  intro: string;
  code: string;
  output: string;
  lines: { code: string; note: string }[];
  terms: { term: string; def: string }[];
  mistakes: { wrong: string; fix: string; why: string }[];
  quiz: {
    question: string;
    choices: string[];
    answer: number;
    explain: string;
  } | null;
  challenge: string | null;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export function LessonView({ lesson, en }: { lesson: LessonViewData; en: boolean }) {
  const [done, setDoneState] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    setDoneState(readDone().has(lesson.slug));
    setPicked(null);
  }, [lesson.slug]);

  const toggleDone = () => {
    const next = !done;
    setDone(lesson.slug, next);
    setDoneState(next);
  };

  const idePath = `/ide?code=${encodeURIComponent(lesson.code)}`;

  return (
    <article className="mx-auto max-w-3xl space-y-5 pb-4">
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
          {done && (
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
            <span className="hud-label mr-1">{en ? "GOAL" : "ЗОРИЛГО"}</span>
            {lesson.goal}
          </span>
        </p>
      </div>

      {/* Explanation */}
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {lesson.intro}
      </p>

      {/* Code + output */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-primary/15">
          <div className="flex items-center gap-1.5 border-b border-primary/15 bg-black/25 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-neon-pink/70" />
            <span className="h-2 w-2 rounded-full bg-neon-amber/70" />
            <span className="h-2 w-2 rounded-full bg-neon-lime/70" />
            <span className="ml-1 font-code text-[10px] tracking-widest text-muted-foreground">
              main.cpp
            </span>
          </div>
          <pre className="overflow-x-auto whitespace-pre bg-[oklch(0.16_0.02_264)] p-3 font-mono text-xs leading-relaxed text-primary">
            {lesson.code}
          </pre>
        </div>
        <div className="overflow-hidden rounded-lg border border-neon-lime/25">
          <div className="border-b border-neon-lime/20 bg-neon-lime/[0.08] px-3 py-1.5 font-code text-[10px] tracking-widest text-neon-lime">
            {en ? "> what you see" : "> гарах хариу"}
          </div>
          <pre className="whitespace-pre-wrap bg-[oklch(0.16_0.02_264)] p-3 font-mono text-xs leading-relaxed text-neon-lime">
            {lesson.output}
          </pre>
        </div>
      </div>

      <Link href={idePath} className={cn(buttonVariants(), "font-code")}>
        <Play className="mr-1.5 h-4 w-4" />
        {en ? "Try this code" : "Энэ кодыг турших"}
      </Link>

      {/* Line by line */}
      <section className="space-y-2">
        <h2 className="hud-label flex items-center gap-2">
          <span className="text-primary">//</span>
          {en ? "LINE BY LINE" : "МӨР ТУС БҮР"}
          <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
        </h2>
        <div className="space-y-2">
          {lesson.lines.map((l, i) => (
            <Card key={i}>
              <CardContent className="space-y-1.5 p-3">
                <code className="block overflow-x-auto whitespace-pre rounded bg-[oklch(0.16_0.02_264)] px-2 py-1 font-mono text-xs text-primary">
                  {l.code}
                </code>
                <p className="text-sm text-muted-foreground">{l.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Key words */}
      {lesson.terms.length > 0 && (
        <section className="space-y-2">
          <h2 className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            {en ? "KEY WORDS" : "ШИНЭ ҮГ"}
            <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
          </h2>
          <Card>
            <CardContent className="divide-y divide-primary/10 p-0">
              {lesson.terms.map((t) => (
                <div key={t.term} className="flex gap-3 p-3">
                  <code className="shrink-0 font-mono text-xs font-bold text-primary">
                    {t.term}
                  </code>
                  <p className="text-sm text-muted-foreground">{t.def}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Common mistakes */}
      {lesson.mistakes.length > 0 && (
        <section className="space-y-2">
          <h2 className="hud-label flex items-center gap-2">
            <span className="text-neon-amber">//</span>
            {en ? "COMMON MISTAKES" : "ТҮГЭЭМЭЛ АЛДАА"}
            <span className="h-px flex-1 bg-gradient-to-r from-neon-amber/25 to-transparent" />
          </h2>
          {lesson.mistakes.map((m, i) => (
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
                  {m.why}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Self check */}
      {lesson.quiz && (
        <section className="space-y-2">
          <h2 className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            {en ? "QUICK CHECK" : "ӨӨРИЙГӨӨ ШАЛГА"}
            <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
          </h2>
          <Card className="hud-panel">
            <CardContent className="space-y-2 p-4">
              <p className="flex items-start gap-2 font-medium">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {lesson.quiz.question}
              </p>
              <div className="space-y-1.5">
                {lesson.quiz.choices.map((c, i) => {
                  const chosen = picked === i;
                  const correct = i === lesson.quiz!.answer;
                  const show = picked !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => setPicked(i)}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        !show && "hover:bg-muted",
                        show && correct && "border-neon-lime/50 bg-neon-lime/10 text-neon-lime",
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
                  {picked === lesson.quiz.answer
                    ? en
                      ? "Correct! "
                      : "Зөв! "
                    : en
                      ? "Not quite. "
                      : "Болоогүй байна. "}
                  {lesson.quiz.explain}
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Challenge */}
      {lesson.challenge && (
        <Card className="border-neon-lime/30 bg-neon-lime/[0.05]">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <Lightbulb className="h-4 w-4 shrink-0 text-neon-lime" />
            <p className="min-w-[180px] flex-1 text-sm">
              <span className="hud-label mr-1">
                {en ? "NOW YOU TRY" : "ОДОО ЧИ ХИЙ"}
              </span>
              {lesson.challenge}
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
      )}

      {/* Footer: mark done + prev/next */}
      <div className="space-y-3 border-t border-primary/15 pt-4">
        <Button
          onClick={toggleDone}
          variant={done ? "outline" : "default"}
          className="w-full font-code sm:w-auto"
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          {done
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
              href="/problems"
              className={cn(buttonVariants({ size: "sm" }), "flex-1 font-code")}
            >
              {en ? "Solve problems" : "Бодлого бодох"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
