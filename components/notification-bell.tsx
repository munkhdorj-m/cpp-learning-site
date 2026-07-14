"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Lazy-load notifications only when the bell is first clicked
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadNotifications = () => {
    if (hasLoaded) return;
    setHasLoaded(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", notification_id: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          loadNotifications();
          setOpen(!open);
        }}
        className="relative p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border bg-popover shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-3 py-2.5 border-b last:border-0 transition-colors",
                    !n.read && "bg-violet-50/50 dark:bg-violet-950/20",
                  )}
                >
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className="block"
                    >
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.body && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {n.body}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </Link>
                  ) : (
                    <div>
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.body && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {n.body}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
