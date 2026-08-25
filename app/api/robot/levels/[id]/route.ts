import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";
import { query } from "@/lib/mysql/pool";
import { findLevel } from "@/app/(app)/game/robot/levels";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("robot_levels")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  // Strip fields that must not be overwritten via update.
  const {
    id: _id,
    created_by: _cb,
    created_at: _ca,
    updated_at: _ua,
    ...updates
  } = body;
  const { data, error } = await supabase
    .from("robot_levels")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

/**
 * Take a level out of the game, or put it back.
 *
 * DELETE removes a level from what students see. What that means depends on
 * what the level is:
 *
 *   * a built-in (a constant in levels.ts, with no row of its own) is HIDDEN —
 *     recorded in robot_hidden_levels. There is no row to delete, which is
 *     exactly why the delete button never used to appear next to one.
 *   * an override of a built-in is also hidden, and its row is left alone, so
 *     restoring gives back the teacher's edited version rather than silently
 *     reverting to the original.
 *   * a level that only exists in the database is really deleted.
 *
 * `?restore=1` undoes a hide.
 *
 * The old handler also required `created_by = <this teacher>`. That is not how
 * authorisation works anywhere else in this app — every other teacher page
 * grants on the role alone — and combined with the MySQL shim, which does not
 * report affected rows, a delete of another teacher's level matched nothing,
 * reported success, and left the row on screen after the "Level deleted"
 * toast. Any teacher may now manage any level, and the result is checked.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const restore = req.nextUrl.searchParams.get("restore") === "1";

  if (restore) {
    await query("DELETE FROM robot_hidden_levels WHERE level_id = ?", [id]);
    return NextResponse.json({ ok: true, hidden: false });
  }

  const isBuiltIn = !!findLevel(id);

  if (isBuiltIn) {
    await query(
      `INSERT INTO robot_hidden_levels (level_id, hidden_by)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE hidden_by = VALUES(hidden_by),
                               hidden_at = CURRENT_TIMESTAMP(6)`,
      [id, user.id],
    );
    return NextResponse.json({ ok: true, hidden: true });
  }

  // Database-only level: really gone. Clear any hide row first so the id does
  // not stay suppressed if a level is later created with the same slug.
  await query("DELETE FROM robot_hidden_levels WHERE level_id = ?", [id]);
  await query("DELETE FROM robot_levels WHERE id = ?", [id]);

  const still = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM robot_levels WHERE id = ?",
    [id],
  );
  if ((still[0]?.n ?? 0) > 0) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, hidden: false, deleted: true });
}
