import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/get-session";
import type { Tables } from "@/types/database";

// Cached per request: the teacher layout and the teacher page both guard,
// and that should cost one query, not two.
export const getCurrentProfile = cache(async (): Promise<Tables<"profiles"> | null> => {
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
});

/**
 * Guard a page that genuinely needs an account.
 *
 * Most of the site is readable signed out — lessons, problems, the syllabus,
 * the games. This is for the pages that are either meaningless without an
 * account ("your progress", "your assignments") or that would show one
 * student's data to a stranger (the leaderboard, a contest roster).
 *
 * It used to be a single redirect in app/(app)/layout.tsx covering everything
 * below it. Calling it per page is more typing but it is greppable: the answer
 * to "why does this page need a login?" is a line in that page rather than an
 * invisible property of the folder it happens to sit in.
 */
export async function requireAuth() {
  const user = await getCachedSession();
  if (user) return user;

  // x-pathname is set by lib/supabase/middleware.ts.
  const h = await headers();
  const here = h.get("x-pathname");
  redirect(here ? `/login?next=${encodeURIComponent(here)}` : "/login");
}

export async function requireTeacher() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "teacher") redirect("/problems");
  return profile;
}

/**
 * Role check for API routes (returns a boolean instead of redirecting).
 * Needed because Postgres RLS used to reject non-teacher writes at the DB
 * layer; with MySQL that enforcement has to happen here.
 */
export async function isTeacher(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "teacher";
}
