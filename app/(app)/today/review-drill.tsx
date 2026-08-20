"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, RotateCcw, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReviewCardData {
  key: string;
  question: string;
  choices: string[];
  answer: number;
  why: string;
  label: string;
  href: string;
}

/**
 * The review queue: questions the student has met before, resurfaced when the
 * schedule says they are about to be forgotten.
 *
 * Answering here goes through the same endpoint as answering in a lesson, so a
 * review counts towards the schedule exactly like a first attempt does.
 */
export function ReviewDrill({
  initialDue,
  en,
}: {
  initialDue: number;
  en: boolean;
}) {
  const [cards, setCards] = useState<ReviewCardData[] | null>(null);
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/review");
      const data = (await res.json()) as { cards: ReviewCardData[] };
      setCards(data.cards ?? []);
      setAt(0);
      setPicked(null);
      setScore({ right: 0, total: 0 });
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Nothing due means nothing to fetch — the count came with the page.
  useEffect(() => {
    if (initialDue > 0) void start();
  }, [initialDue, start]);

  if (initialDue === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {en
            ? "Nothing to review today. Answer a quiz in a lesson or a Cambridge topic and it will come back here when you are about to forget it."
            : "Өнөөдөр давтах зүйл алга. Хичээл эсвэл Cambridge сэдвийн асуултад хариулбал мартах дөхөх үед нь энд эргэж ирнэ."}
        </CardContent>
      </Card>
    );
  }

  if (loading || cards === null) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {en ? "Loading…" : "Ачааллаж байна…"}
        </CardContent>
      </Card>
    );
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          {en ? "Nothing to review today." : "Өнөөдөр давтах зүйл алга."}
        </CardContent>
      </Card>
    );
  }

  if (at >= cards.length) {
    return (
      <Card className="border-neon-lime/30 bg-neon-lime/[0.05]">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Check className="h-5 w-5 shrink-0 text-neon-lime" />
          <p className="min-w-[180px] flex-1 text-sm">
            {en
              ? `Review finished — ${score.right} of ${score.total} right.`
              : `Давталт дууслаа — ${score.total}-с ${score.right} зөв.`}
          </p>
          <Button size="sm" variant="outline" onClick={start} className="font-code">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {en ? "Again" : "Дахин"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const card = cards[at];
  const revealed = picked !== null;

  const answer = (choice: number) => {
    if (revealed) return;
    setPicked(choice);
    setScore((s) => ({
      right: s.right + (choice === card.answer ? 1 : 0),
      total: s.total + 1,
    }));
    void fetch("/api/progress/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: card.key, choice }),
    }).catch(() => {});
  };

  return (
    <Card className="hud-panel">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={card.href}
            className="font-code text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            {card.label}
          </Link>
          <span className="ml-auto font-code text-xs text-muted-foreground">
            {at + 1} / {cards.length}
          </span>
        </div>

        <p className="font-medium">{card.question}</p>

        <div className="space-y-1.5">
          {card.choices.map((c, i) => {
            const correct = i === card.answer;
            const chosen = picked === i;
            return (
              <button
                key={c}
                onClick={() => answer(i)}
                disabled={revealed}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  !revealed && "hover:bg-muted",
                  revealed &&
                    correct &&
                    "border-neon-lime/50 bg-neon-lime/10 text-neon-lime",
                  revealed &&
                    chosen &&
                    !correct &&
                    "border-destructive/50 bg-destructive/10 text-destructive",
                  revealed && !chosen && !correct && "opacity-60",
                )}
              >
                {c}
              </button>
            );
          })}
        </div>

        {revealed && (
          <>
            <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-2.5 text-sm text-muted-foreground">
              {picked === card.answer ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-neon-lime" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <span>{card.why}</span>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setAt((n) => n + 1);
                  setPicked(null);
                }}
                className="font-code"
              >
                {at + 1 === cards.length
                  ? en
                    ? "Finish"
                    : "Дуусгах"
                  : en
                    ? "Next"
                    : "Дараах"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Link
                href={card.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "font-code",
                )}
              >
                {en ? "Reread it" : "Дахин унших"}
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
