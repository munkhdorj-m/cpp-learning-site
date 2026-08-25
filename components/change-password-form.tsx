"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm({ minLength }: { minLength: number }) {
  const t = useTranslations("profile.password");
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(false);

    // Cheap checks here; the server repeats all of them.
    if (!current) return setError(t("err_current_required"));
    if (next.length < minLength)
      return setError(t("err_too_short", { min: minLength }));
    if (next !== confirm) return setError(t("err_confirm"));
    if (next === current) return setError(t("err_same"));
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });

      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as {
          error?: string;
          min?: number;
          retry_after?: number;
        };
        if (b.error === "wrong_password") setError(t("err_wrong"));
        else if (b.error === "too_many_attempts")
          setError(
            t("err_throttled", {
              minutes: Math.max(1, Math.ceil((b.retry_after ?? 900) / 60)),
            }),
          );
        else if (b.error === "too_short")
          setError(t("err_too_short", { min: b.min ?? minLength }));
        else if (b.error === "same_password") setError(t("err_same"));
        else setError(t("err_failed"));
        return;
      }

      setCurrent("");
      setNext("");
      setConfirm("");
      setError(null);
      setDone(true);
      toast.success(t("changed"));
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="pw-current">{t("current")}</Label>
            <Input
              id="pw-current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              className="font-code"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pw-new">{t("new")}</Label>
              <Input
                id="pw-new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                className="font-code"
              />
              <p className="text-xs text-muted-foreground">
                {t("hint", { min: minLength })}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-confirm">{t("confirm")}</Label>
              <Input
                id="pw-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className="font-code"
              />
            </div>
          </div>

          {/* Glyph first, colour second — success and failure share the slot so
              neither shifts the layout. */}
          <p
            role="alert"
            aria-live="polite"
            className={`flex items-start gap-1.5 text-sm ${error || done ? "" : "sr-only"}`}
            style={{ color: error ? "var(--signal-no)" : "var(--signal-ok)" }}
          >
            {error ? (
              <>
                <span aria-hidden>✗</span>
                <span>{error}</span>
              </>
            ) : done ? (
              <>
                <span aria-hidden>✓</span>
                <span>{t("changed")}</span>
              </>
            ) : null}
          </p>

          <Button type="submit" disabled={pending}>
            <KeyRound className="mr-1.5 h-4 w-4" />
            {pending ? "…" : t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
