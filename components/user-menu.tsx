"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, User } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { dicebearUrl, initials } from "@/lib/avatars";

interface UserMenuProps {
  displayName: string;
  username: string;
  role: "student" | "teacher";
  avatarSeed: string;
}

export function UserMenu({
  displayName,
  username,
  role,
  avatarSeed,
}: UserMenuProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const avatarUrl = dicebearUrl(avatarSeed);

  const logout = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            disabled={pending}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 text-xs font-bold">
                {initials(displayName) || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium">
              {displayName}
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="font-semibold">{displayName}</div>
            <div className="text-xs text-muted-foreground font-normal">
              @{username}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User className="mr-2 h-4 w-4" />
          {t("profile")}
        </DropdownMenuItem>
        {role === "teacher" && (
          <DropdownMenuItem render={<Link href="/teacher" />}>
            {t("teacher")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
