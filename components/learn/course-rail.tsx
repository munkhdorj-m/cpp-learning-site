"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  GraduationCap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RailLesson {
  slug: string;
  title: string;
  unit: number;
}

/**
 * The right rail: where this lesson sits in the whole course.
 *
 * Two cards, the way a textbook's inside cover works — how far through you
 * are, then the table of contents with your place marked.
 */
export function CourseRail({
  lessons,
  current,
  unitTitle,
  done,
  prev,
  next,
  en,
  className,
}: {
  lessons: RailLesson[];
  current: string;
  unitTitle: string;
  done: Set<string>;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  en: boolean;
  className?: string;
}) {
  const completed = lessons.filter((l) => done.has(l.slug)).length;
  const at = lessons.findIndex((l) => l.slug === current);
  const pct = lessons.length ? (completed / lessons.length) * 100 : 0;

  return (
    <div className={className}>
      {/* Course card */}
      <Card className="hud-panel">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/35 bg-primary/10 text-primary"
              style={{ boxShadow: "0 0 18px -8px var(--color-primary)" }}
            >
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0">
              <div className="font-semibold leading-tight">
                {en ? "C++ from Zero" : "C++ тэгээс"}
              </div>
              <div className="font-code text-[10px] tracking-widest text-muted-foreground">
                {en ? "BEGINNER COURSE" : "АНХАН ШАТ"}
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {en
              ? "Everything a beginner needs, one idea at a time — from your first program to functions and vectors."
              : "Анхан шатны бүх зүйл, нэг нэгээр нь — эхний програмаас функц, вектор хүртэл."}
          </p>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {en ? "Course progress" : "Курсын явц"}
              </span>
              <span className="font-code font-bold tabular-nums text-neon-lime">
                {completed}
                <span className="text-muted-foreground">
                  /{lessons.length} {en ? "lessons" : "хичээл"}
                </span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted ring-1 ring-primary/15">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: "var(--gradient-solved)",
                  boxShadow: "0 0 10px -2px var(--neon-lime)",
                }}
              />
            </div>
          </div>

          <Link
            href="/learn"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full font-code",
            )}
          >
            <BookOpen className="mr-1.5 h-4 w-4" />
            {en ? "View full course" : "Бүх хичээл харах"}
          </Link>
        </CardContent>
      </Card>

      {/* Chapter navigation */}
      <Card className="mt-3">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <span className="hud-label">
              {en ? "COURSE NAVIGATION" : "ХИЧЭЭЛҮҮД"}
            </span>
            <span className="hud-chip ml-auto shrink-0">
              {at + 1}/{lessons.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{unitTitle}</p>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={prev ? `/learn/${prev.slug}` : "/learn"}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "min-w-0",
                !prev && "pointer-events-none opacity-40",
              )}
            >
              <ArrowLeft className="mr-1 h-4 w-4 shrink-0" />
              <span className="truncate">{en ? "Previous" : "Өмнөх"}</span>
            </Link>
            <Link
              href={next ? `/learn/${next.slug}` : "/learn"}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "min-w-0",
                !next && "pointer-events-none opacity-40",
              )}
            >
              <span className="truncate">{en ? "Next" : "Дараах"}</span>
              <ArrowRight className="ml-1 h-4 w-4 shrink-0" />
            </Link>
          </div>

          <ul className="-mx-1 max-h-[46vh] space-y-0.5 overflow-y-auto">
            {lessons.map((l) => {
              const isDone = done.has(l.slug);
              const isCurrent = l.slug === current;
              return (
                <li key={l.slug}>
                  <Link
                    href={`/learn/${l.slug}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                      isCurrent
                        ? "bg-primary/12 font-medium text-primary ring-1 ring-inset ring-primary/25"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon-lime" />
                    ) : (
                      <Circle
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          isCurrent ? "text-primary" : "text-muted-foreground/40",
                        )}
                      />
                    )}
                    <span className="min-w-0">{l.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
