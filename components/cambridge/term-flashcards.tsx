"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface Term {
  term: string;
  def: string;
}

/**
 * Flashcards built from a topic's key terms — the definitions are already
 * written, so every topic gets revision practice for free. Definitions are
 * hidden first so the student has to recall rather than just re-read.
 */
export function TermFlashcards({ terms }: { terms: Term[] }) {
  const [order, setOrder] = useState(() => terms.map((_, i) => i));
  const [at, setAt] = useState(0);
  const [shown, setShown] = useState(false);

  if (terms.length === 0) return null;

  const card = terms[order[at]];

  const move = (delta: number) => {
    setAt((prev) => (prev + delta + terms.length) % terms.length);
    setShown(false);
  };

  const shuffle = () => {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setAt(0);
    setShown(false);
  };

  return (
    <div className="space-y-2 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex items-center gap-2">
        <span className="hud-label">FLASHCARDS</span>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {at + 1} / {terms.length}
        </span>
      </div>

      <button
        onClick={() => setShown((v) => !v)}
        className="flex min-h-[104px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-primary/20 bg-background/40 p-4 text-center transition-colors hover:border-primary/40"
      >
        <span className="font-code text-base font-bold text-primary">
          {card.term}
        </span>
        {shown ? (
          <span className="text-sm text-muted-foreground">{card.def}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-code text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            tap to reveal
          </span>
        )}
      </button>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => move(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => move(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={shuffle}
          className="ml-auto font-code"
        >
          <Shuffle className="mr-1.5 h-3.5 w-3.5" />
          Shuffle
        </Button>
      </div>
    </div>
  );
}
