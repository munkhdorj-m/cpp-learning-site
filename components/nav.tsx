import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { NavLinks } from "@/components/nav-links";
import { NotificationBell } from "@/components/notification-bell";
import { SiteLogo } from "@/components/site-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { XpBar } from "@/components/xp-bar";
import { cn } from "@/lib/utils";
import { getCachedProfile, getCachedSession } from "@/lib/get-session";
import type { Tables } from "@/types/database";

export async function Nav() {
  const t = await getTranslations("nav");
  const user = await getCachedSession();

  let profile: Tables<"profiles"> | null = null;
  if (user) {
    profile = (await getCachedProfile(user.id)) as Tables<"profiles"> | null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <SiteLogo />
        <NavLinks showAssignments={!!profile} />

        <div className="ml-auto flex items-center gap-1.5">
          {profile && (
            <XpBar
              xp={profile.xp}
              level={profile.level}
              streakDays={profile.streak_days}
            />
          )}
          <ThemeToggle />
          {profile && <NotificationBell />}
          <LanguageToggle />
          {profile ? (
            <UserMenu
              displayName={profile.display_name}
              username={profile.username}
              role={profile.role}
              avatarSeed={profile.avatar_seed}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "sm" }), "font-code")}
              >
                {t("signup")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
