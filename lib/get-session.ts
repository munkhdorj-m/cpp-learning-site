import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Cached session getter — calls supabase.auth.getUser() EXACTLY ONCE per request
 * (via React cache), no matter how many components call getCachedSession().
 *
 * Without cache(): layout + nav + page would each call getUser() independently,
 * causing 3-4 network round-trips to Tokyo per navigation.
 *
 * We use getUser() (not getSession()) because Supabase explicitly warns that
 * getSession() returns unverified user data from cookies. getUser() verifies
 * the JWT against Supabase Auth — one secure call per request is the right
 * trade-off.
 */
export const getCachedSession = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});

/**
 * Cached profile fetch — deduplicates profile queries across
 * components within a single request.
 */
export const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
});
