"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeNext } from "@/lib/auth-gate";

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  /**
   * Shown in the form, not as a toast. A toast appears away from the fields,
   * vanishes on a timer, and is easy to miss on a phone — none of which suits
   * "you typed your password wrong". role="alert" also reads it out.
   */
  const [error, setError] = useState<string | null>(null);

  // Where the student was before they were asked to log in. safeNext refuses
  // anything that is not a same-site path, so a crafted ?next= cannot bounce
  // them off the site straight after they type their password.
  const next = safeNext(params.get("next"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      if (!res.ok) {
        setError(t("error"));
        return;
      }
      router.push(next);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[26rem] flex-col justify-center px-4 py-10 sm:py-16">
      {/* Cabinet marquee. The pixel face earns its keep at this one size —
          it is the only place on the page where the word is an image. */}
      <div className="mb-1 text-center">
        <span
          className="font-heading text-[15px] leading-none sm:text-lg"
          style={{
            // Same two tones as the landing marquee (.text-gradient), so the
            // two cabinet titles cannot drift apart.
            color: "var(--display-ink)",
            textShadow: "3px 3px 0 var(--display-shade)",
          }}
        >
          {t("title")}
        </span>
      </div>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        {t("subtitle")}
      </p>

      <div className="hud-panel hud-corners p-5 sm:p-6">
        <div className="hud-label mb-4 flex items-center gap-2">
          <span className="text-primary">{"//"}</span>
          AUTH.LOGIN
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="login" className="text-sm font-semibold">
              {t("login")}
            </Label>
            {/* Deliberately not type="email": students sign in with the
                username from their slip, and the browser would refuse to
                submit one. */}
            <Input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
              className="h-11 border-2 font-code text-base"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-semibold">
              {t("password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
              className="h-11 border-2 font-code text-base"
            />
          </div>

          {/* A glyph first, colour second — a deuteranope reads the ✗, not the
              red. Rendered always so the announcement is not a layout jump. */}
          <p
            id="login-error"
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

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base"
            disabled={pending}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {pending ? "…" : t("submit")}
          </Button>
        </form>
      </div>

      {/* The site is readable without an account now, so say so. Without this
          the login page still reads like a locked door. */}
      <Link
        href="/learn"
        className="hud-hover mt-4 flex items-center justify-center gap-1.5 border border-border px-3 py-2.5 text-sm text-muted-foreground"
      >
        {t("browse")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
