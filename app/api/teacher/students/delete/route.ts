import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/auth-helpers";

// Permanently removes a student. Everything hanging off their profile —
// submissions, badges, quest and game progress — is removed with them by the
// database's cascade rules. There is no undo, so the UI asks twice.
const schema = z.object({
  user_ids: z.array(z.string().uuid()).min(1).max(200),
});

export async function POST(request: Request) {
  if (!(await isTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { user_ids } = parsed.data;

  const db = createServiceClient();

  // Only ever delete students — never another teacher, and never yourself.
  const { data: targets } = await db
    .from("profiles")
    .select("id, role")
    .in("id", user_ids);

  const deletable = (targets ?? [])
    .filter((p: { role: string }) => p.role === "student")
    .map((p: { id: string }) => p.id);

  if (deletable.length === 0) {
    return NextResponse.json({ error: "no_students" }, { status: 400 });
  }

  const { error } = await db.from("profiles").delete().in("id", deletable);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    deleted: deletable.length,
    skipped: user_ids.length - deletable.length,
  });
}
