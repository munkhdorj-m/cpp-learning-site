"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Gives one student a fresh password and shows it once. */
export function ResetPasswordButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [busy, setBusy] = useState(false);
  const [shown, setShown] = useState<string | null>(null);

  const reset = async () => {
    if (!window.confirm(`Give ${name} a new password?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/teacher/students/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      setShown(data.password);
    } finally {
      setBusy(false);
    }
  };

  if (shown) {
    return (
      <span className="hud-chip" style={{ ["--glow" as string]: "var(--neon-amber)" }}>
        {shown}
      </span>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={reset}
      disabled={busy}
      title="Reset password"
    >
      <KeyRound className="h-3.5 w-3.5" />
    </Button>
  );
}
