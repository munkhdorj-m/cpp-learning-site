"use client";

import { useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Gate = "AND" | "OR" | "NAND" | "NOR" | "XOR";

const GATES: Gate[] = ["AND", "OR", "NAND", "NOR", "XOR"];

function apply(gate: Gate, a: number, b: number): number {
  switch (gate) {
    case "AND":
      return a & b;
    case "OR":
      return a | b;
    case "NAND":
      return a & b ? 0 : 1;
    case "NOR":
      return a | b ? 0 : 1;
    case "XOR":
      return a ^ b;
  }
}

const ROWS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

/**
 * Fill in a truth table for a randomly chosen gate, then have it marked.
 * Truth tables are examined every year and are pure practice — exactly the
 * sort of thing that is dull to read about and quick to learn by doing.
 */
export function LogicPractice() {
  const [gate, setGate] = useState<Gate>(
    () => GATES[Math.floor(Math.random() * GATES.length)],
  );
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [checked, setChecked] = useState(false);

  const correct = ROWS.map(([a, b]) => apply(gate, a, b));
  const allRight =
    checked && answers.every((v, i) => v !== null && v === correct[i]);

  const setCell = (i: number, v: number) => {
    if (checked) return;
    setAnswers((prev) => prev.map((old, j) => (j === i ? v : old)));
  };

  const reset = () => {
    setGate(GATES[Math.floor(Math.random() * GATES.length)]);
    setAnswers([null, null, null, null]);
    setChecked(false);
  };

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">PRACTICE</span>
        <span className="text-sm">
          Complete the truth table for{" "}
          <code className="font-mono font-bold text-primary">{gate}</code>
        </span>
      </div>

      <table className="font-mono text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="px-3 py-1 text-left font-normal">A</th>
            <th className="px-3 py-1 text-left font-normal">B</th>
            <th className="px-3 py-1 text-left font-normal">Output</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([a, b], i) => {
            const isRight = checked && answers[i] === correct[i];
            const isWrong = checked && answers[i] !== correct[i];
            return (
              <tr key={i} className="border-t border-primary/10">
                <td className="px-3 py-1.5">{a}</td>
                <td className="px-3 py-1.5">{b}</td>
                <td className="px-3 py-1.5">
                  <div className="flex gap-1">
                    {[0, 1].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCell(i, v)}
                        disabled={checked}
                        className={cn(
                          "h-7 w-7 rounded border font-bold transition-colors",
                          answers[i] === v
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-primary/20 text-muted-foreground hover:bg-muted",
                          isRight && answers[i] === v && "border-neon-lime bg-neon-lime/20 text-neon-lime",
                          isWrong && answers[i] === v && "border-destructive bg-destructive/20 text-destructive",
                        )}
                      >
                        {v}
                      </button>
                    ))}
                    {isWrong && (
                      <span className="ml-2 self-center text-xs text-neon-lime">
                        → {correct[i]}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-2">
        {!checked ? (
          <Button
            size="sm"
            className="font-code"
            disabled={answers.some((v) => v === null)}
            onClick={() => setChecked(true)}
          >
            Check
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="font-code" onClick={reset}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Another gate
          </Button>
        )}
        {checked &&
          (allRight ? (
            <span className="flex items-center gap-1.5 text-sm text-neon-lime">
              <Check className="h-4 w-4" /> All correct.
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <X className="h-4 w-4" /> Check the highlighted rows.
            </span>
          ))}
      </div>
    </div>
  );
}
