import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Conversation } from "@/components/messages/conversation";
import { getCurrentProfile } from "@/lib/auth-helpers";
import { loadConversation, mayReadThread } from "@/lib/messages";

export const dynamic = "force-dynamic";

/**
 * One conversation, for whichever side is reading it.
 *
 * The page renders the first paint; from then on the conversation keeps
 * itself up to date (components/messages/conversation.tsx) so a reply appears
 * without anyone reloading.
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

  const { thread, messages } = await loadConversation(id);
  if (!thread) notFound();

  const isTeacher = profile.role === "teacher";
  // One rule, one place. A teacher who is not this thread's teacher gets the
  // same answer as a student who is not its student: it does not exist.
  if (!mayReadThread(thread, profile)) notFound();

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
          <p className="font-code text-xs text-muted-foreground">
            {isTeacher ? (
              <>
                {thread.student_name}
                {thread.class_name ? ` · ${thread.class_name}` : ""}
              </>
            ) : (
              <>
                {t("with_teacher")}: {thread.teacher_name ?? t("unassigned")}
              </>
            )}
          </p>
        </div>
        {thread.closed_at && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-signal-ok/15 px-2 py-0.5 font-code text-[11px] font-semibold text-signal-ok">
            <CheckCircle2 className="h-3 w-3" />
            {t("answered")}
          </span>
        )}
      </div>

      <Conversation
        threadId={thread.id}
        me={profile.id}
        isTeacher={isTeacher}
        initiallyClosed={!!thread.closed_at}
        initial={messages.map((m) => ({
          id: m.id,
          sender_id: m.sender_id,
          sender_name: m.sender_name,
          from_teacher: !!m.from_teacher,
          body: m.body,
          created_at: m.created_at,
          read_at: m.read_at,
          upload_id: m.upload_id ?? null,
          upload_name: m.upload_name ?? null,
          upload_mime: m.upload_mime ?? null,
          upload_bytes: m.upload_bytes ?? null,
        }))}
      />
    </div>
  );
}
