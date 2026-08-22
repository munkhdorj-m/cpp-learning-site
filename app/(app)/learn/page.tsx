import { getLocale } from "next-intl/server";

import { LESSONS, UNITS } from "@/lib/lessons";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { LearnIndex } from "./learn-index";

export const metadata = { title: "Learn" };

// Static content — no database, so this can render without a request.

export default async function LearnPage() {
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const en = locale === "en";

  return (
    <LearnIndex
      en={en}
      units={UNITS.map((u) => ({
        id: u.id,
        title: en ? u.title_en : u.title_mn,
        blurb: en ? u.blurb_en : u.blurb_mn,
      }))}
      lessons={LESSONS.map((l, i) => ({
        slug: l.slug,
        unit: l.unit,
        n: i + 1,
        title: en ? l.title_en : l.title_mn,
        goal: en ? l.goal_en : l.goal_mn,
      }))}
    />
  );
}
