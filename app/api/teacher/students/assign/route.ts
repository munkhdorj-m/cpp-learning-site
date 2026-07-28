import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";

// Puts specific students into a class. Used to rescue students whose class
// was deleted; PromoteClass moves a whole class at once instead.
const schema = z.object({
  user_ids: z.array(z.string().uuid()).min(1).max(200),
  to_class_id: z.string().uuid(),
});

export async function POST(request: Request) {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { user_ids, to_class_id } = parsed.data;

  const db = createServiceClient();

  const { data: target } = await db
    .from("classes")
    .select("id")
    .eq("id", to_class_id)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: "class_not_found" }, { status: 404 });
  }

  const { error } = await db
    .from("profiles")
    .update({ class_id: to_class_id })
    .in("id", user_ids)
    .eq("role", "student");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ moved: user_ids.length });
}
