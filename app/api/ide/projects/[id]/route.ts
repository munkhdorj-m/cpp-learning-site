import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { MAX_IDE_CODE } from "@/lib/ide-projects";

/**
 * One saved sandbox file: open it, save over it, throw it away.
 *
 * Every statement carries `AND user_id = ?` rather than checking ownership in
 * a separate SELECT first. A guessed id then matches zero rows instead of
 * returning somebody else's homework, and there is no window between the
 * check and the write.
 */

const patchBody = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    language: z.enum(["cpp", "python"]).optional(),
    code: z.string().max(MAX_IDE_CODE).optional(),
    stdin: z.string().max(MAX_IDE_CODE).optional(),
  })
  // An empty patch would build "SET  WHERE ...", which is a syntax error.
  .refine((v) => Object.keys(v).length > 0, { message: "empty_patch" });

interface FullRow {
  id: string;
  name: string;
  language: string;
  code: string;
  stdin: string | null;
  created_at: string;
  updated_at: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const rows = await query<FullRow>(
      `SELECT id, name, language, code, stdin, created_at, updated_at
         FROM ide_projects
        WHERE id = ? AND user_id = ?`,
      [id, user.id],
    );
    if (!rows.length) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json(rows[0], {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "load_failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const parsed = patchBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Column names come from the schema keys above, never from the request body,
  // so this cannot be steered into writing a column the student chose.
  const fields = Object.entries(parsed.data);
  const setSql = fields.map(([col]) => `${col} = ?`).join(", ");
  const values = fields.map(([, v]) => v);

  try {
    const result = await query(
      `UPDATE ide_projects SET ${setSql} WHERE id = ? AND user_id = ?`,
      [...values, id, user.id],
    );
    // mysql2 returns an OkPacket for UPDATE; a miss means wrong id or wrong owner.
    const affected = (result as unknown as { affectedRows?: number })
      ?.affectedRows;
    if (affected === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await query("DELETE FROM ide_projects WHERE id = ? AND user_id = ?", [
      id,
      user.id,
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
