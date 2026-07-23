import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Bot, Trophy, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Тоглоомууд",
};

export default async function GameHubPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const en = locale === "en";

  const games = [
    {
      href: "/game/robot",
      title: t("robot.title"),
      subtitle: t("robot.subtitle"),
      tag: en ? "PUZZLE" : "ОНОВЧ",
      Icon: Bot,
      glow: "var(--neon-violet)",
    },
    {
      href: "/game/bug-smash",
      title: t("bug_smash.title"),
      subtitle: t("bug_smash.subtitle"),
      tag: en ? "ARCADE" : "АРКАД",
      Icon: Trophy,
      glow: "var(--neon-pink)",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">//</span>
          {en ? "ARCADE" : "ТОГЛООМЫН ТАЛБАЙ"}
        </div>
        <h1 className="text-3xl font-bold">{t("game_hub.title")}</h1>
        <p className="text-muted-foreground">{t("game_hub.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {games.map((g) => (
          <Link key={g.href} href={g.href} className="group block">
            <Card
              className="hud-hover h-full"
              style={{
                ["--glow" as string]: g.glow,
                ["--neon-cyan" as string]: g.glow,
              }}
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                    style={{
                      color: g.glow,
                      borderColor: `color-mix(in oklch, ${g.glow} 35%, transparent)`,
                      background: `color-mix(in oklch, ${g.glow} 12%, transparent)`,
                      boxShadow: `0 0 26px -8px ${g.glow}`,
                    }}
                  >
                    <g.Icon className="h-7 w-7" />
                  </div>
                  <span
                    className="hud-chip"
                    style={{ ["--glow" as string]: g.glow }}
                  >
                    {g.tag}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{g.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {g.subtitle}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 font-code text-xs font-semibold"
                  style={{ color: g.glow }}
                >
                  {en ? "LAUNCH" : "ЭХЛҮҮЛЭХ"}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
