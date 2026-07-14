import { getTranslations, getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/get-session";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { ProblemsList } from "./problems-list";

// Revalidate every 2 minutes — reduces Tokyo round-trips on every navigation
export const revalidate = 120;

export default async function ProblemsPage() {
  const t = await getTranslations("problems");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  const user = await getCachedSession();

  // Fetch problems and solved status in parallel
  const [{ data: problemsRaw }, { data: solvedRaw }] = await Promise.all([
    supabase
      .from("problems")
      .select("id, slug, title_mn, title_en, difficulty, xp_reward, tags")
      .eq("is_public", true)
      .order("difficulty", { ascending: true })
      .order("xp_reward", { ascending: true })
      .order("created_at", { ascending: true }),
    user
      ? supabase
          .from("submissions")
          .select("problem_id")
          .eq("user_id", user.id)
          .eq("verdict", "accepted")
      : Promise.resolve({ data: [] }),
  ]);

  const solvedSet = new Set((solvedRaw ?? []).map((s) => s.problem_id));

  const problems = (problemsRaw ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: locale === "en" && p.title_en ? p.title_en : p.title_mn,
    difficulty: p.difficulty,
    xp_reward: p.xp_reward,
    tags: p.tags,
    solved: solvedSet.has(p.id),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <ProblemsList items={problems} />
    </div>
  );
}
