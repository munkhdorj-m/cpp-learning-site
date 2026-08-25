import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";
import { hashPassword } from "@/lib/auth";

/**
 * Teacher accounts.
 *
 * Until now these could only be made by hand on the server
 * (scripts/add-teacher.mjs), because a teacher is the most powerful account
 * on the site: it reads every class, resets any student's password and opens
 * the plagiarism report.
 *
 * Moving that into the UI means any teacher can mint another teacher. That is
 * the intended trade — a small school should not need SSH to onboard a
 * colleague — but it is worth naming, because it makes every teacher account
 * a route to every other one.
 *
 * Two consequences are handled here:
 *
 *  - The password is TYPED, not generated. makePassword() in
 *    lib/student-accounts.ts produces `blue-fox-284`: 360,000 combinations,
 *    fine for a paper slip and a classmate threat model, far too little for
 *    this. /api/auth/login has no rate limiting, so a weak teacher password is
 *    genuinely brute-forceable.
 *  - The plaintext is never echoed back. The bulk-student route returns
 *    passwords so slips can be printed; one colleague being onboarded in
 *    person does not need that, and not returning it means it cannot end up
 *    in a log or a browser cache.
 */

const createBody = z.object({
  email: z.string().trim().email().max(255),
  // Mirrors chk_profiles_username_len plus the character set the login route
  // expects (it lower-cases before matching).
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "username"),
  display_name: z.string().trim().min(1).max(120),
  // Ten, not the six students get. See the note above about login throttling.
  password: z.string().min(10).max(200),
});

interface TeacherRow {
  id: string;
  display_name: string;
  username: string;
  email: string;
  created_at: string;
}

export async function GET() {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const db = createServiceClient();
  const { data } = await db
    .from("profiles")
    .select("id, display_name, username, email, created_at")
    .eq("role", "teacher")
    .order("created_at", { ascending: true });

  return NextResponse.json(
    { teachers: (data ?? []) as TeacherRow[] },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = createBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: "bad_request", field: first?.path?.[0] ?? null },
      { status: 400 },
    );
  }
  const { email, username, display_name, password } = parsed.data;

  const db = createServiceClient();

  // Check both unique keys up front so the teacher gets "that username is
  // taken" rather than a duplicate-key error naming a constraint.
  //
  // Two queries rather than one .or(): the MySQL shim in lib/mysql/query-builder
  // implements eq/neq/in and nothing else, so .or() would throw at runtime.
  const [{ data: byEmail }, { data: byUsername }] = await Promise.all([
    db.from("profiles").select("id").eq("email", email).maybeSingle(),
    db.from("profiles").select("id").eq("username", username).maybeSingle(),
  ]);

  if (byEmail) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }
  if (byUsername) {
    return NextResponse.json({ error: "username_taken" }, { status: 409 });
  }

  const id = randomUUID();
  const { error } = await db.from("profiles").insert({
    id,
    email,
    password_hash: await hashPassword(password),
    username,
    display_name,
    role: "teacher",
    avatar_seed: randomUUID(),
  });

  if (error) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  // No password in the response — see the note at the top.
  return NextResponse.json({ id, email, username, display_name });
}
