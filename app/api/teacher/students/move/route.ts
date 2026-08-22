import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";

// Moving a whole class at once is the yearly operation: this year's 7A
// becomes next year's 8A. `to_class_id: null` graduates them instead —
// they keep their account and history but belong to no class.
const schema = z.object({
  from_class_id: z.string().uuid(),
  to_class_id: z.string().uuid().nullable(),
});

export async function POST(request: Request) {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { from_class_id, to_class_id } = parsed.data;

  if (from_class_id === to_class_id) {
    return NextResponse.json({ error: "same_class" }, { status: 400 });
  }

  const db = createServiceClient();

  if (to_class_id) {
    const { data: target } = await db
      .from("classes")
      .select("id")
      .eq("id", to_class_id)
      .maybeSingle();
    if (!target) {
      return NextResponse.json({ error: "target_not_found" }, { status: 404 });
    }
  }

  const { data: students } = await db
    .from("profiles")
    .select("id")
    .eq("class_id", from_class_id)
    .eq("role", "student");
  const count = (students ?? []).length;

  if (count === 0) {
    return NextResponse.json({ moved: 0 });
  }

  // Only students move. Submissions, XP and badges hang off the profile, so
  // every bit of their history follows them automatically.
  const { error } = await db
    .from("profiles")
    .update({ class_id: to_class_id })
    .eq("class_id", from_class_id)
    .eq("role", "student");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ moved: count });
}
