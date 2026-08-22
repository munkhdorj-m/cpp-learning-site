// JWT session helpers — jose only, no bcrypt / no next/headers, so this is
// safe to import from Edge middleware. Signing/verifying the session cookie.

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "session";

/**
 * How long a session survives with no requests at all.
 *
 * The cookie is a browser-session cookie (no Max-Age below), so closing the
 * browser normally ends the session by itself. This is the backstop for the
 * case where it doesn't: Chrome's "Continue where you left off" hands session
 * cookies back after a restart, so on a shared classroom machine a forgotten
 * login could otherwise greet the next student. The window slides while a
 * student is working, so nobody is thrown out mid-problem.
 */
const IDLE_SECONDS = Math.max(
  5 * 60,
  Number(process.env.SESSION_IDLE_MINUTES || 120) * 60,
);

/**
 * Re-issue the cookie once the token is this old. Every request would work
 * too, but signing on each one is wasted effort when the window is hours wide.
 */
const RENEW_AFTER_SECONDS = 10 * 60;

/**
 * No maxAge / expires: the cookie dies with the browser. Deliberate — the
 * computers are shared, so "I closed the browser" has to mean "I logged out".
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

function secret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-insecure-secret-change-me",
  );
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
  /** Seconds since the epoch, from the token's `iat`. */
  issuedAt?: number;
}

export async function signSession(p: SessionPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ email: p.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + IDLE_SECONDS)
    .sign(secret());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      issuedAt: typeof payload.iat === "number" ? payload.iat : undefined,
    };
  } catch {
    return null;
  }
}

/** True once a live session is old enough to be worth sliding forward. */
export function shouldRenew(p: SessionPayload): boolean {
  if (!p.issuedAt) return true; // no `iat` to judge by — renew and move on
  return Math.floor(Date.now() / 1000) - p.issuedAt >= RENEW_AFTER_SECONDS;
}

export const SESSION_IDLE_SECONDS = IDLE_SECONDS;
