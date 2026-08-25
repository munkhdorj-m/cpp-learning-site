import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { MAX_IDE_CODE, MAX_IDE_PROJECTS } from "@/lib/ide-projects";

/**
 * A student's saved sandbox files.
 *
 * The list deliberately does NOT return `code`. It is MEDIUMTEXT, and a class
 * of thirty with a cap of sixty files each would otherwise pull megabytes back
 * just to draw a sidebar. Opening a file fetches its body from [id].
 */

const createBody = z.object({
  name: z.string().trim().min(1).max(80),
  language: z.enum(["cpp", "python"]),
  code: z.string().max(MAX_IDE_CODE),
  stdin: z.string().max(MAX_IDE_CODE).optional().default(""),
});

interface ProjectRow {
  id: string;
  name: string;
  language: string;
  updated_at: string;
  created_at: string;
}

export async function GET() {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const rows = await query<ProjectRow>(
      `SELECT id, name, language, created_at, updated_at
         FROM ide_projects
        WHERE user_id = ?
        ORDER BY updated_at DESC`,
      [user.id],
    );
    return NextResponse.json(
      { projects: rows },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    // A sandbox that cannot list old work is still a usable sandbox.
    return NextResponse.json({ projects: [] });
  }
}

export async function POST(request: Request) {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = createBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { name, language, code, stdin } = parsed.data;

  try {
    const [{ n }] = await query<{ n: number }>(
      "SELECT COUNT(*) AS n FROM ide_projects WHERE user_id = ?",
      [user.id],
    );
    if (n >= MAX_IDE_PROJECTS) {
      return NextResponse.json(
        { error: "too_many", limit: MAX_IDE_PROJECTS },
        { status: 409 },
      );
    }

    const id = randomUUID();
    await query(
      `INSERT INTO ide_projects (id, user_id, name, language, code, stdin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.id, name, language, code, stdin],
    );
    return NextResponse.json({ id, name, language });
  } catch {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
