"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Take a level out of the game, or put it back.
 *
 * A built-in level is a constant in the app's code, not a database row, so
 * there is nothing to delete — removing one records that it is hidden, and it
 * can be restored. A level a teacher created is a real row and is really
 * deleted. The dialog says which of the two is about to happen, because
 * "cannot be undone" and "can be restored" are not details to guess at.
 */
export function DeleteLevelButton({
  levelId,
  levelName,
  isBuiltIn,
  isHidden,
}: {
  levelId: string;
  levelName: string;
  isBuiltIn: boolean;
  isHidden: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async (restore: boolean) => {
    setBusy(true);
    try {
      const res = await fetch(
        `/api/robot/levels/${encodeURIComponent(levelId)}${restore ? "?restore=1" : ""}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        toast.error(err.error ?? "Failed");
        return;
      }
      toast.success(
        restore
          ? "Level restored"
          : isBuiltIn
            ? "Level removed from the game"
            : "Level deleted",
      );
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  // Restoring is not destructive, so it does not get a confirmation.
  if (isHidden) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => send(true)}
        title="Put this level back in the game"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:text-rose-600"
            title={isBuiltIn ? "Remove from the game" : "Delete level"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBuiltIn ? "Remove this level?" : "Delete this level?"}
          </DialogTitle>
          <DialogDescription>
            {isBuiltIn ? (
              <>
                Students will no longer see &ldquo;{levelName}&rdquo;. It is one
                of the levels built into the app, so it is hidden rather than
                deleted — you can put it back at any time. Progress students
                have already made on it is kept.
              </>
            ) : (
              <>
                This permanently deletes &ldquo;{levelName}&rdquo; from the
                database. Student progress for this level will remain. This
                cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => send(false)}
            disabled={busy}
          >
            {busy ? "Working…" : isBuiltIn ? "Remove" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PlayLevelLink({ levelId }: { levelId: string }) {
  return (
    <a
      href={`/game/robot?level=${levelId}`}
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      title="Play this level"
    >
      ▶
    </a>
  );
}
