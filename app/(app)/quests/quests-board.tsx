"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  Eye,
  Code2,
  Bug,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

import { playCorrect, playWrong } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Difficulty, QuestType } from "@/types/database";

interface QuestItem {
  id: string;
  type: QuestType;
  prompt: string;
  code_snippet: string | null;
  choices: string[] | null;
  difficulty: Difficulty;
  xp_reward: number;
  attempt: {
    was_correct: boolean;
    xp_awarded: number;
    user_answer: string | null;
  } | null;
}

interface Labels {
  title: string;
  subtitle: string;
  progress: string;
  earned_today: string;
  show_answer: string;
  submit: string;
  correct: string;
  wrong: string;
  your_answer: string;
  correct_answer: string;
  placeholder_output: string;
  no_quests: string;
  perfect_day: string;
  type_predict_output: string;
  type_bug_hunt: string;
  type_multiple_choice: string;
}

const TYPE_META: Record<
  QuestType,
  { Icon: typeof Code2; color: string; labelKey: keyof Labels }
> = {
  predict_output: {
    Icon: Code2,
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    labelKey: "type_predict_output",
  },
  bug_hunt: {
    Icon: Bug,
    color: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    labelKey: "type_bug_hunt",
  },
  multiple_choice: {
    Icon: ListChecks,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    labelKey: "type_multiple_choice",
  },
};

const DIFF_DOT: Record<Difficulty, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
};

