import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Plus, Edit3, Sparkles, Eye, EyeOff } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import type { Difficulty } from "@/types/database";

export const dynamic = "force-dynamic";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  medium:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  hard: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
};

export default async function TeacherProblemsPage() {
  const t = await getTranslations("teacher.problems");
  const tDiff = await getTranslations("problems.difficulty");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  const { data: problems } = await supabase
    .from("problems")
    .select("id, slug, title_mn, title_en, difficulty, xp_reward, is_public")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link
          href="/teacher/problems/new"
          className={cn(buttonVariants({ size: "sm" }), "bg-violet-600 text-white hover:bg-violet-700")}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t("new")}
        </Link>
      </div>

      {!problems || problems.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">
            {t("no_problems")}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {problems.map((p) => {
              const title = locale === "en" && p.title_en ? p.title_en : p.title_mn;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Badge
                    variant="outline"
                    className={`${DIFFICULTY_STYLES[p.difficulty]} border shrink-0`}
                  >
                    {tDiff(p.difficulty)}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{title}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      /problems/{p.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 text-sm font-medium tabular-nums shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                    {p.xp_reward}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 hidden sm:flex items-center gap-1">
                    {p.is_public ? (
                      <>
                        <Eye className="h-3 w-3" /> {t("public")}
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> {t("private")}
                      </>
                    )}
                  </div>
                  <Link
                    href={`/teacher/problems/${p.id}/edit`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    {t("edit")}
                  </Link>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
