import { NextResponse } from "next/server";
import { z } from "zod";

import { getCachedSession } from "@/lib/get-session";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword, verifyPassword, setSession } from "@/lib/auth";
import { hit, reset } from "@/lib/rate-limit";

/**
 * Change your own password.
 *
 * The current password is required. Without it, a session left open on a
 * shared classroom laptop is not "someone reads my XP" but "someone owns this
 * account permanently", and the real owner is locked out of their own work.
 *
 * Minimum length follows the role, matching the rules already applied
 * elsewhere: 10 for a teacher (they can reset every student's password and
 * read the plagiarism report), 6 for a student. See scripts/add-teacher.mjs
 * and app/api/teacher/teachers/route.ts.
 */

const MIN_BY_ROLE = { teacher: 10, student: 6 } as const;

/** Five wrong guesses in fifteen minutes is a typo; the sixth is a search. */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const body = z.object({
  current_password: z.string().min(1).max(200),
  new_password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { current_password, new_password } = parsed.data;

  // Counted before the password is checked, so a wrong guess costs an attempt
  // whatever the outcome.
  const gate = hit(`pw:${user.id}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "too_many_attempts", retry_after: gate.retryAfter },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } },
    );
  }

  const db = createServiceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("id, email, role, password_hash")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const row = profile as {
    id: string;
    email: string;
    role: "student" | "teacher";
    password_hash: string;
  };

  // verifyPassword returns false for a blank hash, which is what imported
  // accounts carry. Those cannot self-serve — a teacher has to set one first
  // with scripts/set-password.mjs.
  if (!(await verifyPassword(current_password, row.password_hash))) {
    return NextResponse.json(
      { error: "wrong_password", remaining: gate.remaining },
      { status: 403 },
    );
  }

  const min = MIN_BY_ROLE[row.role] ?? MIN_BY_ROLE.student;
  if (new_password.length < min) {
    return NextResponse.json({ error: "too_short", min }, { status: 400 });
  }
  if (new_password === current_password) {
    return NextResponse.json({ error: "same_password" }, { status: 400 });
  }

  const { error } = await db
    .from("profiles")
    .update({ password_hash: await hashPassword(new_password) })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  // They proved they know the old password, so the window was legitimate use.
  reset(`pw:${user.id}`);

  // Re-issue this browser's cookie so the person who just changed it stays
  // signed in. Note what this does NOT do: sessions are stateless JWTs, so a
  // cookie already copied to another device keeps working until it expires.
  // Changing a password here does not evict anyone else.
  await setSession(row.id, row.email);

  return NextResponse.json({ ok: true });
}
