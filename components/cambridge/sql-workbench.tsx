"use client";

import { CodeThemePicker } from "@/components/learn/code-theme-picker";
import { useEffect, useState } from "react";
import {
  Play,
  RotateCcw,
  Database,
  AlertTriangle,
  BookOpen,
  Table2,
  Eraser,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeEditor } from "@/components/code-editor";
import {
  ROW_LIMIT,
  SQL_EXAMPLES,
  readSchema,
  runScript,
  type ScriptOutcome,
  type SqlExample,
  type SqlValue,
  type TableInfo,
} from "@/lib/cambridge/sql-db";
import { useSqlDatabase } from "@/lib/cambridge/use-sql-db";

/**
 * A real database to type SQL into.
 *
 * The engine is SQLite, running as WebAssembly in the student's own browser,
 * so a wrong answer here is genuinely a wrong query rather than a gap in a
 * parser we wrote. Nothing leaves the machine, which also means a student can
 * DROP every table without consequence — Reset puts the school back.
 */

/** SQL NULL is not the empty string, and a student has to be able to see it. */
function cell(v: SqlValue) {
  if (v === null) {
    return <span className="text-muted-foreground/60 italic">NULL</span>;
  }
  if (v instanceof Uint8Array) {
    return <span className="text-muted-foreground/60">{v.length} bytes</span>;
  }
  return String(v);
}

/** The first line of a statement, for labelling its result. */
function summarise(sql: string) {
  const flat = sql.replace(/\s+/g, " ").trim();
  return flat.length > 90 ? flat.slice(0, 89) + "…" : flat;
}

export function SqlWorkbench() {
  const [code, setCode] = useState(SQL_EXAMPLES[0].sql);
  const [loaded, setLoaded] = useState(SQL_EXAMPLES[0].name);
  const [outcome, setOutcome] = useState<ScriptOutcome | null>(null);
  const {
    db,
    status,
    error: loadError,
    version,
    reset: reseed,
    clear: empty,
    touched,
  } = useSqlDatabase();

  // Read back from SQLite after every run and every reopen, so a CREATE or a
  // DROP shows up in the panel straight away.
  const [schema, setSchema] = useState<TableInfo[]>([]);
  useEffect(() => {
    setSchema(db.current && status === "ready" ? readSchema(db.current) : []);
  }, [db, status, version]);

  const run = () => {
    if (!db.current) return;
    setOutcome(runScript(db.current, code));
    touched();
  };

  const reset = async () => {
    await reseed();
    setOutcome(null);
  };

  const clear = async () => {
    await empty();
    setOutcome(null);
  };

  const load = (ex: SqlExample) => {
    setCode(ex.sql);
    setLoaded(ex.name);
    setOutcome(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">{"//"}</span>
            CAMBRIDGE.SQL
            {/* Same control, same placement as the IDE — the editor here
                already follows data-code-theme, it just had no way to set
                it. */}
            <CodeThemePicker className="ml-1" />
          </div>
          <h1 className="text-2xl font-bold">SQL playground</h1>
          <p className="text-sm text-muted-foreground">
            A school database you can actually query. It is real SQLite, in your
            browser — nothing you type here leaves this machine.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void clear()}
            disabled={status === "loading"}
            title="Remove every table and start from nothing"
          >
            <Eraser className="mr-1.5 h-4 w-4" />
            Clear database
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void reset()}
            disabled={status === "loading"}
            title="Put the sample school data back"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reset database
          </Button>
          <Button
            onClick={run}
            size="sm"
            className="font-code"
            disabled={status !== "ready"}
          >
            <Play className="mr-1.5 h-4 w-4" />
            {status === "loading" ? "Loading…" : "Run"}
          </Button>
        </div>
      </div>

      {status === "failed" && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {loadError} —{" "}
            <button
              type="button"
              onClick={() => void reset()}
              className="underline"
            >
              try again
            </button>
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="overflow-hidden py-0">
            <div className="h-[340px]">
              <CodeEditor value={code} onChange={setCode} monacoLanguage="sql" />
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Table2 className="h-4 w-4" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!outcome && (
                <p className="font-code text-sm text-muted-foreground/60">
                  -- press Run
                </p>
              )}

              {outcome?.statements.map((s, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="font-code text-[11px] text-muted-foreground">
                    {summarise(s.sql)}
                  </p>

                  {s.result ? (
                    s.result.rows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No rows matched.
                      </p>
                    ) : (
                      <>
                        <div className="overflow-x-auto rounded border border-primary/15">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="bg-primary/[0.07]">
                                {s.result.columns.map((c) => (
                                  <th
                                    key={c}
                                    scope="col"
                                    className="whitespace-nowrap border-b border-primary/15 px-2.5 py-1.5 text-left font-code text-xs font-semibold text-primary"
                                  >
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {s.result.rows.map((row, r) => (
                                <tr
                                  key={r}
                                  className="border-b border-primary/10 last:border-0"
                                >
                                  {row.map((v, c) => (
                                    <td
                                      key={c}
                                      className="whitespace-nowrap px-2.5 py-1 font-mono text-[13px]"
                                    >
                                      {cell(v)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {s.result.rows.length} row
                          {s.result.rows.length === 1 ? "" : "s"}
                          {s.result.rows.length >= ROW_LIMIT &&
                            ` (stopped at ${ROW_LIMIT})`}
                        </p>
                      </>
                    )
                  ) : (
                    <p className="text-sm text-neon-lime">
                      {s.changed === undefined
                        ? "Done."
                        : s.changed === 0
                          ? "Done. No rows changed."
                          : `Done. ${s.changed} row${s.changed === 1 ? "" : "s"} changed.`}
                    </p>
                  )}
                </div>
              ))}

              {outcome?.error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-2.5 text-sm text-destructive"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="font-mono text-[13px]">{outcome.error}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Database className="h-4 w-4" />
                Tables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {schema.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {status === "ready"
                    ? "The database is empty. Write a CREATE TABLE, or press Reset database to bring the school back."
                    : "…"}
                </p>
              )}
              {schema.map((t) => (
                <div key={t.name}>
                  <button
                    type="button"
                    onClick={() => setCode(`SELECT *\nFROM ${t.name};`)}
                    className="font-code text-sm font-semibold text-primary hover:underline"
                  >
                    {t.name}
                    {t.isView && (
                      <span className="ml-1.5 font-normal opacity-60">view</span>
                    )}
                  </button>
                  <ul className="mt-0.5 space-y-0.5">
                    {t.columns.map((c) => (
                      <li
                        key={c.name}
                        className="flex items-baseline gap-1.5 font-code text-[11px] text-muted-foreground"
                      >
                        <span className="text-foreground">{c.name}</span>
                        <span className="opacity-60">{c.type}</span>
                        {c.note && (
                          <span className="opacity-50">· {c.note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {SQL_EXAMPLES.map((ex) => (
                  <li key={ex.name}>
                    <button
                      type="button"
                      onClick={() => load(ex)}
                      title={ex.about}
                      className={`hud-hover w-full border border-transparent px-2 py-1 text-left text-xs ${
                        ex.name === loaded
                          ? "border-primary text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {ex.name}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                {SQL_EXAMPLES.find((e) => e.name === loaded)?.about ??
                  "Pick one to load it into the editor."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
