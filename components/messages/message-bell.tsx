"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

/**
 * How often to ask.
 *
 * Faster than it was: a minute meant a student could be mid-conversation and
 * still see a stale badge. It only fires while the tab is visible, and it is
 * one indexed COUNT, so twenty seconds is cheap even with a class online.
 */
const POLL_MS = 20_000;

/**
 * Unread-message count in the header.
 *
 * Polls, because there is no socket to listen on: the app runs behind
 * Phusion Passenger, which hands each request to the Next handler and offers
 * nowhere to hold a connection open. One indexed COUNT a tick, and it stops
 * while the tab is hidden — thirty students with a tab open all afternoon
 * should not be a background load on the box.
 */
export function MessageBell({
  href,
  label,
  initialCount,
}: {
  href: string;
  label: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/messages/unread", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (typeof data?.count === "number") setCount(data.count);
      } catch {
        // Offline, or the server is restarting. Leave the last known count.
      }
    };

    void check();
    const id = setInterval(check, POLL_MS);
    // Coming back to the tab is the moment the number is most likely stale.
    document.addEventListener("visibilitychange", check);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
    // Re-checks on navigation, which is when a thread was probably just read.
  }, [pathname]);

  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count})` : label}
      title={label}
      className="relative inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
    >
      <MessageSquare className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-primary px-1 text-center font-code text-[10px] font-bold leading-4 text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
