"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createDatabase, type SqlDatabase } from "./sql-db";

export type SqlStatus = "loading" | "ready" | "failed";

/**
 * Start SQLite and hand back a database.
 *
 * The single way either half of the site opens a database, so the playground
 * and the practice exercise cannot disagree about a query: whatever one runs,
 * the other marks against.
 *
 * `reset` seeds a fresh copy of the sample school, which is how a student
 * undoes a DELETE they meant to try. `clear` opens an empty database instead,
 * for building their own tables from nothing.
 *
 * `version` counts openings and runs, so a caller can re-read the schema
 * whenever the shape of the database might have changed.
 */
export function useSqlDatabase() {
  const [status, setStatus] = useState<SqlStatus>("loading");
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const db = useRef<SqlDatabase | null>(null);

  const open = useCallback(async (seed: boolean) => {
    setStatus("loading");
    try {
      db.current?.close();
      db.current = await createDatabase(seed);
      setStatus("ready");
    } catch (e) {
      db.current = null;
      setError(e instanceof Error ? e.message : String(e));
      setStatus("failed");
    } finally {
      setVersion((v) => v + 1);
    }
  }, []);

  const reset = useCallback(() => open(true), [open]);
  const clear = useCallback(() => open(false), [open]);

  /** Call after running a script: it may have created or dropped a table. */
  const touched = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    void open(true);
    // The database holds wasm memory; hand it back when the page goes away.
    const handle = db;
    return () => {
      handle.current?.close();
      handle.current = null;
    };
  }, [open]);

  return { db, status, error, version, reset, clear, touched };
}
