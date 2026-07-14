"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTeacher } from "@/lib/auth-helpers";
import { generateInviteCode } from "@/lib/invite-codes";
import { createServiceClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(1).max(20),
  grade: z.coerce.number().int().refine((n) => n === 7 || n === 8),
});

export async function createClass(formData: FormData) {
  const teacher = await requireTeacher();
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    grade: formData.get("grade"),
  });
  if (!parsed.success) {
    return { error: "invalid_input" as const };
  }

  const supabase = createServiceClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode(parsed.data.name);
    const { error } = await supabase.from("classes").insert({
      name: parsed.data.name,
      grade: parsed.data.grade as 7 | 8,
      invite_code: code,
      teacher_id: teacher.id,
    });
    if (!error) {
      revalidatePath("/teacher/classes");
      revalidatePath("/teacher");
      return { ok: true as const };
    }
    if (error.code !== "23505") {
      return { error: error.message };
    }
    // 23505 = unique violation; retry with a new random suffix
  }
  return { error: "code_collision" as const };
}

export async function updateClass(
  classId: string,
  input: { name: string; grade: 7 | 8 },
) {
  await requireTeacher();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: "invalid_input" as const };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("classes")
    .update({ name: parsed.data.name, grade: parsed.data.grade as 7 | 8 })
    .eq("id", classId);
  if (error) return { error: error.message };

  revalidatePath("/teacher/classes");
  revalidatePath(`/teacher/classes/${classId}`);
  return { ok: true as const };
}

export async function deleteClass(classId: string) {
  await requireTeacher();
  const supabase = createServiceClient();
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) return { error: error.message };

  revalidatePath("/teacher/classes");
  revalidatePath("/teacher");
  return { ok: true as const };
}

export async function regenerateInviteCode(classId: string) {
  const teacher = await requireTeacher();
  const supabase = createServiceClient();

  const { data: cls } = await supabase
    .from("classes")
    .select("name, teacher_id")
    .eq("id", classId)
    .single();
  if (!cls) return { error: "not_found" as const };
  if (cls.teacher_id && cls.teacher_id !== teacher.id) {
    return { error: "forbidden" as const };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode(cls.name);
    const { error } = await supabase
      .from("classes")
      .update({ invite_code: code })
      .eq("id", classId);
    if (!error) {
      revalidatePath("/teacher/classes");
      return { ok: true as const, code };
    }
    if (error.code !== "23505") return { error: error.message };
  }
  return { error: "code_collision" as const };
}
