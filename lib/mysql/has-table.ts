import { cache } from "react";

import { query } from "./pool";

/**
 * Does this table exist yet?
 *
 * Migrations here are applied by hand, on the server, one file at a time — so
 * "the code is deployed" and "the table exists" are two different events, and
 * for a while they are not the same. A page that hard-references a table added
 * in the same release throws ER_NO_SUCH_TABLE for every student until someone
 * remembers to run the file.
 *
 * This lets a page ask first and leave the new part out until the table turns
 * up. It is not a substitute for running the migration; it is what stops the
 * gap between deploy and migrate from being an outage.
 *
 * `cache` is React's per-request memo, so a page asking about three tables
 * costs three queries on the first render and none afterwards.
 */
export const hasTable = cache(async (name: string): Promise<boolean> => {
  // Name comes from our own source, never from a request, but it is still
  // bound as a parameter rather than interpolated.
  const rows = await query<{ n: number }>(
    `SELECT COUNT(*) AS n
       FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?`,
    [name],
  );
  return Number(rows[0]?.n ?? 0) > 0;
});
