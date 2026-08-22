import mysql from "mysql2/promise";

// Single shared connection pool. Created lazily so `next build` (which never
// touches the DB) doesn't need credentials — only the running server does.
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 5),
    charset: "utf8mb4",
    timezone: "Z", // treat/serialize JS Date values as UTC
    // Make MySQL rows look like the old Supabase/Postgres rows:
    //  - TINYINT(1)  -> real boolean (is_public, is_sample, ...)
    //  - JSON        -> parsed object/array (tags, judge_response, layout, ...)
    //  - DATE/DATETIME -> string (not a JS Date), like PostgREST returned
    typeCast: (field, next) => {
      if (field.type === "TINY" && field.length === 1) {
        const s = field.string();
        return s === null ? null : s !== "0";
      }
      if (field.type === "JSON") {
        const s = field.string();
        return s === null ? null : JSON.parse(s);
      }
      if (
        field.type === "DATE" ||
        field.type === "DATETIME" ||
        field.type === "TIMESTAMP" ||
        field.type === "NEWDATE"
      ) {
        return field.string();
      }
      return next();
    },
  });
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}
