import { randomUUID } from "node:crypto";

import { getPool } from "./pool";

// A tiny Supabase-compatible query builder over MySQL, covering the exact
// subset the app uses: from/select/insert/update/upsert/delete +
// eq/neq/gt/gte/lt/lte/in/order/limit/single/maybeSingle. It is awaitable and
// resolves to { data, error } just like supabase-js, so existing call sites
// don't change. NOTE: security is NOT enforced here (Postgres RLS is gone) —
// server code must do its own auth checks.

type Val = unknown;
// data is intentionally `any`: this adapter replaces supabase-js's generated
// types, and the ~50 call sites rely on loose typing. Runtime returns real rows.
interface Result {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  count?: number | null;
  error: { message: string } | null;
}

// Tables whose single-column PK is a generated uuid — auto-fill `id` on insert.
const UUID_ID_TABLES = new Set([
  "classes",
  "profiles",
  "problems",
  "test_cases",
  "submissions",
  "assignments",
  "contests",
  "badges",
  "code_similarity",
  "quests",
  "notifications",
]);

function toParam(v: Val): Val {
  if (v === undefined) return null;
  if (v === null) return null;
  if (v instanceof Date) return v;
  if (Array.isArray(v) || (typeof v === "object" && !Buffer.isBuffer(v))) {
    return JSON.stringify(v);
  }
  return v;
}

function colList(cols: string): string {
  const trimmed = cols.trim();
  if (trimmed === "*" || trimmed === "") return "*";
  return trimmed
    .split(",")
    .map((c) => `\`${c.trim()}\``)
    .join(", ");
}

type Op = "select" | "insert" | "update" | "upsert" | "delete";

class QueryBuilder<T = Record<string, unknown>> implements PromiseLike<Result> {
  private op: Op = "select";
  private selectCols = "*";
  private wheres: string[] = [];
  private params: Val[] = [];
  private orders: string[] = [];
  private _limit?: number;
  private values?: Record<string, Val> | Record<string, Val>[];
  private ignoreDuplicates = false;
  private returnRows = false;
  private singleMode: false | "single" | "maybe" = false;
  private countMode = false;
  private headMode = false;

  constructor(private table: string) {}

