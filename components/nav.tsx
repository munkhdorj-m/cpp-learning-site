import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { SiteLogo } from "@/components/site-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { XpBar } from "@/components/xp-bar";
import { MessageBell } from "@/components/messages/message-bell";
import { cn } from "@/lib/utils";
import { getCachedProfile, getCachedSession } from "@/lib/get-session";
import { unreadCount } from "@/lib/messages";
import type { Tables } from "@/types/database";

export async function Nav() {
  const t = await getTranslations("nav");
  const user = await getCachedSession();

  let profile: Tables<"profiles"> | null = null;
  if (user) {
    profile = (await getCachedProfile(user.id)) as Tables<"profiles"> | null;
  }

  // Rendered on the server so the badge is right on first paint rather than
  // popping in a second later. unreadCount returns 0 until the tables exist,
  // so the header cannot break the whole site before the migration is run.
  let unread = 0;
  if (profile) {
    try {
      unread = await unreadCount(profile.id, profile.role);
    } catch {
      unread = 0;
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-primary/20 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <MobileNav
          showAssignments={!!profile}
          isTeacher={profile?.role === "teacher"}
          signedIn={!!profile}
        />
        <SiteLogo />
        <NavLinks showAssignments={!!profile} />

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-1.5">
          {profile && (
            <XpBar xp={profile.xp} level={profile.level} />
          )}
          {profile && (
            <MessageBell
              href={
                profile.role === "teacher" ? "/teacher/messages" : "/messages"
              }
              label={t("messages")}
              initialCount={unread}
            />
          )}
          {/* Theme + language are secondary — keep them off small screens
              so the avatar and login button always fit. */}
          <span className="hidden sm:inline-flex">
            <ThemeToggle />
          </span>
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
            /* Never hide this one. Below 640px the header used to drop it
               and the hamburger had no login link either, which left a
               logged-out student on a phone with no way in at all. */
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "shrink-0 px-3",
              )}
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
