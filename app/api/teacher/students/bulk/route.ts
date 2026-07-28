import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";
import { hashPassword } from "@/lib/auth";
import { generateForNames, gradePrefix } from "@/lib/student-accounts";

const schema = z.object({
  class_id: z.string().uuid(),
  names: z.array(z.string().max(80)).min(1).max(60),
  /** true = only show what would be created, don't write anything */
  preview: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { class_id, names, preview } = parsed.data;

  const db = createServiceClient();

  const { data: cls } = await db
    .from("classes")
    .select("id, name, grade")
    .eq("id", class_id)
    .maybeSingle();
  if (!cls) {
    return NextResponse.json({ error: "class_not_found" }, { status: 404 });
  }

  // Usernames must be unique across the whole school, so seed the "taken" set
  // with every existing one before generating.
  const { data: existing } = await db.from("profiles").select("username");
  const taken = new Set<string>(
    (existing ?? []).map((r: { username: string }) => r.username),
  );

  // Prefix by graduation year, worked out from the class's grade — a username
  // must stay correct when the student moves up a grade next year.
  const students = generateForNames(
    names,
    gradePrefix(Number(cls.grade)),
    taken,
  );
  if (students.length === 0) {
    return NextResponse.json({ error: "no_names" }, { status: 400 });
  }

  if (preview) {
    // Don't leak real passwords for a preview — they're regenerated on create.
    return NextResponse.json({
      preview: true,
      students: students.map((s) => ({
        displayName: s.displayName,
        username: s.username,
      })),
    });
  }

  const created: typeof students = [];
  for (const s of students) {
    const { error } = await db.from("profiles").insert({
      id: randomUUID(),
      email: s.email,
      password_hash: await hashPassword(s.password),
      username: s.username,
      display_name: s.displayName,
      role: "student",
      class_id,
      avatar_seed: randomUUID(),
    });
    // Skip anyone who collides rather than failing the whole class.
    if (!error) created.push(s);
  }

  return NextResponse.json({
    created: created.length,
    skipped: students.length - created.length,
    // Plaintext passwords are returned ONCE so the teacher can print slips.
    // They are hashed in the database and cannot be read back later.
    students: created,
    className: cls.name,
  });
}
