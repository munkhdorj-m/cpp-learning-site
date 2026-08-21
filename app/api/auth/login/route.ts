import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { verifyPassword, setSession } from "@/lib/auth";

// Students sign in with the username printed on their slip; teachers may
// still use their email. One field accepts either.
const schema = z.object({
  login: z.string().min(1).max(255),
  password: z.string().min(1).max(72),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { password } = parsed.data;
  const login = parsed.data.login.trim();

  const db = createServiceClient();
  // Most sign-ins are students using a username; teachers use an email.
  let { data: user } = await db
    .from("profiles")
    .select("id, email, password_hash")
    .eq("email", login)
    .maybeSingle();
  if (!user) {
    ({ data: user } = await db
      .from("profiles")
      .select("id, email, password_hash")
      .eq("username", login.toLowerCase())
      .maybeSingle());
  }

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await setSession(user.id, user.email);
  return NextResponse.json({ ok: true });
}
