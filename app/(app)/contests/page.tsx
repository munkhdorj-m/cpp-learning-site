import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Trophy, Calendar } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function ContestsListPage() {
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  // RLS handles visibility — students only see open or own-class contests.
  const { data: contests } = await supabase
    .from("contests")
    .select("id, title, description, start_at, end_at, class_id")
    .order("start_at", { ascending: false });

  const now = Date.now();
  const live: typeof contests = [];
  const upcoming: typeof contests = [];
  const past: typeof contests = [];
  for (const c of contests ?? []) {
    const s = new Date(c.start_at).getTime();
    const e = new Date(c.end_at).getTime();
    if (now < s) upcoming!.push(c);
    else if (now > e) past!.push(c);
    else live!.push(c);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Тэмцээн</h1>

      <Section title="Live" contests={live} locale={locale} liveAccent />
      <Section title="Upcoming" contests={upcoming} locale={locale} />
      <Section title="Past" contests={past} locale={locale} muted />

      {live.length === 0 && upcoming.length === 0 && past.length === 0 && (
        <Card>
          <p className="text-center text-muted-foreground py-12">No contests</p>
        </Card>
      )}
    </div>
  );
}

interface ContestRow {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  class_id: string | null;
}

function Section({
  title,
  contests,
  locale,
  liveAccent,
  muted,
}: {
  title: string;
  contests: ContestRow[] | null;
  locale: string;
  liveAccent?: boolean;
  muted?: boolean;
}) {
  if (!contests || contests.length === 0) return null;
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-2">
        {contests.map((c) => (
          <Link key={c.id} href={`/contests/${c.id}`}>
            <Card
              className={`hover:border-violet-300 dark:hover:border-violet-700 transition-colors ${
                liveAccent
                  ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/15"
                  : muted
                    ? "opacity-70"
                    : ""
              }`}
            >
              <div className="p-4 flex items-center gap-3">
                <Trophy
                  className={`h-5 w-5 shrink-0 ${
                    liveAccent ? "text-emerald-600" : "text-amber-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{c.title}</div>
                  {c.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {c.description}
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5 shrink-0">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(c.start_at).toLocaleString(locale, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
