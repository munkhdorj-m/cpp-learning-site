import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Only run middleware on actual page routes — skip API, static files, and _next internals.
    // This avoids a Supabase call on every CSS/JS/image/API request.
    "/((?!api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|css|js|map)$).*)",
  ],
};
