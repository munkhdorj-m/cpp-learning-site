"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Send, Check, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  sendMessage,
  markThreadRead,
  setThreadClosed,
} from "@/app/actions/messages";

/**
 * The reply box at the foot of a conversation.
 *
 * It also does the "mark as read" on mount. That has to happen from the client
 * — a server component cannot write during render, and marking read is a write
 * caused by looking at the page rather than by the request itself.
 */
export function ReplyBox({
  threadId,
  closed,
  isTeacher,
  hasUnread,
}: {
  threadId: string;
  closed: boolean;
  isTeacher: boolean;
  hasUnread: boolean;
}) {
  const t = useTranslations("messages");
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!hasUnread) return;
    // Fire and forget: the badge is refreshed on the next navigation, and a
    // failure here must not stop the student reading the reply.
    void markThreadRead(threadId).then(() => router.refresh());
  }, [threadId, hasUnread, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await sendMessage({ threadId, body });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  const toggleClosed = () =>
    start(async () => {
      const res = await setThreadClosed(threadId, !closed);
      if (res?.error) toast.error(res.error);
      else router.refresh();
    });

  return (
    <div className="space-y-2">
      {closed ? (
        <p className="rounded border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          {t("closed_note")}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("reply_placeholder")}
            aria-label={t("reply")}
            maxLength={4000}
            rows={3}
            required
          />
          <div className="flex items-center justify-end gap-2">
            {isTeacher && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={toggleClosed}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {t("mark_answered")}
              </Button>
            )}
            <Button type="submit" disabled={pending || !body.trim()}>
              <Send className="mr-1.5 h-4 w-4" />
              {pending ? "…" : t("send")}
            </Button>
          </div>
        </form>
      )}

      {closed && isTeacher && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" disabled={pending} onClick={toggleClosed}>
            <Undo2 className="mr-1.5 h-3.5 w-3.5" />
            {t("reopen")}
          </Button>
        </div>
      )}
    </div>
  );
}
