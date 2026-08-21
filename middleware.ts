import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Everything but static assets and Next internals. API routes are included
    // deliberately: they read the same x-user-id header, so they need the same
    // header stripped, and a student who is coding rather than clicking around
    // keeps their session alive through them.
    "/((?!_next|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|css|js|map)$).*)",
  ],
};
