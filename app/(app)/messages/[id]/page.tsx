import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ReplyBox } from "@/components/messages/reply-box";
import { getCurrentProfile } from "@/lib/auth-helpers";
import { loadConversation, isUnreadFor } from "@/lib/messages";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * One conversation, for whichever side is reading it.
 *
 * Both roles use this page. A student may only open their own thread; a
 * teacher may open any, which is how every other teacher page in this app
 * scopes access.
 */
export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/messages/${id}`)}`);

  const t = await getTranslations("messages");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;

  const { thread, messages } = await loadConversation(id);
  if (!thread) notFound();

  const isTeacher = profile.role === "teacher";
  if (!isTeacher && thread.student_id !== profile.id) notFound();

  const hasUnread = messages.some((m) => isUnreadFor(m, isTeacher));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href={isTeacher ? "/teacher/messages" : "/messages"}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t("back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{thread.subject}</h1>
          {isTeacher && (
            <p className="font-code text-xs text-muted-foreground">
              {thread.student_name}
              {thread.class_name ? ` · ${thread.class_name}` : ""}
            </p>
          )}
        </div>
        {thread.closed_at && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-signal-ok/15 px-2 py-0.5 font-code text-[11px] font-semibold text-signal-ok">
            <CheckCircle2 className="h-3 w-3" />
            {t("answered")}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {messages.map((m) => {
          // "Mine" decides the side of the page, not the colour of the role:
          // a teacher reading their own reply should see it where they expect
          // their own words to be.
          const mine = m.sender_id === profile.id;
          return (
            <div
              key={m.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <Card
                className={cn(
                  "max-w-[85%]",
                  mine ? "border-primary/40 bg-primary/[0.07]" : "",
                )}
              >
                <CardContent className="p-3">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-xs font-semibold">
                      {mine ? t("you") : m.sender_name}
                    </span>
                    {!!m.from_teacher && !mine && (
                      <span className="font-code text-[10px] uppercase tracking-wider text-primary">
                        {t("teacher")}
                      </span>
                    )}
                    <span className="font-code text-[10px] text-muted-foreground">
                      {new Date(m.created_at).toLocaleString(locale, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {/* Plain text child: React escapes it, and nothing here
                      interprets markdown or HTML. Same treatment as a
                      student's note on a hand-in. */}
                  <p className="whitespace-pre-wrap text-sm">{m.body}</p>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <ReplyBox
        threadId={thread.id}
        closed={!!thread.closed_at}
        isTeacher={isTeacher}
        hasUnread={hasUnread}
      />
    </div>
  );
}
