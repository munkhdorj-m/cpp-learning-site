import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword, setSession } from "@/lib/auth";

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

  const db = createServiceClient();

  let classId: string | null = null;
  let role: "student" | "teacher" = "student";

  if (code === process.env.TEACHER_INVITE_CODE) {
    role = "teacher";
  } else {
    const { data } = await db
      .from("classes")
      .select("id")
      .eq("invite_code", code)
      .maybeSingle();
    if (!data) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }
    classId = data.id;
  }

  // Reject duplicate username / email up front for a clean error.
  const { data: dupUser } = await db
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (dupUser) {
    return NextResponse.json({ error: "username_taken" }, { status: 409 });
  }
  const { data: dupEmail } = await db
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (dupEmail) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const id = randomUUID();
  const password_hash = await hashPassword(password);

  const { error } = await db.from("profiles").insert({
    id,
    email,
    password_hash,
    username,
    display_name: displayName,
    role,
    class_id: classId,
    avatar_seed: randomUUID(),
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await setSession(id, email);
  return NextResponse.json({ ok: true });
}
