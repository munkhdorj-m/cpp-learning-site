"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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

export function DeleteLevelButton({ levelId }: { levelId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/robot/levels/${levelId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        toast.error(err.error ?? "Delete failed");
        return;
      }
      toast.success("Level deleted");
      setOpen(false);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete level?</DialogTitle>
          <DialogDescription>
            This permanently removes the level &ldquo;{levelId}&rdquo; from the
            database. Student progress for this level will remain. This cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
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
