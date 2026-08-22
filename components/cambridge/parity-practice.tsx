"use client";

import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Parity checking, done rather than described.
 *
 * Two exercises: work out a parity bit, and find the single flipped bit in a
 * parity block. The block one is the question students lose marks on, because
 * the method (find the bad row, find the bad column, the error is where they
 * cross) only makes sense once you have actually done it.
 */
type Mode = "bit" | "block";

const flip = (b: number) => (b === 0 ? 1 : 0);
const parityOf = (bits: number[]) => bits.reduce((a, b) => a + b, 0) % 2;

interface BitQuestion {
  bits: number[];
  even: boolean;
  answer: number;
}

function newBitQuestion(): BitQuestion {
  const bits = Array.from({ length: 7 }, () => (Math.random() < 0.5 ? 0 : 1));
  const even = Math.random() < 0.5;
  const ones = parityOf(bits);
  // Even parity wants an even number of 1s in total; odd parity wants an odd.
  return { bits, even, answer: even ? ones : flip(ones) };
}

interface BlockQuestion {
  grid: number[][];
  row: number;
  col: number;
}

/** An 8×8 even-parity block with exactly one bit flipped. */
function newBlockQuestion(): BlockQuestion {
  const g: number[][] = Array.from({ length: 8 }, () => Array(8).fill(0));

  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 7; c++) g[r][c] = Math.random() < 0.5 ? 0 : 1;

  // Parity column, then parity row, so every line has an even number of 1s.
  for (let r = 0; r < 7; r++) g[r][7] = parityOf(g[r].slice(0, 7));
  for (let c = 0; c < 8; c++) g[7][c] = parityOf(g.slice(0, 7).map((row) => row[c]));

  const row = Math.floor(Math.random() * 8);
  const col = Math.floor(Math.random() * 8);
  g[row][col] = flip(g[row][col]);

  return { grid: g, row, col };
}

export function ParityPractice() {
  const [mode, setMode] = useState<Mode>("bit");
  const [bitQ, setBitQ] = useState<BitQuestion>(newBitQuestion);
  const [blockQ, setBlockQ] = useState<BlockQuestion>(newBlockQuestion);
  const [answer, setAnswer] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const next = useCallback((m: Mode) => {
    if (m === "bit") setBitQ(newBitQuestion());
    else setBlockQ(newBlockQuestion());
    setAnswer(null);
    setPicked(null);
  }, []);

  const choose = (m: Mode) => {
    setMode(m);
    next(m);
  };

  const answerBit = (v: number) => {
    if (answer !== null) return;
    const ok = v === bitQ.answer;
    setAnswer(String(v));
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  };

  const answerBlock = (r: number, c: number) => {
    if (picked) return;
    const ok = r === blockQ.row && c === blockQ.col;
    setPicked({ r, c });
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  };

  const bitRight = answer !== null && Number(answer) === bitQ.answer;
  const blockRight =
    picked !== null && picked.r === blockQ.row && picked.c === blockQ.col;

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">PARITY</span>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {score.right}/{score.total} correct
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {(
          [
            { id: "bit" as Mode, label: "Work out the parity bit" },
            { id: "block" as Mode, label: "Find the flipped bit" },
          ]
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => choose(m.id)}
            className={cn(
              "rounded-lg border px-2.5 py-1 font-code text-xs transition-colors",
              mode === m.id
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "bit" ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This byte uses{" "}
            <span className="font-semibold text-foreground">
              {bitQ.even ? "even" : "odd"} parity
            </span>
            . What must the parity bit be?
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {bitQ.bits.map((b, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-background/40 font-mono text-sm text-primary"
              >
                {b}
              </span>
            ))}
            <span className="mx-1 text-muted-foreground">→</span>
            {[0, 1].map((v) => (
              <button
                key={v}
                onClick={() => answerBit(v)}
                disabled={answer !== null}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-sm transition-colors",
                  answer === null &&
                    "border-dashed border-primary/40 text-muted-foreground hover:border-primary hover:text-primary",
                  answer !== null &&
                    v === bitQ.answer &&
                    "border-neon-lime/60 bg-neon-lime/15 text-neon-lime",
                  answer !== null &&
                    v !== bitQ.answer &&
                    Number(answer) === v &&
                    "border-destructive/60 bg-destructive/15 text-destructive",
                  answer !== null && v !== bitQ.answer && Number(answer) !== v && "opacity-40",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          {answer !== null && (
            <p
              className={cn(
                "text-sm",
                bitRight ? "text-neon-lime" : "text-destructive",
              )}
            >
              {bitRight ? "Correct. " : `The parity bit is ${bitQ.answer}. `}
              <span className="text-muted-foreground">
                There are {bitQ.bits.filter((b) => b === 1).length} ones in the
                data, so the byte needs a {bitQ.answer} to make the total number
                of ones {bitQ.even ? "even" : "odd"}.
              </span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Even parity, by row and by column. One bit was flipped in
            transmission — click it.
          </p>
          <div className="overflow-x-auto">
            <div className="inline-grid grid-cols-8 gap-1">
              {blockQ.grid.map((row, r) =>
                row.map((b, c) => {
                  const isError = r === blockQ.row && c === blockQ.col;
                  const isPicked = picked?.r === r && picked?.c === c;
                  const isParity = r === 7 || c === 7;
                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => answerBlock(r, c)}
                      disabled={!!picked}
                      aria-label={`row ${r + 1} column ${c + 1}, value ${b}`}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded border font-mono text-xs transition-colors",
                        isParity
                          ? "border-primary/25 bg-primary/[0.08] text-muted-foreground"
                          : "border-primary/15 bg-background/40 text-primary",
                        !picked && "hover:border-primary hover:bg-primary/20",
                        picked && isError && "border-neon-lime bg-neon-lime/20 text-neon-lime",
                        picked && isPicked && !isError && "border-destructive bg-destructive/20 text-destructive",
                      )}
                    >
                      {b}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
          <p className="font-code text-[10px] tracking-widest text-muted-foreground">
            THE LAST ROW AND LAST COLUMN ARE THE PARITY BITS
          </p>
          {picked && (
            <p
              className={cn(
                "text-sm",
                blockRight ? "text-neon-lime" : "text-destructive",
              )}
            >
              {blockRight ? "Correct. " : "Not that one. "}
              <span className="text-muted-foreground">
                Row {blockQ.row + 1} and column {blockQ.col + 1} both have an odd
                number of ones, so the flipped bit is where they cross.
              </span>
            </p>
          )}
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => next(mode)}
        className="font-code"
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
        Next
      </Button>
    </div>
  );
}
