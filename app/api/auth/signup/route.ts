import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  code: z.string().min(1).max(64),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad_request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { code, username, displayName, email, password } = parsed.data;

  const supabase = createServiceClient();

  let classId: string | null = null;
  let role: "student" | "teacher" = "student";

  if (code === process.env.TEACHER_INVITE_CODE) {
    role = "teacher";
  } else {
    const { data } = await supabase
      .from("classes")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();
    if (!data) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }
    classId = data.id;
  }

  // Reject duplicate username up front (DB constraint would also reject,
  // but this gives a cleaner error to the client).
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "username_taken" }, { status: 409 });
  }

  const { data: created, error: signupError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, display_name: displayName, role, class_id: classId },
  });
  if (signupError || !created.user) {
    const msg = signupError?.message ?? "signup_failed";
    const status = msg.toLowerCase().includes("already") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    username,
    display_name: displayName,
    role,
    class_id: classId,
  });
  if (profileError) {
    // Roll back the auth user so the next attempt isn't blocked by duplicate email.
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
