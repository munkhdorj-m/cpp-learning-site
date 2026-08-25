"use client";

import { useMemo, useState } from "react";
import { Check, X, RotateCcw, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordQuizAnswer } from "@/lib/progress/client";
import { shuffleQuiz } from "@/lib/quiz-shuffle";

export interface QuizQuestion {
  q: string;
  choices: string[];
  answer: number;
  why: string;
}

/**
 * Short self-marking quiz at the end of a topic. Answers are revealed with an
 * explanation immediately, because the explanation is where the learning is —
 * a score on its own teaches nothing.
 */
export function TopicQuiz({
  questions,
  /** e.g. "cambridge:igcse/number-systems" — omit and nothing is recorded. */
  itemPrefix,
}: {
  questions: QuizQuestion[];
  itemPrefix?: string;
}) {
  const [picked, setPicked] = useState<(number | null)[]>(
    questions.map(() => null),
  );

  // Every question in both Cambridge banks was authored with answer: 0, and
  // this list used to render in source order — so the right button was always
  // the first one. Seeded on the question text, so the arrangement is stable
  // for a student across visits and devices, and a re-render cannot move a
  // button under their finger. `picked` still stores the SOURCE index, which
  // keeps the scoring below and the recorded review data unchanged.
  const orders = useMemo(
    () =>
      questions.map((q) => shuffleQuiz(q.q, q.choices.length, q.answer).order),
    [questions],
  );

  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === questions[i].answer).length;
  const done = answered === questions.length;

  return (
    <section className="space-y-2">
      <h2 className="hud-label flex items-center gap-2">
        <HelpCircle className="h-3.5 w-3.5 text-primary" />
        CHECK YOURSELF
        <span className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
        {answered > 0 && (
          <span className="font-code text-xs text-muted-foreground">
            {right}/{questions.length}
          </span>
        )}
      </h2>

      <div className="space-y-2">
        {questions.map((question, qi) => {
          const chosen = picked[qi];
          const revealed = chosen !== null;
          return (
            <div
              key={question.q}
              className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4"
            >
              <p className="mb-2 text-sm font-medium">
                <span className="mr-1.5 font-code text-primary">{qi + 1}.</span>
                {question.q}
              </p>
              <div className="space-y-1.5">
                {orders[qi].map((ci) => {
                  const c = question.choices[ci];
                  const isAnswer = ci === question.answer;
                  const isChosen = chosen === ci;
                  return (
                    <button
                      key={c}
                      disabled={revealed}
                      onClick={() => {
                        setPicked((prev) =>
                          prev.map((p, i) => (i === qi ? ci : p)),
                        );
                        if (itemPrefix) {
                          recordQuizAnswer(`${itemPrefix}#${qi}`, ci);
                        }
                      }}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        !revealed &&
                          "border-primary/15 hover:border-primary/40 hover:bg-muted",
                        revealed &&
                          isAnswer &&
                          "border-neon-lime/50 bg-neon-lime/10 text-neon-lime",
                        revealed &&
                          isChosen &&
                          !isAnswer &&
                          "border-destructive/50 bg-destructive/10 text-destructive",
                        revealed && !isAnswer && !isChosen && "opacity-50",
                      )}
                    >
                      {revealed && isAnswer && (
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      )}
                      {revealed && isChosen && !isAnswer && (
                        <X className="mt-0.5 h-4 w-4 shrink-0" />
                      )}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <p className="mt-2 rounded-lg bg-muted/50 p-2.5 text-sm text-muted-foreground">
                  {question.why}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.05] p-3">
          <span className="font-code text-sm font-bold text-primary">
            {right} / {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {right === questions.length
              ? "Every one right — you know this topic."
              : "Read back over the ones you missed, then try again."}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto font-code"
            onClick={() => setPicked(questions.map(() => null))}
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}
    </section>
  );
}
