import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Trophy, Flame, BookOpen, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeChip } from "@/components/badge-chip";
import { VerdictBadge } from "@/components/verdict-badge";
import { createClient } from "@/lib/supabase/server";
import { getCachedSession, getCachedProfile } from "@/lib/get-session";
import { dicebearUrl, initials } from "@/lib/avatars";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const tVerdict = await getTranslations("verdict");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();

  // Fast path: x-user-id header from middleware — no network call
  const user = await getCachedSession();
  if (!user) return null;

  // Fetch profile in parallel with class info
  const profile = await getCachedProfile(user.id);
  if (!profile) return null;

  // Parallel: fetch ALL data needed for the profile page in one round-trip burst
  const [
    { data: recent },
    { data: userBadgesRows },
    { count: totalSubs },
    { count: acceptedSubs },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, problem_id, verdict, runtime_ms, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", user.id)
      .order("earned_at", { ascending: false }),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("verdict", "accepted"),
  ]);

  // Fetch class name
  let className = "—";
  if (profile.class_id) {
    const { data: cls } = await supabase
      .from("classes")
      .select("name")
      .eq("id", profile.class_id)
      .maybeSingle();
    className = cls?.name ?? "—";
  }

  // Fetch badges details
  const badgeIds = (userBadgesRows ?? []).map((b) => b.badge_id);
  type BadgeRow = {
    id: string;
    name_mn: string;
    name_en: string;
    description_mn: string;
    description_en: string;
    icon: string;
    color: string;
  };
  let badges: BadgeRow[] = [];
  if (badgeIds.length > 0) {
    const { data } = await supabase
      .from("badges")
      .select(
        "id, name_mn, name_en, description_mn, description_en, icon, color",
      )
      .in("id", badgeIds);
    const order = new Map(badgeIds.map((id, idx) => [id, idx]));
    badges = (data ?? []).sort(
      (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
    );
  }

  // Fetch problem details for recent submissions
  const problemIds = Array.from(
    new Set((recent ?? []).map((s) => s.problem_id)),
  );
  const problemMap = new Map<
    string,
    { slug: string; title_mn: string; title_en: string | null }
  >();
  if (problemIds.length > 0) {
    const { data: probs } = await supabase
      .from("problems")
      .select("id, slug, title_mn, title_en")
      .in("id", problemIds);
    for (const p of probs ?? []) {
      problemMap.set(p.id, {
        slug: p.slug,
        title_mn: p.title_mn,
        title_en: p.title_en,
      });
    }
  }

  const currentLevelXp = (profile.level - 1) ** 2 * 50;
  const nextLevelXp = profile.level ** 2 * 50;
  const progress = Math.max(
    0,
    Math.min(
      100,
      ((profile.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
    ),
  );
  const avatarUrl = dicebearUrl(profile.avatar_seed);
  const userInitials = initials(profile.display_name);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={profile.display_name} />
            <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 text-2xl font-bold">
              {userInitials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold">{profile.display_name}</h1>
            <div className="text-sm text-muted-foreground">
              @{profile.username} · {className}
            </div>
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Lv {profile.level}</span>
                <span className="text-muted-foreground tabular-nums">
                  {profile.xp} / {nextLevelXp} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          icon={<Trophy className="h-4 w-4" />}
          label={t("level")}
          value={profile.level.toString()}
          color="amber"
        />
        <Stat
          icon={<Sparkles className="h-4 w-4" />}
          label={t("xp")}
          value={profile.xp.toString()}
          color="violet"
        />
        <Stat
          icon={<BookOpen className="h-4 w-4" />}
          label={t("problems_solved")}
          value={profile.problems_solved.toString()}
          color="emerald"
        />
        <Stat
          icon={<Flame className="h-4 w-4" />}
          label={t("streak")}
          value={t("streak_days", { days: profile.streak_days })}
          color="orange"
        />
      </div>

      {/* Submission stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {totalSubs ?? 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Total submissions
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums text-emerald-600">
              {acceptedSubs ?? 0}
            </div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {totalSubs && totalSubs > 0
                ? Math.round(((acceptedSubs ?? 0) / totalSubs) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-muted-foreground">Success rate</div>
          </CardContent>
        </Card>
      </div>

      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("badges")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <BadgeChip
                key={b.id}
                badge={{
                  icon: b.icon,
                  color: b.color,
                  name: locale === "en" ? b.name_en : b.name_mn,
                  description:
                    locale === "en" ? b.description_en : b.description_mn,
                }}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recent_submissions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {recent && recent.length > 0 ? (
            <div className="space-y-1.5">
              {recent.map((s) => {
                const prob = problemMap.get(s.problem_id);
                const title = prob
                  ? locale === "en" && prob.title_en
                    ? prob.title_en
                    : prob.title_mn
                  : "—";
                return (
                  <Link
                    key={s.id}
                    href={prob ? `/problems/${prob.slug}` : "#"}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors"
                  >
                    <VerdictBadge
                      verdict={s.verdict}
                      label={tVerdict(s.verdict)}
                      size="sm"
                    />
                    <span className="flex-1 truncate text-sm">{title}</span>
                    {s.runtime_ms !== null && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {s.runtime_ms}ms
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                      {new Date(s.created_at).toLocaleDateString(locale)}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t("no_submissions")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "amber" | "violet" | "emerald" | "orange";
}) {
  const styles = {
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[color]}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-semibold truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
