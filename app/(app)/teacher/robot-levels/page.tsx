import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Plus, Edit3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { DeleteLevelButton, PlayLevelLink } from "@/components/robot-level-actions";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { LEVELS } from "@/app/(app)/game/robot/levels";

export const dynamic = "force-dynamic";

export default async function TeacherRobotLevelsPage() {
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  // Fetch custom DB levels
  const { data: dbLevels } = await supabase
    .from("robot_levels")
    .select("id, name_mn, name_en, course, xp_reward, palette")
    .order("course", { ascending: true })
    .order("created_at", { ascending: true });

  // Merge by id: a DB row overrides the built-in with the same id.
  // Every level (built-in or custom) appears exactly once and is editable;
  // a DB override can be deleted to revert to the built-in original.
  const dbRows = dbLevels ?? [];
  const dbMap = new Map(dbRows.map((l) => [l.id, l]));
  type MergedLevel = {
    id: string;
    name_mn: string;
    name_en: string;
    course: string;
    xp_reward: number;
    isBuiltIn: boolean;
    hasOverride: boolean;
  };
  const mergedLevels: MergedLevel[] = [];
  const seen = new Set<string>();
  for (const l of LEVELS) {
    const db = dbMap.get(l.id);
    mergedLevels.push({
      id: l.id,
      name_mn: db?.name_mn ?? l.name_mn,
      name_en: db?.name_en ?? l.name_en,
      course: db?.course ?? l.course,
      xp_reward: db?.xp_reward ?? l.xp_reward,
      isBuiltIn: true,
      hasOverride: !!db,
    });
    seen.add(l.id);
  }
  for (const db of dbRows) {
    if (!seen.has(db.id)) {
      mergedLevels.push({
        id: db.id,
        name_mn: db.name_mn,
        name_en: db.name_en,
        course: db.course,
        xp_reward: db.xp_reward,
        isBuiltIn: false,
        hasOverride: false,
      });
    }
  }

  const courseLabel: Record<string, string> = {
    basics: locale === "en" ? "Basics" : "Суурь",
    loops: locale === "en" ? "Loops" : "Давталт",
    conditionals: locale === "en" ? "Conditionals" : "Нөхцөл",
    master: locale === "en" ? "Master" : "Мастер",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Robot Game Levels</h1>
          <p className="text-sm text-muted-foreground">
            Built-in levels + custom DB levels
          </p>
        </div>
        <Link
          href="/teacher/robot-levels/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "bg-violet-600 text-white hover:bg-violet-700",
          )}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Level
        </Link>
      </div>

      {mergedLevels.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">
            No levels found
          </p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y">
            {mergedLevels.map((l) => {
              const title =
                locale === "en" && l.name_en ? l.name_en : l.name_mn;
              return (
                <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs rounded-full px-2 py-0.5 bg-muted text-muted-foreground shrink-0">
                    {courseLabel[l.course] ?? l.course}
                  </span>
                  {l.hasOverride ? (
                    <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 shrink-0">
                      {l.isBuiltIn ? "OVERRIDE" : "CUSTOM"}
                    </span>
                  ) : (
                    <span className="text-[10px] rounded-full px-1.5 py-0.5 bg-muted text-muted-foreground shrink-0">
                      built-in
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{title}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {l.id}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {l.xp_reward} XP
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/teacher/robot-levels/${l.id}/edit`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                      title={
                        l.isBuiltIn
                          ? "Edit / override built-in level"
                          : "Edit level"
                      }
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Link>
                    {l.hasOverride && <DeleteLevelButton levelId={l.id} />}
                  </div>
                  <PlayLevelLink levelId={l.id} />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
