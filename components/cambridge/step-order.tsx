"use client";

import { useCallback, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Put these stages in the right order" — the fetch-execute cycle, how source
 * becomes a running program, what happens to a packet. All of them are lists
 * a student has to know in sequence, and all of them are dead on the page.
 *
 * One widget, driven by whichever sequence the topic needs.
 */
export interface Sequence {
  title: string;
  /** In the correct order. They are shuffled before being shown. */
  steps: string[];
  /** Shown once the order is right. */
  note?: string;
}

export function StepOrder({ sequences }: { sequences: Sequence[] }) {
  const [at, setAt] = useState(0);
  const seq = sequences[at];

  const [pool, setPool] = useState<string[]>(() => shuffle(sequences[0].steps));
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const reset = useCallback((s: Sequence) => {
    setPool(shuffle(s.steps));
    setPicked([]);
    setChecked(false);
  }, []);

  const pick = (i: number) => {
    setAt(i);
    reset(sequences[i]);
  };

  const take = (step: string) => {
    setPool((p) => p.filter((s) => s !== step));
    setPicked((p) => [...p, step]);
    setChecked(false);
  };

  const putBack = (step: string) => {
    if (checked) return;
    setPicked((p) => p.filter((s) => s !== step));
    setPool((p) => [...p, step]);
  };

  const correctAt = (i: number) => picked[i] === seq.steps[i];
  const allRight =
    picked.length === seq.steps.length && seq.steps.every((s, i) => picked[i] === s);

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">PUT IT IN ORDER</span>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {picked.length}/{seq.steps.length}
        </span>
      </div>

      {sequences.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {sequences.map((s, i) => (
            <button
              key={s.title}
              onClick={() => pick(i)}
              className={cn(
                "rounded-lg border px-2.5 py-1 font-code text-xs transition-colors",
                at === i
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Chosen so far */}
      <ol className="space-y-1.5">
        {picked.map((step, i) => (
          <li key={step}>
            <button
              onClick={() => putBack(step)}
              disabled={checked}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                !checked && "border-primary/25 bg-primary/[0.06] hover:border-primary/40",
                checked && correctAt(i) && "border-neon-lime/50 bg-neon-lime/10",
                checked && !correctAt(i) && "border-destructive/50 bg-destructive/10",
              )}
            >
              <span className="font-code text-xs font-bold text-primary tabular-nums">
                {i + 1}.
              </span>
              <span className="min-w-0 flex-1">{step}</span>
              {checked &&
                (correctAt(i) ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-neon-lime" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                ))}
            </button>
          </li>
        ))}
        {picked.length === 0 && (
          <li className="rounded-lg border border-dashed border-primary/20 px-3 py-4 text-center text-xs text-muted-foreground">
            Click the stages below in the order they happen.
          </li>
        )}
      </ol>

      {/* Still to place */}
      {pool.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-primary/15 pt-3">
          {pool.map((step) => (
            <button
              key={step}
              onClick={() => take(step)}
              className="rounded-lg border border-primary/20 bg-background/40 px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {step}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => setChecked(true)}
          disabled={pool.length > 0}
          className="font-code"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Check
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => reset(seq)}
          className="ml-auto font-code"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Start again
        </Button>
      </div>

      {checked && allRight && (
        <p className="flex items-start gap-1.5 text-sm text-neon-lime">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Correct order.{seq.note ? ` ${seq.note}` : ""}</span>
        </p>
      )}
      {checked && !allRight && (
        <p className="text-sm text-muted-foreground">
          The ones in red are in the wrong place. Start again and think about
          what has to have happened before each stage can begin.
        </p>
      )}
    </div>
  );
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  // A shuffle that returns the original order would look broken.
  if (items.length > 1 && out.every((v, i) => v === items[i])) {
    [out[0], out[1]] = [out[1], out[0]];
  }
  return out;
}
