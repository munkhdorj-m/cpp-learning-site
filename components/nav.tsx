import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileNav } from "@/components/mobile-nav";
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
      <div className="container mx-auto flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <MobileNav showAssignments={!!profile} isTeacher={profile?.role === "teacher"} />
        <SiteLogo />
        <NavLinks showAssignments={!!profile} />

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-1.5">
          {profile && (
            <XpBar
              xp={profile.xp}
              level={profile.level}
              streakDays={profile.streak_days}
            />
          )}
          {/* Theme + language are secondary — keep them off small screens
              so the avatar and login button always fit. */}
          <span className="hidden sm:inline-flex">
            <ThemeToggle />
          </span>
          {profile && <NotificationBell />}
          <span className="hidden sm:inline-flex">
            <LanguageToggle />
          </span>
          {profile ? (
            <UserMenu
              displayName={profile.display_name}
              username={profile.username}
              role={profile.role}
              avatarSeed={profile.avatar_seed}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "whitespace-nowrap font-code",
                )}
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
