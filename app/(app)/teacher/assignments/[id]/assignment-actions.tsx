"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteAssignment } from "@/app/actions/assignments";

export function AssignmentActions({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete assignment "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteAssignment(id);
      if (res && "error" in res) toast.error(res.error);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/teacher/assignments/${id}/edit`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Pencil className="h-3.5 w-3.5 mr-1" />
        Edit
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={pending}
        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
      >
        <Trash2 className="h-3.5 w-3.5 mr-1" />
        Delete
      </Button>
    </div>
  );
}
