// Session middleware: verify the JWT session cookie and expose the user id as
// the x-user-id header so getCachedSession() can use its fast path.
// Edge-safe — imports only lib/session (jose), never bcrypt or the DB.

import { NextResponse, type NextRequest } from "next/server";

import { verifySession, SESSION_COOKIE } from "@/lib/session";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    const payload = await verifySession(token);
    if (payload?.sub) {
      response.headers.set("x-user-id", payload.sub);
    }
  }

  return response;
}