  select(
    cols = "*",
    opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean },
  ): this {
    if (this.op === "select") {
      this.selectCols = colList(cols);
      if (opts?.count) {
        this.countMode = true;
        this.headMode = !!opts.head;
      }
    } else {
      this.returnRows = true; // e.g. insert(...).select()
    }
    return this;
  }
  insert(v: Record<string, Val> | Record<string, Val>[]): this {
    this.op = "insert";
    this.values = v;
    return this;
  }
  update(v: Record<string, Val>): this {
    this.op = "update";
    this.values = v;
    return this;
  }
  upsert(
    v: Record<string, Val> | Record<string, Val>[],
    opts?: { onConflict?: string; ignoreDuplicates?: boolean },
  ): this {
    this.op = "upsert";
    this.values = v;
    this.ignoreDuplicates = !!opts?.ignoreDuplicates;
    return this;
  }
  delete(): this {
    this.op = "delete";
    return this;
  }

  eq(col: string, v: Val) { return this.cmp(col, "=", v); }
  neq(col: string, v: Val) { return this.cmp(col, "<>", v); }
  gt(col: string, v: Val) { return this.cmp(col, ">", v); }
  gte(col: string, v: Val) { return this.cmp(col, ">=", v); }
  lt(col: string, v: Val) { return this.cmp(col, "<", v); }
  lte(col: string, v: Val) { return this.cmp(col, "<=", v); }
  private cmp(col: string, opr: string, v: Val): this {
    this.wheres.push(`\`${col}\` ${opr} ?`);
    this.params.push(toParam(v));
    return this;
  }
  in(col: string, arr: Val[]): this {
    if (!arr || arr.length === 0) {
      this.wheres.push("1 = 0");
    } else {
      this.wheres.push(`\`${col}\` IN (${arr.map(() => "?").join(", ")})`);
      this.params.push(...arr.map(toParam));
    }
    return this;
  }
  is(col: string, v: null | boolean): this {
    if (v === null) this.wheres.push(`\`${col}\` IS NULL`);
    else this.wheres.push(`\`${col}\` IS ${v ? "TRUE" : "FALSE"}`);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orders.push(`\`${col}\` ${opts?.ascending === false ? "DESC" : "ASC"}`);
    return this;
  }
  limit(n: number): this {
    this._limit = n;
    return this;
  }
  range(from: number, to: number): this {
    this._limit = to - from + 1;
    // offset handled inline in build
    this._offset = from;
    return this;
  }
  private _offset?: number;

  single(): this {
    this.singleMode = "single";
    return this;
  }
  maybeSingle(): this {
    this.singleMode = "maybe";
    return this;
  }

  private whereClause(): string {
    return this.wheres.length ? ` WHERE ${this.wheres.join(" AND ")}` : "";
  }

  private async run(): Promise<Result> {
    const pool = getPool();
    if (this.op === "select") {
      const where = this.whereClause();
      if (this.countMode) {
        const [cntRows] = await pool.query(
          `SELECT COUNT(*) AS cnt FROM \`${this.table}\`${where}`,
          this.params,
        );
        const count = Number((cntRows as { cnt: number }[])[0]?.cnt ?? 0);
        if (this.headMode) return { data: null, count, error: null };
        let sql = `SELECT ${this.selectCols} FROM \`${this.table}\`${where}`;
        if (this.orders.length) sql += ` ORDER BY ${this.orders.join(", ")}`;
        if (this._limit != null) sql += ` LIMIT ${Number(this._limit)}`;
        const [rows] = await pool.query(sql, this.params);
        return { data: rows, count, error: null };
      }
      let sql = `SELECT ${this.selectCols} FROM \`${this.table}\`${where}`;
      if (this.orders.length) sql += ` ORDER BY ${this.orders.join(", ")}`;
      const lim = this.singleMode && this._limit == null ? 1 : this._limit;
      if (lim != null) sql += ` LIMIT ${Number(lim)}`;
      if (this._offset != null) sql += ` OFFSET ${Number(this._offset)}`;
      const [rows] = await pool.query(sql, this.params);
      const arr = rows as Record<string, unknown>[];
      if (this.singleMode) return { data: arr[0] ?? null, error: null };
      return { data: arr, error: null };
    }

    if (this.op === "delete") {
      const sql = `DELETE FROM \`${this.table}\`${this.whereClause()}`;
      await pool.query(sql, this.params);
      return { data: null, error: null };
    }

    if (this.op === "update") {
      const v = this.values as Record<string, Val>;
      const keys = Object.keys(v);
      const setSql = keys.map((k) => `\`${k}\` = ?`).join(", ");
      const setParams = keys.map((k) => toParam(v[k]));
      const sql = `UPDATE \`${this.table}\` SET ${setSql}${this.whereClause()}`;
      await pool.query(sql, [...setParams, ...this.params]);
      if (this.returnRows) {
        const [rows] = await pool.query(
          `SELECT * FROM \`${this.table}\`${this.whereClause()}`,
          this.params,
        );
        const arr = rows as Record<string, unknown>[];
        return { data: this.singleMode ? (arr[0] ?? null) : arr, error: null };
      }
      return { data: null, error: null };
    }

    // insert / upsert
    const rowsIn = Array.isArray(this.values) ? this.values : [this.values!];
    const withIds = rowsIn.map((r) => {
      const row = { ...r };
      if (UUID_ID_TABLES.has(this.table) && row.id == null) row.id = randomUUID();
      return row;
    });
    const cols = Array.from(
      withIds.reduce((s, r) => {
        Object.keys(r).forEach((k) => s.add(k));
        return s;
      }, new Set<string>()),
    );
    const placeholders = withIds
      .map(() => `(${cols.map(() => "?").join(", ")})`)
      .join(", ");
    const flat: Val[] = [];
    for (const r of withIds) for (const c of cols) flat.push(toParam(r[c]));
    const colSql = cols.map((c) => `\`${c}\``).join(", ");

    let sql: string;
    if (this.op === "upsert") {
      const verb = this.ignoreDuplicates ? "INSERT IGNORE" : "INSERT";
      sql = `${verb} INTO \`${this.table}\` (${colSql}) VALUES ${placeholders}`;
      if (!this.ignoreDuplicates) {
        const upd = cols.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(", ");
        sql += ` ON DUPLICATE KEY UPDATE ${upd}`;
      }
    } else {
      sql = `INSERT INTO \`${this.table}\` (${colSql}) VALUES ${placeholders}`;
    }
    await pool.query(sql, flat);

    if (this.returnRows) {
      const ids = withIds.map((r) => r.id).filter((x) => x != null);
      if (ids.length) {
        const [rows] = await pool.query(
          `SELECT * FROM \`${this.table}\` WHERE \`id\` IN (${ids.map(() => "?").join(", ")})`,
          ids,
        );
        const arr = rows as Record<string, unknown>[];
        return { data: this.singleMode ? (arr[0] ?? null) : arr, error: null };
      }
      return {
        data: this.singleMode ? withIds[0] : withIds,
        error: null,
      };
    }
    return { data: null, error: null };
  }

  // Resolves to `any` on purpose: call sites use loose row typing (this
  // adapter has no generated types), so `await`ing a query yields `any`.
  then<R1 = Result, R2 = never>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onfulfilled?: ((v: any) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.run().then(
      (r) => (onfulfilled ? onfulfilled(r) : (r as unknown as R1)),
      (e) => {
        // Never throw from a query — mirror supabase's { data, error } shape.
        const result: Result = {
          data: null,
          error: { message: e instanceof Error ? e.message : String(e) },
        };
        if (onfulfilled) return onfulfilled(result);
        if (onrejected) return onrejected(e);
        return result as unknown as R1;
      },
    );
  }
}

