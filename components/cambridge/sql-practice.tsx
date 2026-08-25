"use client";

import { useState } from "react";
import { Check, Play, X, Eye, Database, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TABLES,
  runOneQuery,
  sameResult,
  type QueryResult,
} from "@/lib/cambridge/sql-db";
import { SQL_TASKS } from "@/lib/cambridge/sql-tasks";
import { useSqlDatabase } from "@/lib/cambridge/use-sql-db";

/**
 * Write a SELECT and see the rows come back.
 *
 * Marking compares the RESULT against the result of a model answer, not the
 * text of the query — there is more than one correct way to write nearly every
 * one of these, and marking on wording would fail students who are right.
 *
 * Both the student's query and the model answer go through the same SQLite
 * that powers /cambridge/sql, against the same tables. That is deliberate: a
 * query accepted in the playground has to be accepted here too.
 */

/**
 * These tasks all ask for a SELECT, and letting an UPDATE or DELETE through
 * would quietly change the data every later task is marked against.
 */
function isSelect(sql: string) {
  return /^\s*select\b/i.test(sql);
}

export function SqlPractice() {
  const { db, status, error: loadError, reset } = useSqlDatabase();

  const [at, setAt] = useState(0);
  const task = SQL_TASKS[at];

  const [sql, setSql] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
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
    if (!db.current) return;

    if (!isSelect(sql)) {
      setResult(null);
      setVerdict(null);
      setError("This task asks for a SELECT. Start your query with SELECT.");
      return;
    }

    try {
      const got = runOneQuery(db.current, sql);
      const want = runOneQuery(db.current, task.solution);
      setResult(got);
      setError(null);
      setVerdict(
        sameResult(got, want, /ORDER\s+BY/i.test(task.solution))
          ? "right"
          : "wrong",
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
          {at + 1}/{SQL_TASKS.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {SQL_TASKS.map((_, i) => (
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

      {/* The schema rather than the rows: there are three tables now, and a
          student can see any of them by running SELECT * on it. */}
      <div className="rounded-lg border border-primary/15 p-2.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span className="hud-label text-[10px]">THE DATABASE</span>
          <Link
            href="/cambridge/sql"
            className="ml-auto flex items-center gap-1 font-code text-[11px] text-primary hover:underline"
          >
            open the playground
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {TABLES.map((t) => (
            <div key={t.name}>
              <button
                type="button"
                onClick={() => setSql(`SELECT * FROM ${t.name}`)}
                className="font-code text-xs font-semibold text-primary hover:underline"
              >
                {t.name}
              </button>
              <ul className="mt-0.5">
                {t.columns.map((c) => (
                  <li
                    key={c.name}
                    className="font-code text-[11px] text-muted-foreground"
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
        className="w-full rounded-lg border border-primary/20 bg-[var(--surface-code)] p-2.5 font-mono text-xs text-primary outline-none focus:border-primary/40"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={run}
          disabled={!sql.trim() || status !== "ready"}
          className="font-code"
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          {status === "loading" ? "Loading…" : "Run"}
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

      {status === "failed" && (
        <p
          role="alert"
          className="flex items-start gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-sm text-destructive"
        >
          <X className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {loadError} —{" "}
            <button type="button" onClick={() => void reset()} className="underline">
              try again
            </button>
          </span>
        </p>
      )}

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
                      <td
                        key={j}
                        className="whitespace-nowrap px-2 py-1 font-mono text-muted-foreground"
                      >
                        {v === null ? "NULL" : String(v)}
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
