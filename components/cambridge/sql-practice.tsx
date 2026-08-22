"use client";

import { useState } from "react";
import { Check, Play, X, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  COLUMNS,
  TABLE,
  runQuery,
  sameResult,
  type Result,
} from "@/lib/cambridge/sql-engine";

/**
 * Write a SELECT and see the rows come back.
 *
 * Marking compares the *result* against the result of a model answer, not the
 * text of the query — there is more than one correct way to write nearly every
 * one of these, and marking on wording would fail students who are right.
 */

interface Task {
  ask: string;
  solution: string;
}

const TASKS: Task[] = [
  {
    ask: "List the Name of every student in Year 9.",
    solution: "SELECT Name FROM Student WHERE Year = 9",
  },
  {
    ask: "List the Name and Mark of every student who scored more than 70, highest mark first.",
    solution: "SELECT Name, Mark FROM Student WHERE Mark > 70 ORDER BY Mark DESC",
  },
  {
    ask: "List all details of the students in Ariun house.",
    solution: "SELECT * FROM Student WHERE House = 'Ariun'",
  },
  {
    ask: "List the Name of every Year 10 student who scored at least 60.",
    solution: "SELECT Name FROM Student WHERE Year = 10 AND Mark >= 60",
  },
  {
    ask: "List the Name and House of every student, in alphabetical order of Name.",
    solution: "SELECT Name, House FROM Student ORDER BY Name",
  },
];

export function SqlPractice() {
  const [at, setAt] = useState(0);
  const task = TASKS[at];

  const [sql, setSql] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<"right" | "wrong" | null>(null);
  const [shown, setShown] = useState(false);

  const pick = (i: number) => {
    setAt(i);
    setSql("");
    setResult(null);
    setError(null);
    setVerdict(null);
    setShown(false);
  };

  const run = () => {
    setShown(false);
    try {
      const got = runQuery(sql);
      const want = runQuery(task.solution);
      setResult(got);
      setError(null);
      setVerdict(
        sameResult(got, want, /ORDER\s+BY/i.test(task.solution)) ? "right" : "wrong",
      );
    } catch (e) {
      setResult(null);
      setVerdict(null);
      setError(e instanceof Error ? e.message : "Could not run that query.");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">WRITE THE QUERY</span>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {at + 1}/{TASKS.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {TASKS.map((_, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className={cn(
              "h-7 w-7 rounded-lg border font-code text-xs transition-colors",
              at === i
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* The table they are querying */}
      <div className="overflow-x-auto rounded-lg border border-primary/15">
        <table className="w-full text-left text-xs">
          <caption className="hud-label px-2 py-1.5 text-left text-[10px]">
            TABLE: Student
          </caption>
          <thead>
            <tr className="border-y border-primary/15 bg-primary/[0.06]">
              {COLUMNS.map((c) => (
                <th key={c} className="whitespace-nowrap px-2 py-1.5 font-code">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {TABLE.map((r) => (
              <tr key={String(r.StudentID)}>
                {COLUMNS.map((c) => (
                  <td key={c} className="px-2 py-1 font-mono text-muted-foreground">
                    {r[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm">
        <span className="hud-label mr-1.5">TASK</span>
        {task.ask}
      </p>

      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        rows={2}
        spellCheck={false}
        placeholder="SELECT … FROM Student WHERE …"
        aria-label="Your SQL query"
        className="w-full rounded-lg border border-primary/20 bg-[oklch(0.16_0.02_264)] p-2.5 font-mono text-xs text-primary outline-none focus:border-primary/40"
      />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={run} disabled={!sql.trim()} className="font-code">
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Run
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShown(true)}
          className="ml-auto font-code"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Show answer
        </Button>
      </div>

      {shown && (
        <pre className="overflow-x-auto rounded-lg border border-primary/20 bg-background/40 p-2.5 font-mono text-xs text-primary">
          {task.solution}
        </pre>
      )}

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-neon-amber/40 bg-neon-amber/[0.08] p-2.5 text-sm text-neon-amber">
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-1.5">
          {verdict === "right" ? (
            <p className="flex items-center gap-1.5 text-sm text-neon-lime">
              <Check className="h-4 w-4" /> That is the right result.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <X className="h-4 w-4" /> The query ran, but these are not the rows
              the task asked for.
            </p>
          )}
          <div className="overflow-x-auto rounded-lg border border-primary/15">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-primary/15 bg-primary/[0.06]">
                  {result.columns.map((c) => (
                    <th key={c} className="whitespace-nowrap px-2 py-1.5 font-code">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {result.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((v, j) => (
                      <td key={j} className="px-2 py-1 font-mono text-muted-foreground">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
                {result.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={result.columns.length}
                      className="px-2 py-2 text-center text-muted-foreground"
                    >
                      no rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
