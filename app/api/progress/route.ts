import { NextResponse } from "next/server";
import { z } from "zod";

import { getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";

/**
 * What a student has finished reading.
 *
 * This used to live in localStorage, which meant it vanished when a student
 * switched device and was invisible to their teacher. The browser still keeps
 * a copy for instant rendering; this is the copy that counts.
 */

const mark = z.object({
  kind: z.enum(["lesson", "cambridge"]),
  slug: z.string().min(1).max(96),
  done: z.boolean(),
});

export async function GET() {
  const user = await getCachedSession();
  if (!user) return NextResponse.json({ lesson: [], cambridge: [] });

  try {
    const rows = await query<{ kind: string; slug: string }>(
      "SELECT kind, slug FROM content_progress WHERE user_id = ?",
      [user.id],
    );
    return NextResponse.json(
      {
        lesson: rows.filter((r) => r.kind === "lesson").map((r) => r.slug),
        cambridge: rows.filter((r) => r.kind === "cambridge").map((r) => r.slug),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    // Never block reading a lesson because progress could not be loaded.
    return NextResponse.json({ lesson: [], cambridge: [] });
  }
}

export async function POST(request: Request) {
  const user = await getCachedSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = mark.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { kind, slug, done } = parsed.data;

  try {
    if (done) {
      await query(
        `INSERT INTO content_progress (user_id, kind, slug)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE done_at = CURRENT_TIMESTAMP(6)`,
        [user.id, kind, slug],
      );
    } else {
      await query(
        "DELETE FROM content_progress WHERE user_id = ? AND kind = ? AND slug = ?",
        [user.id, kind, slug],
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
