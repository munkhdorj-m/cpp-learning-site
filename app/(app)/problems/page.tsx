import { cache } from "react";
import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { ProblemsList } from "./problems-list";

// Problems rarely change — cache at Vercel edge for 1 hour.
// Solved status is fetched client-side to keep the page shareable across users.
export const revalidate = 3600;

// Also deduplicate within a single request via React cache.
// Without this, if layout + page both call Supabase, each call creates
// a new client. cache() ensures one query per request.
const getProblems = cache(async () => {
  const supabase = await createClient();
  const { data: problemsRaw } = await supabase
    .from("problems")
    .select("id, slug, title_mn, title_en, difficulty, xp_reward, tags")
    .eq("is_public", true)
    .order("difficulty", { ascending: true })
    .order("xp_reward", { ascending: true })
    .order("created_at", { ascending: true });
  return problemsRaw ?? [];
});

export default async function ProblemsPage() {
  const t = await getTranslations("problems");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;

  const problemsRaw = await getProblems();

  const problems = problemsRaw.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: locale === "en" && p.title_en ? p.title_en : p.title_mn,
    difficulty: p.difficulty,
    xp_reward: p.xp_reward,
    tags: p.tags,
    // All start as unsolved — the client hydrates real status
    solved: false,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <ProblemsList items={problems} />
    </div>
  );
}
