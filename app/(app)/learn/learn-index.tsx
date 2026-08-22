"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { readDone, pullDone } from "@/lib/lesson-progress";

export interface IndexLesson {
  slug: string;
  unit: number;
  n: number; // 1-based lesson number across the whole course
  title: string;
  goal: string;
}

export interface IndexUnit {
  id: number;
  title: string;
  blurb: string;
}

export function LearnIndex({
  units,
  lessons,
  en,
}: {
  units: IndexUnit[];
  lessons: IndexLesson[];
  en: boolean;
}) {
  // Progress lives in the browser — no account or database needed for this.
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    setDone(readDone());
    // Then reconcile with the server, which also uploads anything this
    // browser recorded before progress was stored centrally.
    void pullDone().then(setDone);
  }, []);

  const completed = lessons.filter((l) => done.has(l.slug)).length;
  const next = lessons.find((l) => !done.has(l.slug)) ?? lessons[0];

  // A character bar rather than a div — the whole design is a terminal, and a
  // rounded gradient pill was the most out-of-place thing on the page.
  const filled = Math.round((completed / lessons.length) * 24);
  const bar = "█".repeat(filled) + "░".repeat(24 - filled);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Where am I */}
      <div className="hud-label mb-3">
        {en ? "// LEARN.PATH" : "// СУРАЛЦАХ ЗАМ"}
      </div>
      <h1 className="text-2xl font-semibold sm:text-3xl">
        {en ? "Learn programming from zero" : "Програмчлалыг тэгээс сурах"}
      </h1>
      <p className="mt-1 max-w-[54ch] text-muted-foreground">
        {en
          ? "One small idea per lesson. Read it, try it, then move on."
          : "Хичээл бүр нэг л ойлголт. Уншаад, туршаад, дараагийнх руу яв."}
      </p>

      {/* How far along am I */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border border-amber-rail px-4 py-3">
        <span className="hud-label">{en ? "PROGRESS" : "ЯВЦ"}</span>
        <span
          aria-hidden
          className="font-code tracking-[-0.05em] text-signal-ok"
        >
          {bar}
        </span>
        <span className="font-code font-semibold tabular-nums text-amber-hot">
          {completed} / {lessons.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {en ? "next — " : "дараагийнх — "}
          {next.title}
        </span>
        <Link
          href={`/learn/${next.slug}`}
          className="ml-auto bg-signal-go px-3 py-0.5 font-code font-semibold text-background transition-opacity hover:opacity-80"
        >
          {completed === 0
            ? en
              ? "START"
              : "ЭХЛЭХ"
            : completed === lessons.length
              ? en
                ? "REVIEW"
                : "ДАХИН ҮЗЭХ"
              : en
                ? "CONTINUE"
                : "ҮРГЭЛЖЛҮҮЛЭХ"}{" "}
          →
        </Link>
      </div>

      {/* Which chapter, then the lessons */}
      {units.map((u) => {
        const items = lessons.filter((l) => l.unit === u.id);
        return (
          <section key={u.id} className="mt-10">
            <p className="hud-label">
              {en ? `UNIT ${u.id}` : `БҮЛЭГ ${u.id}`}
            </p>
            <h2 className="text-lg font-semibold">{u.title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{u.blurb}</p>
            <hr className="mt-3 border-amber-rail" />

            {items.map((l) => {
              const isDone = done.has(l.slug);
              const isNext = l.slug === next.slug && !isDone;
              return (
                <Link
                  key={l.slug}
                  href={`/learn/${l.slug}`}
                  className={cn(
                    "grid grid-cols-[1.75rem_2.25rem_1fr] items-baseline gap-x-3 gap-y-0.5 border-b border-amber-rail/45 py-2.5 pr-2 hover:bg-primary/[0.07]",
                    isNext && "-ml-3 border-l-[3px] border-l-signal-go bg-signal-go/10 pl-3",
                  )}
                >
                  {/* Shape first, colour second: simulated for deuteranopia the
                      done green and the go cyan are the same tone. */}
                  <span
                    aria-hidden
                    className={cn(
                      "font-code",
                      isDone
                        ? "text-signal-ok"
                        : isNext
                          ? "text-signal-go"
                          : "text-amber-dim",
                    )}
                  >
                    {isDone ? "✓" : isNext ? "▸" : "□"}
                  </span>
                  <span className="text-right font-code tabular-nums text-amber-dim">
                    {String(l.n).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-semibold leading-snug",
                      isDone
                        ? "font-normal text-muted-foreground"
                        : isNext
                          ? "text-amber-hot"
                          : "text-primary",
                    )}
                  >
                    {l.title}
                  </span>
                  {/* The goal gets its own line and wraps — never truncated. */}
                  <span className="col-start-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                    {l.goal}
                  </span>
                </Link>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
