// Server-side auth: password hashing (bcrypt) + reading/writing the session
// cookie. Node runtime only (used from route handlers & server components),
// NOT from Edge middleware — middleware uses lib/session directly.

import { cache } from "react";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import {
  signSession,
  verifySession,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/session";

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(
  pw: string,
  hash: string,
): Promise<boolean> {
  if (!hash) return false; // imported accounts start with a blank hash
  return bcrypt.compare(pw, hash);
}

/** Current logged-in user from the session cookie, or null. */
export const getUser = cache(async (): Promise<{ id: string; email: string } | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const p = await verifySession(token);
  return p ? { id: p.sub, email: p.email } : null;
});

/** Set the session cookie. Only valid inside a route handler / server action. */
export async function setSession(userId: string, email: string): Promise<void> {
  const token = await signSession({ sub: userId, email });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  // Overwrite before deleting: the attributes have to match the ones the
  // cookie was set with, or the browser keeps its own copy and the student
  // stays logged in.
  store.set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  store.delete(SESSION_COOKIE);
}
