import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { MessageSquare, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { requireTeacher } from "@/lib/auth-helpers";
import { listThreads } from "@/lib/messages";
import { hasTable } from "@/lib/mysql/has-table";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Every question students have asked.
 *
 * Unanswered first, because the list is a queue: a teacher opens this page to
 * find what is waiting on them, not to browse.
 */
export default async function TeacherMessagesPage() {
  // The layout guards too, but a layout redirect does not stop this page
  // rendering — see the note on the teacher dashboard.
  await requireTeacher();

  const t = await getTranslations("messages");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;

  const ready = await hasTable("message_threads");
  const threads = ready ? await listThreads(null) : [];

  const waiting = threads.filter((th) => th.unread > 0 && !th.closed_at);
  const open = threads.filter((th) => th.unread === 0 && !th.closed_at);
  const answered = threads.filter((th) => th.closed_at);

  const groups: { key: string; list: typeof threads }[] = [
    { key: "needs_reply", list: waiting },
    { key: "open", list: open },
    { key: "answered", list: answered },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("teacher_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("teacher_subtitle")}</p>
      </div>

      {!ready ? (
        <Card>
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("not_ready")}
          </p>
        </Card>
      ) : threads.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("teacher_none")}
          </p>
        </Card>
      ) : (
        groups
          .filter((g) => g.list.length > 0)
          .map((g) => (
            <div key={g.key} className="space-y-1.5">
              <div className="hud-label flex items-center gap-2 pt-1">
                {t(`group_${g.key}`)}
                <span className="font-code text-[10px] font-normal opacity-60 tabular-nums">
                  {g.list.length}
                </span>
              </div>
              {g.list.map((th) => (
                <Link key={th.id} href={`/messages/${th.id}`}>
                  <Card
                    className={cn(
                      "hud-hover py-0",
                      th.unread > 0 && !th.closed_at && "border-primary/50",
                      th.closed_at && "opacity-70",
                    )}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <span className="shrink-0">
                        {th.closed_at ? (
                          <CheckCircle2 className="h-4 w-4 text-signal-ok" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">
                          {th.subject}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {th.student_name}
                          {th.class_name ? ` · ${th.class_name}` : ""} ·{" "}
                          {th.preview}
                        </div>
                      </div>
                      {th.unread > 0 && !th.closed_at && (
                        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 font-code text-[11px] font-bold text-primary-foreground">
                          {th.unread}
                        </span>
                      )}
                      <span className="shrink-0 font-code text-[11px] text-muted-foreground">
                        {new Date(th.last_message_at).toLocaleDateString(
                          locale,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ))
      )}
    </div>
  );
}
