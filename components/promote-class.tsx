"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ClassOption {
  id: string;
  name: string;
  grade: number;
}

/**
 * End-of-year move: send every student in this class to another class, or
 * graduate them out of all classes.
 */
export function PromoteClass({
  classId,
  className,
  studentCount,
  classes,
}: {
  classId: string;
  className: string;
  studentCount: number;
  classes: ClassOption[];
}) {
  const router = useRouter();
  const [target, setTarget] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const others = classes.filter((c) => c.id !== classId);

  const move = async () => {
    if (!target) {
      toast.error("Choose where they should go");
      return;
    }
    const label =
      target === "graduate"
        ? "graduate them out of all classes"
        : `move them to ${others.find((c) => c.id === target)?.name}`;
    if (
      !window.confirm(
        `Move all ${studentCount} students from ${className} — ${label}?\n\nTheir accounts, XP and history are kept.`,
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/teacher/students/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_class_id: classId,
          to_class_id: target === "graduate" ? null : target,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      toast.success(`Moved ${data.moved} students`);
      setTarget("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (studentCount === 0) return null;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">//</span>
            END OF YEAR
          </div>
          <p className="text-sm text-muted-foreground">
            Move all {studentCount} students up a grade, or graduate them.
            Accounts, XP and history are kept — only the class changes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-8 min-w-[180px] rounded-lg border border-input bg-background px-2 text-sm"
          >
            <option value="">Move them to…</option>
            {others.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (grade {c.grade})
              </option>
            ))}
            <option value="graduate">Graduated — no class</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !target}
            onClick={move}
            className="font-code"
          >
            <GraduationCap className="mr-1.5 h-4 w-4" />
            Move students
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
