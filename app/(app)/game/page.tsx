import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Bot, Trophy, ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Тоглоомууд",
};

export default async function GameHubPage() {
  const t = await getTranslations();

  const games = [
    {
      href: "/game/robot",
      title: t("robot.title"),
      subtitle: t("robot.subtitle"),
      Icon: Bot,
      iconBg:
        "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
      tile: "from-violet-500/15 to-fuchsia-500/15",
      border:
        "hover:border-violet-400 dark:hover:border-violet-700",
    },
    {
      href: "/game/bug-smash",
      title: t("bug_smash.title"),
      subtitle: t("bug_smash.subtitle"),
      Icon: Trophy,
      iconBg:
        "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
      tile: "from-rose-500/15 to-amber-500/15",
      border: "hover:border-rose-400 dark:hover:border-rose-700",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t("game_hub.title")}</h1>
        <p className="text-muted-foreground">{t("game_hub.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => (
          <Link key={g.href} href={g.href} className="block group">
            <Card
              className={cn(
                "h-full transition-all overflow-hidden border-2",
                g.border,
                "group-hover:shadow-lg group-hover:-translate-y-0.5",
              )}
            >
              <CardContent
                className={cn(
                  "p-6 flex flex-col gap-4 bg-gradient-to-br",
                  g.tile,
                )}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-xl",
                      g.iconBg,
                    )}
                  >
                    <g.Icon className="h-7 w-7" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{g.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{g.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
