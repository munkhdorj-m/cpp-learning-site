import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Plus, Edit3 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { DeleteLevelButton, PlayLevelLink } from "@/components/robot-level-actions";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { LEVELS } from "@/app/(app)/game/robot/levels";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function TeacherRobotLevelsPage() {
  // The layout calls this too, but a layout's redirect does not stop
  // this page rendering: React renders them together, and whatever the
  // page produced is flushed into the redirect response for anyone who
  // reads the body instead of following the Location header.
  await requireTeacher();

  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  const [{ data: dbLevels }, { data: hiddenRows }] = await Promise.all([
    supabase
      .from("robot_levels")
      .select("id, name_mn, name_en, course, xp_reward, palette, order_idx")
      .order("order_idx", { ascending: true }),
    supabase.from("robot_hidden_levels").select("level_id"),
  ]);

  // Merge by id: a DB row overrides the built-in with the same id.
  // Every level (built-in or custom) appears exactly once and is editable.
  // The MySQL shim hands back loosely-typed rows; name the shape once here
  // rather than casting at every use.
  type DbLevelRow = {
    id: string;
    name_mn: string;
    name_en: string;
    course: string;
    xp_reward: number;
    order_idx: number | string | null;
  };
  const dbRows = (dbLevels ?? []) as DbLevelRow[];
  const dbMap = new Map(dbRows.map((l) => [l.id, l]));
  const hidden = new Set(
    ((hiddenRows ?? []) as { level_id: string }[]).map((r) => r.level_id),
  );
  type MergedLevel = {
    id: string;
    name_mn: string;
    name_en: string;
    course: string;
    xp_reward: number;
    order_idx: number;
    isBuiltIn: boolean;
    hasOverride: boolean;
    isHidden: boolean;
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
      order_idx: Number(db?.order_idx) || l.order_idx,
      isBuiltIn: true,
      hasOverride: !!db,
      isHidden: hidden.has(l.id),
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
        order_idx: Number(db.order_idx) || LEVELS.length + 1,
        // A level that exists only in the database is not a built-in and has
        // nothing to override. Both of these were hardcoded the other way
        // round, which labelled every teacher-made level "built-in" and — since
        // the delete button keyed off hasOverride — left it undeletable too.
        isBuiltIn: false,
        hasOverride: true,
        isHidden: hidden.has(db.id),
      });
    }
  }
  // Show them in play order, the same way students see them.
  mergedLevels.sort(
    (a, b) => a.order_idx - b.order_idx || a.id.localeCompare(b.id),
  );

  const courseLabel: Record<string, string> = {
    basics: locale === "en" ? "Basics" : "Суурь",
    loops: locale === "en" ? "Loops" : "Давталт",
    conditionals: locale === "en" ? "Conditionals" : "Нөхцөл",
    master: locale === "en" ? "Master" : "Мастер",
    gadgets: locale === "en" ? "Gadgets" : "Төхөөрөмж",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Robot Game Levels</h1>
          <p className="text-sm text-muted-foreground">
            Built-in levels + custom DB levels. Removing a built-in hides it
            from students; it can be restored.
          </p>
        </div>
        <Link
          href="/teacher/robot-levels/new"
          className={cn(
            buttonVariants({ size: "sm" }),
            "font-code",
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
                <div
                  key={l.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    l.isHidden && "opacity-55",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 font-code text-xs font-bold text-primary">
                    {l.order_idx}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-code text-[10px] uppercase tracking-wider text-muted-foreground">
                    {courseLabel[l.course] ?? l.course}
                  </span>
                  {l.isHidden ? (
                    <span className="shrink-0 rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] text-destructive">
                      REMOVED
                    </span>
                  ) : l.hasOverride ? (
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
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "font-code",
                      )}
                      title={
                        l.isBuiltIn
                          ? "Edit / override built-in level"
                          : "Edit level"
                      }
                    >
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <DeleteLevelButton
                      levelId={l.id}
                      levelName={title}
                      isBuiltIn={l.isBuiltIn}
                      isHidden={l.isHidden}
                    />
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
