"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { UserPlus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Matches the zod rule in app/api/teacher/teachers/route.ts. */
const MIN_PASSWORD = 10;

export function AddTeacherForm() {
  const t = useTranslations("teacher.teachers");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Checked here for a fast, quiet message; the server checks the same things
  // again because this is a privilege boundary and the browser is not trusted.
  const localProblem = (): string | null => {
    if (!displayName.trim()) return t("err_name");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return t("err_email");
    if (!/^[a-z0-9_]{3,20}$/.test(username.trim().toLowerCase()))
      return t("err_username");
    if (password.length < MIN_PASSWORD) return t("err_password");
    if (password !== confirm) return t("err_confirm");
    return null;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problem = localProblem();
    setError(problem);
    if (problem) return;

    startTransition(async () => {
      const res = await fetch("/api/teacher/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          email: email.trim(),
          username: username.trim().toLowerCase(),
          password,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (body.error === "email_taken") setError(t("err_email_taken"));
        else if (body.error === "username_taken")
          setError(t("err_username_taken"));
        else if (res.status === 403) setError(t("err_forbidden"));
        else setError(t("err_failed"));
        return;
      }

      toast.success(t("created", { name: displayName.trim() }));
      setDisplayName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirm("");
      setError(null);
      // Re-render the server component so the new teacher joins the list.
      router.refresh();
    });
  };

  return (
    <Card className="hud-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4" />
          {t("add_title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Naming the consequence beats discovering it. */}
        <p className="mb-4 flex items-start gap-2 border border-primary/25 bg-primary/[0.06] p-3 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{t("warning")}</span>
        </p>

        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">{t("name")}</Label>
              <Input
                id="t-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={120}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-email">{t("email")}</Label>
              <Input
                id="t-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="font-code"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-username">{t("username")}</Label>
              <Input
                id="t-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="font-code"
              />
              <p className="text-xs text-muted-foreground">
                {t("username_hint")}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-password">{t("password")}</Label>
              <Input
                id="t-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="font-code"
              />
              <p className="text-xs text-muted-foreground">
                {t("password_hint", { min: MIN_PASSWORD })}
              </p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="t-confirm">{t("confirm")}</Label>
              <Input
                id="t-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="font-code"
              />
            </div>
          </div>

          {/* Glyph first, colour second. */}
          <p
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-1.5 text-sm ${error ? "" : "sr-only"}`}
            style={{ color: "var(--signal-no)" }}
          >
            {error ? (
              <>
                <span aria-hidden>✗</span>
                <span>{error}</span>
              </>
            ) : null}
          </p>

          <Button type="submit" disabled={pending}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            {pending ? "…" : t("add_button")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
