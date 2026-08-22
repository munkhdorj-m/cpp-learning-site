import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";
import { hashPassword } from "@/lib/auth";
import { makePassword } from "@/lib/student-accounts";

const schema = z.object({ user_id: z.string().uuid() });

export async function POST(request: Request) {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const db = createServiceClient();
  const { data: student } = await db
    .from("profiles")
    .select("id, username, display_name, role")
    .eq("id", parsed.data.user_id)
    .maybeSingle();

  // Only student passwords can be reset this way — not another teacher's.
  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const password = makePassword();
  const { error } = await db
    .from("profiles")
    .update({ password_hash: await hashPassword(password) })
    .eq("id", student.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    username: student.username,
    displayName: student.display_name,
    password, // shown once so the teacher can write it down
  });
}
