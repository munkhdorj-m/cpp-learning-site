"use client";

import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { useTransition } from "react";

import { setLocale } from "@/app/actions/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("language");
  const [pending, startTransition] = useTransition();

  const switchTo = (next: string) => {
    startTransition(() => setLocale(next));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" disabled={pending}>
            <Languages className="h-4 w-4" />
            <span className="ml-1 text-xs uppercase">{locale}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchTo("mn")} disabled={locale === "mn"}>
          {t("switch_to_mn")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchTo("en")} disabled={locale === "en"}>
          {t("switch_to_en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
