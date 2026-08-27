"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Check, Loader2, Paperclip, Send, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  FilePicker,
  type PickedFile,
} from "@/components/assignments/file-picker";
import { cn } from "@/lib/utils";
import {
  markThreadRead,
  sendMessage,
  setThreadClosed,
} from "@/app/actions/messages";

/**
 * A conversation that keeps up on its own.
 *
 * The thread used to render on the server and stay exactly as it was until you
 * navigated — a reply arrived and the other person simply never saw it. This
 * polls instead.
 *
 * The cadence is adaptive rather than fixed. A conversation people are
 * actually having refreshes every 2 seconds, which reads as instant; one left
 * open in a background tab backs off to 30 and then stops entirely while the
 * tab is hidden. A fixed fast interval would have forty idle tabs hammering a
 * shared-hosting box all afternoon for nothing.
 */

const ACTIVE_MS = 2_000;
const SETTLED_MS = 6_000;
const IDLE_MS = 30_000;
/** Something happened this recently → poll fast. */
const ACTIVE_WINDOW_MS = 60_000;
/** Nothing at all for this long → back right off. */
const IDLE_AFTER_MS = 5 * 60_000;

export interface Msg {
  id: string;
  sender_id: string;
  sender_name: string;
  from_teacher: boolean;
  body: string;
  created_at: string;
  read_at: string | null;
  upload_id?: string | null;
  upload_name?: string | null;
  upload_mime?: string | null;
  upload_bytes?: number | null;
}

/** A message this browser has sent but the server has not confirmed. */
const isPending = (m: Msg) => m.id.startsWith("pending-");

