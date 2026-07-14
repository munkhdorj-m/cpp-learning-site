import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Code, Trophy, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CharacterSprite } from "@/components/character-sprite";
import { TypewriterHero } from "@/components/typewriter-hero";
import { cn } from "@/lib/utils";
import { getCachedSession } from "@/lib/get-session";

export default async function LandingPage() {
  const t = await getTranslations();
  let user = null;
  try {
    // Uses x-user-id header from middleware (fast path) — no network call
    user = await getCachedSession();
  } catch {
    // Supabase unreachable — show unauthenticated landing page
  }

  const ctaHref = user ? "/problems" : "/signup";

  return (
    <div className="space-y-16 py-8 md:py-16">
      {/* Hero section with typewriter */}
      <section className="relative text-center max-w-3xl mx-auto space-y-6">
        {/* Left character */}
        <CharacterSprite
          src="/characters/coder-left.png"
          alt="Coding student"
          width={160}
          height={200}
          className="absolute -left-28 top-10 hidden lg:block"
          delay={0.2}
          floatDuration={4.5}
        />
        {/* Right character */}
        <CharacterSprite
          src="/characters/coder-right.png"
          alt="Coding student"
          width={160}
          height={200}
          className="absolute -right-28 top-10 hidden lg:block"
          delay={0.5}
          floatDuration={3.5}
        />
        {/* Bottom character — smaller, peek over the typewriter on mobile */}
        <CharacterSprite
          src="/characters/coder-center.png"
          alt="Cute robot"
          width={100}
          height={130}
          className="absolute -bottom-8 right-0 sm:-right-16 block"
          delay={0.8}
          floatDuration={5}
          hoverScale={1.12}
        />

        <TypewriterHero />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t("landing.hero_title")}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("landing.hero_subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-violet-600 text-white hover:bg-violet-700 hover:scale-105 transition-transform",
            )}
          >
            {t("landing.get_started")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          {!user && (
            <Link
              href="/login"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              {t("landing.have_account")}
            </Link>
          )}
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <FeatureCard
          icon={<Code className="h-5 w-5" />}
          title={t("nav.problems")}
          accent="violet"
        />
        <FeatureCard
          icon={<Trophy className="h-5 w-5" />}
          title={t("nav.leaderboard")}
          accent="amber"
        />
        <FeatureCard
          icon={<Users className="h-5 w-5" />}
          title={t("nav.assignments")}
          accent="emerald"
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  accent: "violet" | "amber" | "emerald";
}) {
  const accentClasses = {
    violet:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
  return (
    <Card className="border-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
      <CardContent className="flex items-center gap-3 p-6">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClasses[accent]}`}
        >
          {icon}
        </div>
        <span className="font-semibold">{title}</span>
      </CardContent>
    </Card>
  );
}
