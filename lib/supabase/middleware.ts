// Session middleware: verify the JWT session cookie and expose the user id as
// the x-user-id header so getCachedSession() can use its fast path.
// Edge-safe — imports only lib/session (jose), never bcrypt or the DB.

import { NextResponse, type NextRequest } from "next/server";

import {
  verifySession,
  signSession,
  shouldRenew,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session";

const USER_HEADER = "x-user-id";
// Server components cannot see the request path. The pages that still require
// an account read this to build /login?next=… so a visitor sent away lands
// back where they were instead of on the problems list.
const PATH_HEADER = "x-pathname";

export async function updateSession(request: NextRequest) {
  // getCachedSession() takes x-user-id as proof of who is asking, so this
  // header has to be ours and nothing else. A browser is free to send any
  // header it likes, and one arriving with its own copy would be handing
  // itself an account. Strip it first, then write only what the cookie proves.
  const headers = new Headers(request.headers);
  headers.delete(USER_HEADER);
  // Same reasoning as x-user-id: a browser may send anything, so overwrite
  // rather than trust. This one is not a credential, but a forged path would
  // still steer the post-login redirect.
  headers.set(
    PATH_HEADER,
    request.nextUrl.pathname + (request.nextUrl.search || ""),
  );

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  if (session) headers.set(USER_HEADER, session.sub);

  const response = NextResponse.next({ request: { headers } });

  // /api/auth/* sets and clears the cookie itself. Touching it here too would
  // put two Set-Cookie headers for the same name on one response, and logging
  // in or out would come down to which one the browser read last.
  const ownsTheCookie = request.nextUrl.pathname.startsWith("/api/auth/");

  if (!ownsTheCookie) {
    if (session && shouldRenew(session)) {
      // Slide the idle window forward. A student who is working never falls
      // out of their session; a machine left alone does.
      const fresh = await signSession({
        sub: session.sub,
        email: session.email,
      });
      response.cookies.set(SESSION_COOKIE, fresh, SESSION_COOKIE_OPTIONS);
    } else if (token && !session) {
      // Expired or tampered with — clear it so the next request is honestly
      // anonymous instead of carrying a dead token around.
      response.cookies.set(SESSION_COOKIE, "", {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: 0,
      });
    }
  }

  if (session) {
    // Shared classroom machines: after one student logs out, the back button
    // must not paint the next student a cached page with the old name on it.
    response.headers.set("Cache-Control", "no-store, must-revalidate");
  }

  return response;
}
