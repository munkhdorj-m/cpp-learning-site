import { cache } from "react";
import { headers } from "next/headers";

import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Cached current-user getter.
 *   Fast path: middleware verified the JWT and set x-user-id.
 *   Fallback:  read + verify the session cookie directly (getUser).
 */
export const getCachedSession = cache(async () => {
  try {
    const h = await headers();
    const userId = h.get("x-user-id");
    if (userId) return { id: userId };
    return await getUser();
  } catch {
    return null;
  }
});

/** Cached profile fetch. */
export const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
});
