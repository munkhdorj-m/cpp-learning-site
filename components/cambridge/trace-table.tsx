"use client";

import { useCallback, useState } from "react";
import { Check, RefreshCw, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Completing a trace table is the most examined skill in the whole syllabus,
 * and it is impossible to practise from a page of text — you have to fill one
 * in and be told which cell is wrong.
 *
 * Each exercise generates its own starting value and works out the correct
 * table by running the same algorithm the pseudocode describes, so the answer
 * can never drift away from the code on screen, and the numbers are different
 * every time.
 */
export interface TraceExercise {
  id: string;
  title: string;
  code: string[];
  columns: string[];
  /** A fresh starting value, so a student cannot memorise the table. */
  newInput: () => number;
  /** How that value is introduced above the table. */
  describe: (n: number) => string;
  /** The finished table for that starting value. */
  run: (n: number) => string[][];
}

const randInt = (lo: number, hi: number) =>
  lo + Math.floor(Math.random() * (hi - lo + 1));

export const EXERCISES: TraceExercise[] = [
  {
    id: "for-total",
    title: "FOR loop — running total",
    columns: ["Count", "Total", "OUTPUT"],
    code: [
      "Total ← 0",
      "FOR Count ← 1 TO N",
      "    Total ← Total + Count",
      "NEXT Count",
      "OUTPUT Total",
    ],
    newInput: () => randInt(4, 7),
    describe: (n) => `N = ${n}`,
    run: (n) => {
      const rows: string[][] = [];
      let total = 0;
      for (let count = 1; count <= n; count++) {
        total += count;
        rows.push([String(count), String(total), ""]);
      }
      rows.push(["", "", String(total)]);
      return rows;
    },
  },
  {
    id: "while-halve",
    title: "WHILE loop — repeated halving",
    columns: ["Value", "Steps", "OUTPUT"],
    code: [
      "Value ← N",
      "Steps ← 0",
      "WHILE Value > 1",
      "    Value ← Value DIV 2",
      "    Steps ← Steps + 1",
      "ENDWHILE",
      "OUTPUT Steps",
    ],
    newInput: () => randInt(20, 100),
    describe: (n) => `N = ${n}`,
    run: (n) => {
      const rows: string[][] = [];
      let value = n;
      let steps = 0;
      while (value > 1) {
        value = Math.floor(value / 2);
        steps += 1;
        rows.push([String(value), String(steps), ""]);
      }
      rows.push(["", "", String(steps)]);
      return rows;
    },
  },
  {
    id: "repeat-digits",
    title: "REPEAT UNTIL — sum of the digits",
    columns: ["Number", "Digit", "Sum", "OUTPUT"],
    code: [
      "Number ← N",
      "Sum ← 0",
      "REPEAT",
      "    Digit ← Number MOD 10",
      "    Sum ← Sum + Digit",
      "    Number ← Number DIV 10",
      "UNTIL Number = 0",
      "OUTPUT Sum",
    ],
    newInput: () => randInt(100, 999),
    describe: (n) => `N = ${n}`,
    run: (n) => {
      const rows: string[][] = [];
      let num = n;
      let sum = 0;
      do {
        const digit = num % 10;
        sum += digit;
        num = Math.floor(num / 10);
        rows.push([String(num), String(digit), String(sum), ""]);
      } while (num !== 0);
      rows.push(["", "", "", String(sum)]);
      return rows;
    },
  },
  {
    id: "find-largest",
    title: "Finding the largest value in an array",
    columns: ["Index", "A[Index]", "Largest", "OUTPUT"],
    code: [
      "Largest ← A[1]",
      "FOR Index ← 2 TO 6",
      "    IF A[Index] > Largest THEN",
      "        Largest ← A[Index]",
      "    ENDIF",
      "NEXT Index",
      "OUTPUT Largest",
    ],
    // The seed picks the array, so the whole list is regenerated each time.
    newInput: () => randInt(0, 9999),
    describe: (seed) => `A = [${arrayFor(seed).join(", ")}]`,
    run: (seed) => {
      const a = arrayFor(seed);
      const rows: string[][] = [];
      let largest = a[0];
      for (let i = 1; i < a.length; i++) {
        if (a[i] > largest) largest = a[i];
        rows.push([String(i + 1), String(a[i]), String(largest), ""]);
      }
      rows.push(["", "", "", String(largest)]);
      return rows;
    },
  },
];

EXERCISES.push(
  {
    id: "file-average",
    title: "Reading a file to the end",
    columns: ["Mark", "Count", "Total", "OUTPUT"],
    code: [
      "Count ← 0",
      "Total ← 0",
      "OPENFILE Marks.txt FOR READ",
      "WHILE NOT EOF(Marks.txt)",
      "    READFILE Marks.txt, Mark",
      "    Count ← Count + 1",
      "    Total ← Total + Mark",
      "ENDWHILE",
      "CLOSEFILE Marks.txt",
      "OUTPUT Total DIV Count",
    ],
    newInput: () => randInt(0, 9999),
    describe: (seed) =>
      `Marks.txt contains: ${arrayFor(seed).slice(0, 5).join(", ")}`,
    run: (seed) => {
      const marks = arrayFor(seed).slice(0, 5);
      const rows: string[][] = [];
      let count = 0;
      let total = 0;
      for (const mark of marks) {
        count += 1;
        total += mark;
        rows.push([String(mark), String(count), String(total), ""]);
      }
      rows.push(["", "", "", String(Math.floor(total / count))]);
      return rows;
    },
  },
  {
    id: "recursion",
    title: "Recursion — unwinding the calls",
    columns: ["Call", "n", "Returns", "OUTPUT"],
    code: [
      "FUNCTION Factorial(n) RETURNS INTEGER",
      "    IF n <= 1 THEN",
      "        RETURN 1",
      "    ELSE",
      "        RETURN n * Factorial(n - 1)",
      "    ENDIF",
      "ENDFUNCTION",
      "",
      "OUTPUT Factorial(N)",
    ],
    newInput: () => randInt(3, 6),
    describe: (n) => `N = ${n}`,
    run: (n) => {
      const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));
      const rows: string[][] = [];
      // A row per call, deepest last. The Returns column only fills in on the
      // way back up — which is the whole point of the exercise.
      for (let k = n; k >= 1; k--) {
        rows.push([`Factorial(${k})`, String(k), String(fact(k)), ""]);
      }
      rows.push(["", "", "", String(fact(n))]);
      return rows;
    },
  },
);

