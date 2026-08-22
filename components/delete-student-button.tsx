"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Permanently deletes one student. Asks twice, because their whole history
 * (submissions, XP, badges) goes with them and cannot be recovered.
 */
export function DeleteStudentButton({
  userId,
  name,
  username,
}: {
  userId: string;
  name: string;
  username: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (
      !window.confirm(
        `Delete ${name} (${username})?\n\nTheir account and ALL their work — submissions, XP and badges — will be permanently removed.`,
      )
    ) {
      return;
    }
    if (!window.confirm(`This cannot be undone. Delete ${name} for good?`)) {
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/teacher/students/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: [userId] }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      toast.success(`Deleted ${name}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={remove}
      disabled={busy}
      title={`Delete ${name}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
