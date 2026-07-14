import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({ code: z.string().min(1).max(64) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: "bad_request" }, { status: 400 });
  }
  const { code } = parsed.data;

  if (code === process.env.TEACHER_INVITE_CODE) {
    return NextResponse.json({
      valid: true,
      role: "teacher" as const,
      className: null,
    });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, name")
    .eq("invite_code", code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "invalid_code" });
  }

  return NextResponse.json({
    valid: true,
    role: "student" as const,
    classId: data.id,
    className: data.name,
  });
}
