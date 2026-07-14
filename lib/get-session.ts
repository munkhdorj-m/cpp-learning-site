import { cache } from "react";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

/**
 * Cached session getter.
 *
 * Fast path: Middleware verifies the JWT and sets x-user-id header.
 *   getCachedSession() reads that header - no extra Supabase round-trip.
 *
 * Slow path (fallback): If the header is missing (e.g. direct API call
 *   without middleware), we call supabase.auth.getUser().
 *
 * React cache() deduplicates - only one lookup per request.
 */
export const getCachedSession = cache(async () => {
  try {
    const h = await headers();
    const userId = h.get("x-user-id");

    if (userId) {
      return { id: userId } as Awaited<
        ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>
      >["data"]["user"];
    }

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
 * Cached profile fetch.
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
