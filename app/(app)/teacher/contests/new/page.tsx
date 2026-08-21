import { getLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { ContestForm } from "../contest-form";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function NewContestPage() {
  // The layout calls this too, but a layout's redirect does not stop
  // this page rendering: React renders them together, and whatever the
  // page produced is flushed into the redirect response for anyone who
  // reads the body instead of following the Location header.
  await requireTeacher();

  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  const [classesRes, problemsRes] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name, grade")
      .order("grade", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("problems")
      .select("id, title_mn, title_en, difficulty, xp_reward")
      .order("difficulty", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);

  const classes = (classesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
  }));
  const problems = (problemsRes.data ?? []).map((p) => ({
    id: p.id,
    title: locale === "en" && p.title_en ? p.title_en : p.title_mn,
    difficulty: p.difficulty,
    xp_reward: p.xp_reward,
  }));

  return <ContestForm classes={classes} problems={problems} />;
}
