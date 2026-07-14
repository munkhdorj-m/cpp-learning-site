"use server";

import { revalidatePath } from "next/cache";

import { requireTeacher } from "@/lib/auth-helpers";
import { createServiceClient } from "@/lib/supabase/server";

export async function setReviewed(pairId: string, reviewed: boolean) {
  await requireTeacher();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("code_similarity")
    .update({ reviewed })
    .eq("id", pairId);
  if (error) return { error: error.message };
  revalidatePath("/teacher/plagiarism");
  return { ok: true as const };
}
