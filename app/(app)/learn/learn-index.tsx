"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Circle, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readDone } from "@/lib/lesson-progress";

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
  }, []);

  const completed = lessons.filter((l) => done.has(l.slug)).length;
  const next = lessons.find((l) => !done.has(l.slug)) ?? lessons[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">//</span>
          {en ? "LEARN.PATH" : "СУРАЛЦАХ ЗАМ"}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/35 bg-primary/10 text-primary"
            style={{ boxShadow: "0 0 22px -8px var(--color-primary)" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {en ? "Learn C++ from zero" : "C++ тэгээс сурах"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {en
                ? "One small idea per lesson. Read it, try it, then move on."
                : "Хичээл бүр нэг л ойлголт. Уншаад, туршаад, дараагийнх руу яв."}
            </p>
          </div>
        </div>
      </div>

      {/* Progress + continue */}
      <Card className="hud-panel">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="min-w-[140px] flex-1">
            <div className="hud-label mb-1">
              {en ? "YOUR PROGRESS" : "ТАНЫ ЯВЦ"}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted ring-1 ring-primary/15">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(completed / lessons.length) * 100}%`,
                    background: "var(--gradient-solved)",
                    boxShadow: "0 0 10px -2px var(--neon-lime)",
                  }}
                />
              </div>
              <span className="font-code text-sm font-bold tabular-nums text-neon-lime">
                {completed}
                <span className="text-muted-foreground">/{lessons.length}</span>
              </span>
            </div>
          </div>
          <Link
            href={`/learn/${next.slug}`}
            className={cn(buttonVariants(), "font-code")}
          >
            {completed === 0
              ? en
                ? "Start"
                : "Эхлэх"
              : completed === lessons.length
                ? en
                  ? "Review"
                  : "Дахин үзэх"
                : en
                  ? "Continue"
                  : "Үргэлжлүүлэх"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      {/* Units */}
      {units.map((u) => {
        const items = lessons.filter((l) => l.unit === u.id);
        return (
          <section key={u.id} className="space-y-2">
            <div className="hud-label flex items-center gap-2">
              <span className="text-primary">//</span>
              {en ? `UNIT ${u.id}` : `БҮЛЭГ ${u.id}`}
              <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
            </div>
            <div>
              <h2 className="font-semibold">{u.title}</h2>
              <p className="text-sm text-muted-foreground">{u.blurb}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((l) => {
                const isDone = done.has(l.slug);
                return (
                  <Link key={l.slug} href={`/learn/${l.slug}`} className="group">
                    <Card
                      className={cn(
                        "hud-hover h-full",
                        isDone && "border-neon-lime/35 bg-neon-lime/[0.05]",
                      )}
                    >
                      <CardContent className="flex items-start gap-3 p-4">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-code text-xs font-bold",
                            isDone
                              ? "border-neon-lime/50 bg-neon-lime/15 text-neon-lime"
                              : "border-primary/30 bg-primary/10 text-primary",
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            l.n
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold leading-tight">
                            {l.title}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {l.goal}
                          </div>
                        </div>
                        <Circle className="ml-auto hidden h-0 w-0" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
