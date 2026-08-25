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
  UserPlus,
  MessageSquare,
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
    | "messages"
    | "plagiarism"
    | "robot_levels"
    | "analytics"
    | "teachers";
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
  { href: "/teacher/messages", labelKey: "messages", Icon: MessageSquare },
  { href: "/teacher/plagiarism", labelKey: "plagiarism", Icon: ShieldAlert },
  { href: "/teacher/robot-levels", labelKey: "robot_levels", Icon: Gamepad2 },
  { href: "/teacher/analytics", labelKey: "analytics", Icon: BarChart3 },
  { href: "/teacher/teachers", labelKey: "teachers", Icon: UserPlus },
];

export function TeacherSubnav() {
  const t = useTranslations("teacher.nav");
  const pathname = usePathname();

  return (
    <nav className="-mt-2 mb-6 flex items-center gap-1 overflow-x-auto border-b border-primary/15">
      {ITEMS.map(({ href, labelKey, Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 font-code text-[0.8rem] font-medium tracking-wide transition-colors",
              active
                ? "border-primary text-primary text-glow-soft [box-shadow:0_1px_10px_-2px_var(--color-primary)]"
                : "border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
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