// --- report functions (former Postgres RPCs) ---
async function rpc(name: string, args?: Record<string, unknown>): Promise<Result> {
  const pool = getPool();
  try {
    if (name === "class_week_xp") {
      const [rows] = await pool.query(
        `SELECT c.id AS class_id, c.name AS class_name, c.grade,
                COALESCE(SUM(s.xp_awarded), 0) AS week_xp,
                COUNT(DISTINCT p.id) AS student_count
           FROM classes c
           LEFT JOIN profiles p ON p.class_id = c.id AND p.role = 'student'
           LEFT JOIN submissions s ON s.user_id = p.id
                 AND s.verdict = 'accepted' AND s.is_first_accepted = TRUE
                 AND s.created_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)
          GROUP BY c.id, c.name, c.grade
          ORDER BY week_xp DESC, c.name ASC`,
      );
      return { data: rows, error: null };
    }
    if (name === "contest_leaderboard") {
      const id = args?.contest_id_in;
      const [rows] = await pool.query(
        `SELECT p.id AS user_id, p.display_name, p.username, cl.name AS class_name,
                COALESCE(SUM(cp.points), 0) AS score,
                COUNT(sub.problem_id) AS problems_solved
           FROM contests c
           JOIN profiles p ON (c.class_id IS NULL OR p.class_id = c.class_id)
                          AND p.role = 'student'
           LEFT JOIN classes cl ON cl.id = p.class_id
           LEFT JOIN submissions sub ON sub.user_id = p.id
                 AND sub.verdict = 'accepted' AND sub.is_first_accepted = TRUE
                 AND sub.created_at >= c.start_at AND sub.created_at <= c.end_at
           LEFT JOIN contest_problems cp ON cp.contest_id = c.id
                 AND cp.problem_id = sub.problem_id
          WHERE c.id = ?
          GROUP BY p.id, p.display_name, p.username, cl.name
         HAVING COUNT(sub.problem_id) > 0
          ORDER BY score DESC, problems_solved DESC, p.display_name ASC`,
        [id],
      );
      return { data: rows, error: null };
    }
    return { data: null, error: { message: `unknown rpc: ${name}` } };
  } catch (e) {
    return { data: null, error: { message: e instanceof Error ? e.message : String(e) } };
  }
}

export function createDbClient() {
  return {
    // `any` return keeps the previous supabase-js loose typing at call sites
    // (rows were effectively untyped). Runtime is a real QueryBuilder.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string): any => new QueryBuilder(table),
    rpc,
  };
}

export type DbClient = ReturnType<typeof createDbClient>;
