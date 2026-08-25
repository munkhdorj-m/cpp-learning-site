"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Where a logged-out student gets sent when they try to DO something.
 *
 * The site is readable without an account: a visitor can browse lessons,
 * problems and the leaderboard. Only actions need a session — submitting a
 * solution, saving IDE work, answering a quest, marking a lesson read.
 *
 * Two mechanisms, deliberately:
 *
 *  1. `signedIn` props let a page label the button honestly before it is
 *     pressed ("Log in to submit" rather than a button that fails).
 *  2. This hook catches the 401 anyway. That is the one that actually has to
 *     be right, because it also covers a session that expired while the tab
 *     was open — where the page was rendered signed-in and the button lies.
 *
 * Every mutating API route already returns 401 for an anonymous caller, so
 * nothing here is a security boundary; it is only how the refusal is shown.
 */

/** Where a student lands after logging in with no particular destination. */
export const AFTER_LOGIN = "/problems";

/**
 * Narrow an untrusted `next` value to a same-site path.
 *
 * Both the link out and the redirect back go through this. Without it, a link
 * to /login?next=https://evil.example would send a student who has just typed
 * their password straight off the site — a textbook open redirect, and a
 * convincing one because the login page really was ours.
 *
 * Rejected: anything not starting with "/", protocol-relative "//host", and
 * backslash variants that some browsers normalise to slashes.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next) return AFTER_LOGIN;
  const v = next.trim();
  if (!v.startsWith("/")) return AFTER_LOGIN;
  if (v.startsWith("//") || v.startsWith("/\\")) return AFTER_LOGIN;
  if (v.startsWith("/login")) return AFTER_LOGIN; // no bouncing back to itself
  return v;
}

/** Build the login URL that returns to `path` afterwards. */
export function loginHref(path: string): string {
  return `/login?next=${encodeURIComponent(safeNext(path))}`;
}

export function useAuthGate() {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Returns true when the response was a 401 and the student has been sent to
   * the login page — the caller should stop and show nothing else.
   */
  const handleUnauthorized = useCallback(
    (res: Response): boolean => {
      if (res.status !== 401) return false;
      router.push(loginHref(pathname));
      return true;
    },
    [router, pathname],
  );

  /** Send them to log in now, keeping their place. */
  const goToLogin = useCallback(() => {
    router.push(loginHref(pathname));
  }, [router, pathname]);

  return { handleUnauthorized, goToLogin };
}