/** Six values derived from a seed, so `describe` and `run` always agree. */
function arrayFor(seed: number): number[] {
  const out: number[] = [];
  let s = seed || 1;
  for (let i = 0; i < 6; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    out.push((s % 90) + 10);
  }
  return out;
}

export function TraceTable() {
  const [at, setAt] = useState(0);
  const ex = EXERCISES[at];

  const [input, setInput] = useState(() => EXERCISES[0].newInput());
  // Left empty until the student types; the grid's shape always comes from
  // `answer`, so it can never disagree with the starting value on screen.
  const [cells, setCells] = useState<string[][]>([]);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const answer = ex.run(input);

  const reset = useCallback((next: TraceExercise) => {
    setInput(next.newInput());
    setCells([]);
    setChecked(false);
    setRevealed(false);
  }, []);

  const pick = (i: number) => {
    setAt(i);
    reset(EXERCISES[i]);
  };

  const set = (r: number, c: number, v: string) => {
    setCells((prev) => {
      const next = (prev.length ? prev : blank(answer)).map((row) => [...row]);
      next[r][c] = v;
      return next;
    });
    setChecked(false);
  };

  // A cell never filled in counts as blank, which is the right answer for the
  // OUTPUT column on every row except the last.
  const ok = (r: number, c: number) =>
    (cells[r]?.[c] ?? "").trim() === answer[r][c].trim();

  const rightCount = answer.reduce(
    (sum, row, r) => sum + row.filter((_, c) => ok(r, c)).length,
    0,
  );
  const totalCells = answer.reduce((sum, row) => sum + row.length, 0);

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">TRACE TABLE</span>
        {checked && (
          <span className="ml-auto font-code text-xs text-muted-foreground">
            {rightCount}/{totalCells} cells correct
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {EXERCISES.map((e, i) => (
          <button
            key={e.id}
            onClick={() => pick(i)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-left font-code text-xs transition-colors",
              at === i
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {e.title}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <pre className="overflow-x-auto whitespace-pre rounded-lg border border-primary/15 bg-[var(--surface-code)] p-3 font-mono text-xs leading-relaxed text-primary">
          {ex.code.join("\n")}
        </pre>

        <div className="space-y-2">
          <p className="font-code text-sm">
            <span className="hud-label mr-1.5">START</span>
            <span className="text-primary">{ex.describe(input)}</span>
          </p>
          <div className="overflow-x-auto rounded-lg border border-primary/15">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/15 bg-primary/[0.06]">
                  {ex.columns.map((c) => (
                    <th
                      key={c}
                      className="hud-label whitespace-nowrap px-2 py-1.5 text-[10px]"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {answer.map((row, r) => (
                  <tr key={r}>
                    {row.map((_, c) => (
                      <td key={c} className="p-0.5">
                        <input
                          value={revealed ? answer[r][c] : (cells[r]?.[c] ?? "")}
                          onChange={(e) => set(r, c, e.target.value)}
                          disabled={revealed}
                          aria-label={`${ex.columns[c]} row ${r + 1}`}
                          className={cn(
                            "w-full rounded bg-transparent px-1.5 py-1 font-mono text-xs outline-none transition-colors",
                            "focus:bg-primary/10",
                            checked && ok(r, c) && "bg-neon-lime/15 text-neon-lime",
                            checked &&
                              !ok(r, c) &&
                              "bg-destructive/15 text-destructive",
                            revealed && "text-primary",
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            One row per pass through the loop. Leave a cell blank if it does not
            change on that pass.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => setChecked(true)}
          disabled={revealed}
          className="font-code"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Check
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setRevealed(true)}
          disabled={revealed}
          className="font-code"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Show answer
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => reset(ex)}
          className="ml-auto font-code"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          New numbers
        </Button>
      </div>

      {checked && !revealed && rightCount === totalCells && (
        <p className="flex items-center gap-1.5 text-sm text-neon-lime">
          <Check className="h-4 w-4" /> Every cell correct.
        </p>
      )}
    </div>
  );
}

function blank(rows: string[][]): string[][] {
  return rows.map((r) => r.map(() => ""));
}
