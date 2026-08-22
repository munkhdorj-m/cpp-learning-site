import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";
import { LEVELS } from "@/app/(app)/game/robot/levels";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("robot_levels")
    .select("*")
    .order("course", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
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
  const {
    id,
    course,
    name_mn,
    name_en,
    hint_mn,
    hint_en,
    hints_mn,
    hints_en,
    width,
    height,
    layout,
    robot_x,
    robot_y,
    robot_dir,
    targets,
    dangers,
    palette,
    max_blocks,
    xp_reward,
  } = body;

  if (!id || !name_mn || !name_en || !layout) {
    return NextResponse.json(
      { error: "Missing required fields: id, name_mn, name_en, layout" },
      { status: 400 },
    );
  }

  // Level number: keep an existing one, inherit a built-in's, otherwise take
  // the next free slot after every built-in and custom level.
  let order_idx: number = Number(body.order_idx) || 0;
  if (!order_idx) {
    const builtIn = LEVELS.find((l) => l.id === id);
    if (builtIn) {
      order_idx = builtIn.order_idx;
    } else {
      const { data: rows } = await supabase
        .from("robot_levels")
        .select("order_idx")
        .order("order_idx", { ascending: false })
        .limit(1);
      const maxDb = Number(rows?.[0]?.order_idx ?? 0);
      order_idx = Math.max(LEVELS.length, maxDb) + 1;
    }
  }

  const { data, error } = await supabase
    .from("robot_levels")
    // Upsert so that overriding a built-in level (same id) works on the
    // first save (insert) AND on every re-edit (update). A plain insert
    // would fail with a primary-key conflict the second time a teacher
    // edits a built-in level.
    .upsert(
      {
        id,
        course: course ?? "basics",
        name_mn,
        name_en,
        hint_mn: hint_mn ?? "",
        hint_en: hint_en ?? "",
        hints_mn: hints_mn ?? [],
        hints_en: hints_en ?? [],
        width: width ?? 8,
        height: height ?? 8,
        layout: layout ?? [],
        robot_x: robot_x ?? 0,
        robot_y: robot_y ?? 0,
        robot_dir: robot_dir ?? 0,
        targets: targets ?? [],
        dangers: dangers ?? [],
        palette: palette ?? [],
        max_blocks: max_blocks ?? 10,
        xp_reward: xp_reward ?? 20,
        order_idx,
        created_by: user.id,
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
