"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus, Trash2, FolderInput } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  username: string;
  display_name: string;
  xp: number;
  problems_solved: number;
}

interface ClassOption {
  id: string;
  name: string;
  grade: number;
}

/**
 * Students who belong to no class — normally because their class was deleted.
 * Without this they still exist (and still appear on the leaderboard) but are
 * unreachable from anywhere in the teacher UI.
 */
export function UnassignedStudents({
  students,
  classes,
}: {
  students: Student[];
  classes: ClassOption[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  if (students.length === 0) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const allSelected = selected.size === students.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(students.map((s) => s.id)));

  const chosen = students.filter((s) => selected.has(s.id));

  const assign = async () => {
    if (!target || chosen.length === 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/teacher/students/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_ids: chosen.map((s) => s.id),
          to_class_id: target,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      toast.success(`Moved ${data.moved} student(s)`);
      setSelected(new Set());
      setTarget("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (chosen.length === 0) return;
    const names = chosen.map((s) => s.display_name).join(", ");
    if (
      !window.confirm(
        `Delete ${chosen.length} student(s)?\n\n${names}\n\nAll their work — submissions, XP and badges — is permanently removed.`,
      )
    )
      return;
    if (!window.confirm("This cannot be undone. Delete for good?")) return;

    setBusy(true);
    try {
      const res = await fetch("/api/teacher/students/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_ids: chosen.map((s) => s.id) }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      toast.success(`Deleted ${data.deleted} student(s)`);
      setSelected(new Set());
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-neon-amber/30">
      <CardContent className="space-y-3 p-4">
        <div>
          <div className="hud-label flex items-center gap-2">
            <span className="text-neon-amber">{"//"}</span>
            NO CLASS ({students.length})
          </div>
          <p className="text-sm text-muted-foreground">
            These students are not in any class — usually because their class
            was deleted. Put them in a class, or remove them for good.
          </p>
        </div>

        <div className="divide-y divide-primary/10 rounded-lg border border-primary/15">
          <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <span className="hud-label">SELECT ALL</span>
          </label>
          {students.map((s) => (
            <label
              key={s.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors",
                selected.has(s.id) && "bg-primary/[0.07]",
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggle(s.id)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {s.display_name}
              </span>
              <span className="shrink-0 font-code text-xs text-muted-foreground">
                {s.username}
              </span>
              <span className="hidden shrink-0 font-code text-xs tabular-nums text-muted-foreground sm:inline">
                {s.xp} XP · {s.problems_solved} solved
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-code text-xs text-muted-foreground">
            {selected.size} selected
          </span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="ml-auto h-8 min-w-[160px] rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="">Put into class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (grade {c.grade})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !target || selected.size === 0}
            onClick={assign}
            className="font-code"
          >
            <FolderInput className="mr-1.5 h-4 w-4" />
            Assign
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || selected.size === 0}
            onClick={remove}
            className="border-destructive/40 font-code text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>

        {students.length > 0 && selected.size === 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserMinus className="h-3.5 w-3.5" />
            Tick the students you want to move or remove.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
