"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(t("error"));
        return;
      }
      router.push("/problems");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="hud-panel hud-corners">
        <CardHeader>
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            AUTH.LOGIN
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full font-code"
              disabled={pending}
            >
              {pending ? "..." : t("submit")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("no_account")}{" "}
              <Link href="/signup" className="text-primary hover:underline">
                {t("signup_link")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
