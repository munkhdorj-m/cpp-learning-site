import { getLocale, getTranslations } from "next-intl/server";
import { Sparkles, Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import {
  DAILY_QUEST_COUNT,
  pickDailyQuests,
  todayKey,
} from "@/lib/quest-selection";

import { QuestsBoard } from "./quests-board";

export const dynamic = "force-dynamic";

export default async function QuestsPage() {
  const t = await getTranslations();
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Note: NO correct_answer / explanation selected — those are server-side only.
  const { data: allQuests } = await supabase
    .from("quests")
    .select(
      "id, slug, type, prompt_mn, prompt_en, code_snippet, choices_mn, choices_en, difficulty, xp_reward",
    )
    .eq("is_active", true);

  const today = todayKey();
  const todaysQuests = pickDailyQuests(
    allQuests ?? [],
    user.id,
    today,
    DAILY_QUEST_COUNT,
  );

  const questIds = todaysQuests.map((q) => q.id);
  const { data: attempts } = questIds.length
    ? await supabase
        .from("user_quest_attempts")
        .select("quest_id, was_correct, xp_awarded, user_answer")
        .eq("user_id", user.id)
        .in("quest_id", questIds)
    : { data: [] as { quest_id: string; was_correct: boolean; xp_awarded: number; user_answer: string | null }[] };

  const attemptMap = new Map(
    (attempts ?? []).map((a) => [a.quest_id, a] as const),
  );

  const items = todaysQuests.map((q) => {
    const a = attemptMap.get(q.id);
    return {
      id: q.id,
      type: q.type,
      prompt:
        locale === "en" && q.prompt_en ? q.prompt_en : q.prompt_mn,
      code_snippet: q.code_snippet,
      choices:
        (locale === "en" ? q.choices_en : q.choices_mn) ??
        q.choices_mn ??
        null,
      difficulty: q.difficulty,
      xp_reward: q.xp_reward,
      attempt: a
        ? {
            was_correct: a.was_correct,
            xp_awarded: a.xp_awarded,
            user_answer: a.user_answer,
          }
        : null,
    };
  });

  const completed = items.filter((i) => !!i.attempt).length;
  const earned = items.reduce(
    (sum, i) => sum + (i.attempt?.xp_awarded ?? 0),
    0,
  );
  const allCorrect = completed === items.length && items.every((i) => i.attempt?.was_correct);

  const labels = {
    title: t("quests.title"),
    subtitle: t("quests.subtitle"),
    progress: t("quests.progress"),
    earned_today: t("quests.earned_today"),
    show_answer: t("quests.show_answer"),
    submit: t("common.submit"),
    correct: t("quests.correct"),
    wrong: t("quests.wrong"),
    your_answer: t("quests.your_answer"),
    correct_answer: t("quests.correct_answer"),
    placeholder_output: t("quests.placeholder_output"),
    no_quests: t("quests.no_quests"),
    perfect_day: t("quests.perfect_day"),
    type_predict_output: t("quests.type_predict_output"),
    type_bug_hunt: t("quests.type_bug_hunt"),
    type_multiple_choice: t("quests.type_multiple_choice"),
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 shrink-0">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="font-semibold">{labels.progress}</span>
              <span className="text-muted-foreground tabular-nums">
                {completed} / {items.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all ${
                  allCorrect
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                }`}
                style={{
                  width: `${items.length > 0 ? (completed / items.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold tabular-nums shrink-0">
            <Sparkles className="h-4 w-4" />
            +{earned} {labels.earned_today}
          </div>
        </CardContent>
      </Card>

      {allCorrect && items.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/15">
          <CardContent className="p-4 flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">{labels.perfect_day}</span>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">
            {labels.no_quests}
          </p>
        </Card>
      ) : (
        <QuestsBoard items={items} labels={labels} />
      )}
    </div>
  );
}
