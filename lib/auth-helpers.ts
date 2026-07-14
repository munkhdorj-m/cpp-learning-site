import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export async function getCurrentProfile(): Promise<Tables<"profiles"> | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

export async function requireTeacher() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/problems");
  return profile;
}
