import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowRight, Code, Trophy, Gamepad2, BookOpen } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CharacterSprite } from "@/components/character-sprite";
import { TypewriterHero } from "@/components/typewriter-hero";
import { cn } from "@/lib/utils";
import { getCachedSession } from "@/lib/get-session";

export default async function LandingPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const en = locale === "en";

  let user = null;
  try {
    // Uses x-user-id header from middleware (fast path) — no network call
    user = await getCachedSession();
  } catch {
    // Supabase unreachable — show unauthenticated landing page
  }

  const ctaHref = user ? "/problems" : "/signup";

  return (
    <div className="space-y-20 py-8 md:py-16">
      {/* Hero */}
      <section className="relative mx-auto max-w-3xl space-y-6 text-center">
        {/* Floating characters */}
        <CharacterSprite
          src="/characters/coder-left.png"
          alt="Coding student"
          width={160}
          height={200}
          className="absolute -left-28 top-10 hidden lg:block"
          delay={0.2}
          floatDuration={4.5}
        />
        <CharacterSprite
          src="/characters/coder-right.png"
          alt="Coding student"
          width={160}
          height={200}
          className="absolute -right-28 top-10 hidden lg:block"
          delay={0.5}
          floatDuration={3.5}
        />
        <CharacterSprite
          src="/characters/coder-center.png"
          alt="Cute robot"
          width={100}
          height={130}
          className="absolute -bottom-8 right-0 block sm:-right-16"
          delay={0.8}
          floatDuration={5}
          hoverScale={1.12}
        />

        {/* Kicker */}
        <div className="flex justify-center">
          <span
            className="hud-chip neon-pulse"
            style={{ ["--glow" as string]: "var(--neon-lime)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-neon-lime shadow-[0_0_8px_var(--neon-lime)]" />
            {en ? "SYSTEM ONLINE" : "СИСТЕМ БЭЛЭН"}
          </span>
        </div>

        <TypewriterHero />

        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient">{t("landing.hero_title")}</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t("landing.hero_subtitle")}
        </p>

        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Link
            href={ctaHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "font-code transition-transform hover:scale-105",
            )}
          >
            {t("landing.get_started")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          {!user && (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "font-code",
              )}
            >
              {t("landing.have_account")}
            </Link>
          )}
        </div>
      </section>

      {/* Feature modules */}
      <section className="mx-auto max-w-4xl space-y-4">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">//</span>
          {en ? "MODULES" : "МОДУЛИУД"}
          <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            href="/problems"
            icon={<Code className="h-5 w-5" />}
            label="01"
            title={t("nav.problems")}
            desc={en ? "Solve & submit" : "Бодож илгээ"}
            glow="var(--neon-cyan)"
          />
          <FeatureCard
            href="/game"
            icon={<Gamepad2 className="h-5 w-5" />}
            label="02"
            title={t("nav.game")}
            desc={en ? "Code a robot" : "Робот удирд"}
            glow="var(--neon-violet)"
          />
          <FeatureCard
            href="/leaderboard"
            icon={<Trophy className="h-5 w-5" />}
            label="03"
            title={t("nav.leaderboard")}
            desc={en ? "Climb the ranks" : "Тэргүүл"}
            glow="var(--neon-amber)"
          />
          <FeatureCard
            href="/learn"
            icon={<BookOpen className="h-5 w-5" />}
            label="04"
            title={en ? "Learn" : "Сурах"}
            desc={en ? "Start from zero" : "Тэгээс эхэл"}
            glow="var(--neon-lime)"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  label,
  title,
  desc,
  glow,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  desc: string;
  glow: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card
        className="hud-hover h-full"
        style={{ ["--glow" as string]: glow, ["--neon-cyan" as string]: glow }}
      >
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border"
              style={{
                color: glow,
                borderColor: `color-mix(in oklch, ${glow} 35%, transparent)`,
                background: `color-mix(in oklch, ${glow} 12%, transparent)`,
                boxShadow: `0 0 20px -8px ${glow}`,
              }}
            >
              {icon}
            </div>
            <span className="hud-label" style={{ color: glow }}>
              {label}
            </span>
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="font-code text-xs text-muted-foreground">
              {desc}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
