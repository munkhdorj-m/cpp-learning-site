"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

import type { Deck } from "@/lib/lesson-slides";
import { SlideScene, tallestScene } from "./slide-scene";

const STEP_MS = 2600;

/**
 * A lesson diagram walked through one step at a time.
 *
 * Students who stall on recursion or on binary search are almost never stuck
 * on the syntax — they cannot picture the state changing. A still picture
 * shows one moment; this shows the moments in order, which is the part that
 * was missing.
 *
 * Everything is on the page at once: stepping is state, not a fetch, so it
 * works on the school connection and the whole deck is in the printed page
 * for a student reading offline.
 */
export function SlideDeck({ deck, en }: { deck: Deck; en: boolean }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const last = deck.slides.length - 1;
  const atEnd = i >= last;

  // One height for the whole deck — see tallestScene.
  const height = useMemo(
    () => tallestScene(deck.slides.map((s) => s.scene), en),
    [deck, en],
  );

  const go = useCallback(
    (next: number) => {
      setI(Math.max(0, Math.min(last, next)));
    },
    [last],
  );

  // Advance while playing, and stop of its own accord at the last slide
  // rather than looping — a diagram that never settles is hard to read.
  useEffect(() => {
    if (!playing) return;
    if (atEnd) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setI((v) => v + 1), STEP_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [playing, i, atEnd]);

  const slide = deck.slides[i];
  if (!slide) return null;

  const title = en ? slide.title_en : slide.title_mn;
  const deckTitle = en ? deck.title_en : deck.title_mn;

  return (
    <figure
      className="overflow-hidden rounded-xl border border-primary/20 bg-card"
      // Arrow keys step through it once the student has clicked or tabbed in.
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setPlaying(false);
          go(i - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setPlaying(false);
          go(i + 1);
        }
      }}
      aria-roledescription={en ? "step-by-step diagram" : "алхам алхмаар тайлбар"}
      aria-label={deckTitle}
    >
      <div className="flex items-start gap-3 border-b border-primary/15 px-4 py-2.5">
        <span
          className="font-display text-[11px] leading-none text-primary tabular-nums"
          aria-hidden
        >
          {String(i + 1).padStart(2, "0")}
        </span>
        <span className="h-6 w-px shrink-0 bg-primary/25" aria-hidden />
        <p className="text-[15px] leading-snug text-foreground" aria-live="polite">
          {title}
        </p>
      </div>

      <div className="px-3 py-4">
        <SlideScene scene={slide.scene} en={en} height={height} />
      </div>

      <figcaption className="flex items-center gap-1 border-t border-primary/15 bg-black/20 px-2 py-1.5">
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            go(i - 1);
          }}
          disabled={i === 0}
          aria-label={en ? "Previous step" : "Өмнөх алхам"}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (atEnd && !playing) {
              setI(0);
              setPlaying(true);
            } else {
              setPlaying((v) => !v);
            }
          }}
          aria-label={
            playing
              ? en
                ? "Pause"
                : "Түр зогсоох"
              : atEnd
                ? en
                  ? "Play again"
                  : "Дахин үзэх"
                : en
                  ? "Play"
                  : "Тоглуулах"
          }
          className="inline-flex h-7 w-7 items-center justify-center rounded text-primary transition-colors hover:bg-primary/10"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : atEnd ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            go(i + 1);
          }}
          disabled={atEnd}
          aria-label={en ? "Next step" : "Дараагийн алхам"}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots double as a jump target — on a long deck a student wants to
            go back to step 2 without pressing ‹ six times. */}
        <div className="mx-1 flex flex-1 flex-wrap items-center gap-1">
          {deck.slides.map((s, n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setPlaying(false);
                setI(n);
              }}
              aria-label={`${en ? "Step" : "Алхам"} ${n + 1}`}
              aria-current={n === i}
              className={
                n === i
                  ? "h-1.5 w-4 rounded-full bg-primary transition-all"
                  : "h-1.5 w-1.5 rounded-full bg-primary/30 transition-all hover:bg-primary/60"
              }
            />
          ))}
        </div>

        <span className="px-1.5 font-code text-[11px] tabular-nums text-muted-foreground">
          {i + 1} / {deck.slides.length}
        </span>
      </figcaption>
    </figure>
  );
}