export function Conversation({
  threadId,
  me,
  isTeacher,
  initial,
  initiallyClosed,
}: {
  threadId: string;
  me: string;
  isTeacher: boolean;
  initial: Msg[];
  initiallyClosed: boolean;
}) {
  const t = useTranslations("messages");
  const locale = useLocale();

  const [messages, setMessages] = useState<Msg[]>(initial);
  const [closed, setClosed] = useState(initiallyClosed);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<PickedFile | null>(null);

  const lastChangeAt = useRef(Date.now());
  const bottom = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const wasNearBottom = useRef(true);
  const count = useRef(initial.length);

  /**
   * Jump to the newest message — but only when the reader is already there.
   *
   * Scrolling someone to the bottom while they are reading back through the
   * conversation is the single most irritating thing a chat can do, and it is
   * what happens if you always scroll on every new message.
   */
  const scrollToEnd = useCallback((smooth: boolean) => {
    bottom.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "nearest",
    });
  }, []);

  const nearBottom = useCallback(() => {
    const el = scroller.current;
    if (!el) return true;
    // Within a screenful of the end counts as "still at the bottom".
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const pull = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${threadId}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data?.messages)) return;

      wasNearBottom.current = nearBottom();
      setClosed(!!data.closed);
      setMessages((prev) => {
        const server = data.messages as Msg[];
        // A message being sent right now is not on the server yet. Replacing
        // the list wholesale would take it off the screen a moment after the
        // sender watched it appear — so it is carried across every poll until
        // the server's copy comes back and submit() drops it.
        const pending = prev.filter((m) => isPending(m));
        const prevServer = prev.filter((m) => !isPending(m));

        // Only re-render when something actually changed, or every tick would
        // reset the DOM under the reader's cursor.
        const unchanged =
          prevServer.length === server.length &&
          prevServer[prevServer.length - 1]?.id === server[server.length - 1]?.id;
        if (unchanged) return prev;

        lastChangeAt.current = Date.now();
        return [...server, ...pending];
      });
    } catch {
      // Offline, or the server restarting. The next tick tries again.
    }
  }, [threadId, nearBottom]);

  // ---- the polling loop -------------------------------------------------
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const nextDelay = () => {
      const quiet = Date.now() - lastChangeAt.current;
      if (quiet > IDLE_AFTER_MS) return IDLE_MS;
      if (quiet > ACTIVE_WINDOW_MS) return SETTLED_MS;
      return ACTIVE_MS;
    };

    const tick = async () => {
      if (stopped) return;
      // A hidden tab is nobody reading. Wait to be looked at again.
      if (document.visibilityState === "visible") await pull();
      if (stopped) return;
      timer = setTimeout(tick, nextDelay());
    };

    timer = setTimeout(tick, ACTIVE_MS);

    // Coming back to the tab is the moment the thread is most likely stale.
    const onVisible = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [pull]);

  // ---- keep the view at the newest message ------------------------------
  useEffect(() => {
    const grew = messages.length > count.current;
    count.current = messages.length;
    // First paint always lands at the newest message; after that, only follow
    // along if the reader had not scrolled up to read something.
    if (!grew || wasNearBottom.current) scrollToEnd(grew);
  }, [messages, scrollToEnd]);

  // ---- mark what the other side wrote as read ---------------------------
  const unreadKey = messages
    .filter((m) => !m.read_at && m.from_teacher !== isTeacher)
    .map((m) => m.id)
    .join(",");
  useEffect(() => {
    if (!unreadKey) return;
    void markThreadRead(threadId);
  }, [threadId, unreadKey]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if ((!text && !file) || sending) return;

    setSending(true);
    // Held so a failure can put it back with the text.
    const chosen = file;
    // Shown immediately, before the round trip. Messenger-fast means the
    // message is on screen when you press send, not a moment later.
    const pending: Msg = {
      id: `pending-${Date.now()}`,
      sender_id: me,
      sender_name: "",
      from_teacher: isTeacher,
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
      upload_id: file?.id ?? null,
      upload_name: file?.name ?? null,
      upload_mime: file?.mime ?? null,
      upload_bytes: file?.bytes ?? null,
    };
    wasNearBottom.current = true;
    setMessages((prev) => [...prev, pending]);
    setBody("");
    setFile(null);
    lastChangeAt.current = Date.now();

    const res = await sendMessage({ threadId, body: text, uploadId: chosen?.id });
    setSending(false);
    if (res?.error) {
      // Put it back rather than losing what they typed.
      setMessages((prev) => prev.filter((m) => m.id !== pending.id));
      setBody(text);
      setFile(chosen);
      toast.error(res.error);
      return;
    }
    // Drop the optimistic copy; the server's version arrives with this pull.
    setMessages((prev) => prev.filter((m) => m.id !== pending.id));
    await pull();
  };

  const toggleClosed = async () => {
    const res = await setThreadClosed(threadId, !closed);
    if (res?.error) toast.error(res.error);
    else {
      setClosed(!closed);
      lastChangeAt.current = Date.now();
    }
  };

  return (
    <div className="space-y-3">
      {/* A pane that scrolls, not a page that grows. Scroll up for history,
          the composer stays put, and the newest message is where you left the
          view rather than somewhere below the fold. */}
      <div
        ref={scroller}
        className="max-h-[min(60vh,32rem)] space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3"
      >
        {messages.map((m) => {
          const mine = m.sender_id === me;
          const optimistic = isPending(m);
          return (
            <div
              key={m.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <Card
                className={cn(
                  "max-w-[85%] transition-opacity",
                  mine ? "border-primary/40 bg-primary/[0.07]" : "",
                  optimistic && "opacity-60",
                )}
              >
                <CardContent className="p-3">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-xs font-semibold">
                      {mine ? t("you") : m.sender_name}
                    </span>
                    {m.from_teacher && !mine && (
                      <span className="font-code text-[10px] uppercase tracking-wider text-primary">
                        {t("teacher")}
                      </span>
                    )}
                    <span className="font-code text-[10px] text-muted-foreground">
                      {optimistic ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        new Date(m.created_at).toLocaleString(locale, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      )}
                    </span>
                  </div>
                  {m.upload_id && <Attachment m={m} optimistic={optimistic} />}
                  {m.body && (
                    /* Plain text child: React escapes it, and nothing here
                       interprets markdown or HTML. */
                    <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      {closed ? (
        <div className="space-y-2">
          <p className="rounded border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            {t("closed_note")}
          </p>
          {isTeacher && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={toggleClosed}>
                <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                {t("reopen")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter is a new line — what every chat does.
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit(e as unknown as React.FormEvent);
              }
            }}
            placeholder={t("reply_placeholder")}
            aria-label={t("reply")}
            maxLength={4000}
            rows={3}
          />
          {/* Same uploader the assignment hand-ins use, so the size limit,
              the allowed types and the download route are all one thing. */}
          <FilePicker value={file} onChange={setFile} label={t("attach")} />

          <div className="flex items-center justify-end gap-2">
            {isTeacher && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleClosed}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {t("mark_answered")}
              </Button>
            )}
            <Button type="submit" disabled={sending || (!body.trim() && !file)}>
              <Send className="mr-1.5 h-4 w-4" />
              {sending ? "…" : t("send")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/**
 * A picture shows; anything else is a link.
 *
 * The file is served through /api/uploads/[id], which checks who is asking —
 * uploads are never public files on disk. An image is worth rendering inline
 * because the whole point of sending one is that the other person sees it
 * without a click.
 */
function Attachment({ m, optimistic }: { m: Msg; optimistic: boolean }) {
  const isImage = (m.upload_mime ?? "").startsWith("image/");
  const href = `/api/uploads/${m.upload_id}`;

  if (optimistic) {
    return (
      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {m.upload_name}
      </div>
    );
  }

  if (isImage) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="mb-1 block">
        {/* eslint-disable-next-line @next/next/no-img-element -- an
            authenticated upload route, not a static asset the optimiser can
            fetch and cache. */}
        <img
          src={href}
          alt={m.upload_name ?? ""}
          className="max-h-64 w-auto max-w-full rounded border border-border"
          loading="lazy"
        />
      </a>
    );
  }

  return (
    <a
      href={href}
      className="mb-1 flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      <Paperclip className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{m.upload_name}</span>
    </a>
  );
}
