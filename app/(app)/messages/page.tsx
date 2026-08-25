import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { MessageSquare, CheckCircle2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { AskForm } from "@/components/messages/ask-form";
import { getCurrentProfile } from "@/lib/auth-helpers";
import { listThreads } from "@/lib/messages";
import { hasTable } from "@/lib/mysql/has-table";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** A student's questions to their teacher. */
export default async function MessagesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=%2Fmessages");
  // Teachers have their own list, with every student's threads on it.
  if (profile.role === "teacher") redirect("/teacher/messages");

  const t = await getTranslations("messages");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;

  const ready = await hasTable("message_threads");
  const threads = ready ? await listThreads(profile.id) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="space-y-1">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">{"//"}</span>
          MESSAGES
        </div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {!ready ? (
        <Card>
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("not_ready")}
          </p>
        </Card>
      ) : (
        <>
          <AskForm />

          {threads.length === 0 ? (
            <Card>
              <p className="py-10 text-center text-sm text-muted-foreground">
                {t("none")}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("your_questions")}
              </h2>
              {threads.map((th) => (
                <Link key={th.id} href={`/messages/${th.id}`}>
                  <Card
                    className={cn(
                      "hud-hover",
                      th.unread > 0 && "border-primary/50",
                    )}
                  >
                    <div className="flex items-center gap-3 p-3.5">
                      <span className="shrink-0">
                        {th.closed_at ? (
                          <CheckCircle2 className="h-5 w-5 text-signal-ok" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">
                          {th.subject}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {th.preview}
                        </div>
                      </div>
                      {th.unread > 0 && (
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
          )}
        </>
      )}
    </div>
  );
}