export function QuestsBoard({
  items,
  labels,
}: {
  items: QuestItem[];
  labels: Labels;
}) {
  // local state for which quest is open + each quest's user input + post-submit result
  const [open, setOpen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<
    Record<
      string,
      {
        was_correct: boolean;
        xp_awarded: number;
        correct_answer: string;
        explanation: string | null;
      }
    >
  >({});

  return (
    <div className="grid gap-2">
      {items.map((q, i) => {
        const meta = TYPE_META[q.type];
        const isOpen = open === q.id;
        const done = !!q.attempt;
        const result = results[q.id];
        const finalCorrect = result?.was_correct ?? q.attempt?.was_correct;
        const finalXp = result?.xp_awarded ?? q.attempt?.xp_awarded ?? 0;

        return (
          <Card
            key={q.id}
            className={cn(
              "overflow-hidden p-0 transition-colors",
              done &&
                finalCorrect &&
                "bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-300 dark:border-emerald-800",
              done &&
                !finalCorrect &&
                "bg-rose-50/40 dark:bg-rose-950/15 border-rose-300 dark:border-rose-900",
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : q.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
            >
              <span className="text-xs text-muted-foreground tabular-nums w-6 text-right shrink-0">
                {i + 1}
              </span>
              <span className="shrink-0">
                {done ? (
                  finalCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-500" />
                  )
                ) : (
                  <span className="block h-5 w-5 rounded-full border-2 border-muted-foreground/40" />
                )}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0 ${meta.color}`}
              >
                <meta.Icon className="h-3 w-3" />
                {labels[meta.labelKey]}
              </span>
              <div className="flex-1 min-w-0 text-sm font-medium truncate">
                {q.prompt}
              </div>
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold tabular-nums shrink-0">
                <Sparkles className="h-3 w-3" />
                {done && finalCorrect ? `+${finalXp}` : q.xp_reward}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  DIFF_DOT[q.difficulty],
                )}
              />
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t pt-3 -mt-px">
                {q.code_snippet && (
                  <pre className="font-mono text-xs bg-muted rounded p-3 overflow-x-auto leading-relaxed whitespace-pre">
                    {q.code_snippet}
                  </pre>
                )}

                <AnswerInput
                  questId={q.id}
                  type={q.type}
                  choices={q.choices}
                  value={answers[q.id] ?? q.attempt?.user_answer ?? ""}
                  onChange={(v) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: v }))
                  }
                  disabled={done}
                  placeholder={labels.placeholder_output}
                />

                {!done ? (
                  <SubmitRow
                    questId={q.id}
                    answer={answers[q.id] ?? ""}
                    onResult={(r) => {
                      setResults((prev) => ({ ...prev, [q.id]: r }));
                      // Update underlying done state via the rerender; we leave
                      // the attempt object null but the result overrides.
                      // Mark q.attempt by mutating local view via a refresh-like trick:
                      // simpler — just rely on `results[q.id]` for display.
                      if (r.was_correct) {
                        playCorrect();
                        confetti({
                          particleCount: 30,
                          spread: 50,
                          origin: { y: 0.7 },
                          scalar: 0.8,
                          colors: ["#a78bfa", "#f59e0b", "#10b981"],
                        });
                        toast.success(`${labels.correct} +${r.xp_awarded} XP`);
                      } else {
                        playWrong();
                        toast.error(labels.wrong);
                      }
                    }}
                    submitLabel={labels.submit}
                  />
                ) : (
                  <FeedbackRow
                    correct={!!finalCorrect}
                    xpAwarded={finalXp}
                    correctAnswer={result?.correct_answer ?? null}
                    explanation={result?.explanation ?? null}
                    labels={labels}
                  />
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function AnswerInput({
  questId,
  type,
  choices,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  questId: string;
  type: QuestType;
  choices: string[] | null;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder: string;
}) {
  if (type === "predict_output") {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={2}
        className="font-mono text-sm"
      />
    );
  }
  // bug_hunt or multiple_choice — radio list
  if (!choices || choices.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No choices configured.</p>
    );
  }
  return (
    <div className="space-y-1.5">
      {choices.map((label, idx) => {
        const v = idx.toString();
        const selected = value === v;
        return (
          <label
            key={idx}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors",
              disabled && "cursor-default",
              selected
                ? "border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/30"
                : "hover:bg-muted/50",
            )}
          >
            <input
              type="radio"
              name={`quest-${questId}`}
              value={v}
              checked={selected}
              onChange={() => onChange(v)}
              disabled={disabled}
              className="h-4 w-4"
            />
            <span className="text-sm font-mono">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

function SubmitRow({
  questId,
  answer,
  onResult,
  submitLabel,
}: {
  questId: string;
  answer: string;
  onResult: (r: {
    was_correct: boolean;
    xp_awarded: number;
    correct_answer: string;
    explanation: string | null;
  }) => void;
  submitLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!answer.trim()) {
      toast.error("Хариулт хоосон байж болохгүй");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/quests/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quest_id: questId, user_answer: answer }),
      });
      if (!res.ok) {
        toast.error("Алдаа гарлаа");
        return;
      }
      const data = await res.json();
      onResult({
        was_correct: data.was_correct,
        xp_awarded: data.xp_awarded ?? 0,
        correct_answer: data.correct_answer,
        explanation: data.explanation_mn ?? data.explanation_en ?? null,
      });
      // Refresh server components so the nav XP bar reflects the new value
      if (data.was_correct && (data.xp_awarded ?? 0) > 0) {
        router.refresh();
      }
    });
  };

  return (
    <Button
      onClick={submit}
      disabled={pending || !answer.trim()}
      className="bg-violet-600 text-white hover:bg-violet-700"
      size="sm"
    >
      {pending ? "..." : submitLabel}
    </Button>
  );
}

function FeedbackRow({
  correct,
  xpAwarded,
  correctAnswer,
  explanation,
  labels,
}: {
  correct: boolean;
  xpAwarded: number;
  correctAnswer: string | null;
  explanation: string | null;
  labels: Labels;
}) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        {correct ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {labels.correct}
            </span>
            <span className="text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" />+{xpAwarded} XP
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-rose-500" />
            <span className="text-rose-700 dark:text-rose-400 font-semibold">
              {labels.wrong}
            </span>
          </>
        )}
      </div>
      {correctAnswer && !correct && (
        <div className="text-xs">
          <span className="text-muted-foreground">
            {labels.correct_answer}:{" "}
          </span>
          <code className="px-1.5 py-0.5 rounded bg-muted font-mono">
            {correctAnswer}
          </code>
        </div>
      )}
      {explanation && (
        <div className="flex gap-2 items-start text-xs text-muted-foreground">
          <Eye className="h-3 w-3 mt-0.5 shrink-0" />
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}
