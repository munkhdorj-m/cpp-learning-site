"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type InviteState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; role: "student" | "teacher"; className: string | null }
  | { status: "invalid" };

export default function SignupPage() {
  const t = useTranslations("auth.signup");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState<InviteState>({ status: "idle" });

  const validateCode = async (value: string) => {
    if (!value) {
      setInvite({ status: "idle" });
      return;
    }
    setInvite({ status: "checking" });
    const res = await fetch("/api/auth/validate-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: value }),
    });
    const data = await res.json();
    if (!data.valid) {
      setInvite({ status: "invalid" });
      return;
    }
    setInvite({
      status: "valid",
      role: data.role,
      className: data.className,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invite.status !== "valid") {
      toast.error(t("invalid_code"));
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, username, displayName, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? tCommon("error"));
        return;
      }
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }
      router.push("/problems");
      router.refresh();
    });
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">{t("invite_code")}</Label>
              <div className="relative">
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onBlur={(e) => validateCode(e.target.value)}
                  placeholder={t("invite_code_hint")}
                  required
                  className="pr-9"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {invite.status === "valid" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {invite.status === "invalid" && (
                    <XCircle className="h-4 w-4 text-rose-600" />
                  )}
                </div>
              </div>
              {invite.status === "valid" && invite.role === "student" && invite.className && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {t("class_will_be", { class: invite.className })}
                </p>
              )}
              {invite.status === "valid" && invite.role === "teacher" && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Teacher account
                </p>
              )}
              {invite.status === "invalid" && (
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  {t("invalid_code")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">{t("display_name")}</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={60}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                pattern="[a-zA-Z0-9_]{3,20}"
                minLength={3}
                maxLength={20}
              />
            </div>

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
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={pending || invite.status !== "valid"}
            >
              {pending ? "..." : t("submit")}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {t("has_account")}{" "}
              <Link href="/login" className="text-violet-600 hover:underline">
                {t("login_link")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
