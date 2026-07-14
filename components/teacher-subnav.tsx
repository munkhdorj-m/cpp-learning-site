"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  ShieldAlert,
  Trophy,
  Gamepad2,
  BarChart3,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Item = {
  href: string;
  labelKey:
    | "dashboard"
    | "classes"
    | "problems"
    | "assignments"
    | "contests"
    | "plagiarism"
    | "robot_levels"
    | "analytics";
  Icon: typeof LayoutDashboard;
  exact?: boolean;
};

const ITEMS: Item[] = [
  {
    href: "/teacher",
    labelKey: "dashboard",
    Icon: LayoutDashboard,
    exact: true,
  },
  { href: "/teacher/classes", labelKey: "classes", Icon: Users },
  { href: "/teacher/problems", labelKey: "problems", Icon: BookOpen },
  {
    href: "/teacher/assignments",
    labelKey: "assignments",
    Icon: ClipboardList,
  },
  { href: "/teacher/contests", labelKey: "contests", Icon: Trophy },
  { href: "/teacher/plagiarism", labelKey: "plagiarism", Icon: ShieldAlert },
  { href: "/teacher/robot-levels", labelKey: "robot_levels", Icon: Gamepad2 },
  { href: "/teacher/analytics", labelKey: "analytics", Icon: BarChart3 },
];

export function TeacherSubnav() {
  const t = useTranslations("teacher.nav");
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b mb-6 -mt-2 overflow-x-auto">
      {ITEMS.map(({ href, labelKey, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap",
              active
                ? "border-violet-600 text-violet-700 dark:text-violet-300"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
