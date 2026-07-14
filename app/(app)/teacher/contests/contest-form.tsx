"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createContest, updateContest } from "@/app/actions/contests";
import type { Difficulty } from "@/types/database";

interface ClassOpt {
  id: string;
  name: string;
  grade: 7 | 8;
}

interface ProblemOpt {
  id: string;
  title: string;
  difficulty: Difficulty;
  xp_reward: number;
}

export interface ContestFormInitial {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  class_id: string | null;
  problems: { id: string; points: number }[];
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};

const ALL_CLASSES = "__all__";

function toLocalInput(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export function ContestForm({
  classes,
  problems,
  initial,
}: {
  classes: ClassOpt[];
  problems: ProblemOpt[];
  initial?: ContestFormInitial;
}) {
  const tField = useTranslations("teacher.assignments.field");
  const tDiff = useTranslations("problems.difficulty");

  const inAnHour = useMemo(() => new Date(Date.now() + 60 * 60 * 1000), []);
  const inTwoHours = useMemo(() => new Date(Date.now() + 2 * 60 * 60 * 1000), []);

  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startAt, setStartAt] = useState(
    initial?.start_at ?? toLocalInput(inAnHour),
  );
  const [endAt, setEndAt] = useState(
    initial?.end_at ?? toLocalInput(inTwoHours),
  );
  const [classId, setClassId] = useState<string>(
    initial?.class_id ?? ALL_CLASSES,
  );
  const [picked, setPicked] = useState<{ id: string; points: number }[]>(
    initial?.problems ?? [],
  );
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const pickedIds = new Set(picked.map((p) => p.id));
  const available = problems.filter(
    (p) =>
      !pickedIds.has(p.id) &&
      p.title.toLowerCase().includes(search.toLowerCase()),
  );
  const pickedProblems = picked
    .map((p) => ({ ...p, problem: problems.find((q) => q.id === p.id) }))
    .filter((p): p is typeof p & { problem: ProblemOpt } => !!p.problem);

  const handleSubmit = () => {
    if (picked.length === 0) {
      toast.error("Add at least one problem");
      return;
    }
    startTransition(async () => {
      const payload = {
        title,
        description: description || null,
        start_at: startAt,
        end_at: endAt,
        class_id: classId === ALL_CLASSES ? null : classId,
        problems: picked.map((p) => ({ problem_id: p.id, points: p.points })),
      };
      const res =
        isEdit && initial
          ? await updateContest(initial.id, payload)
          : await createContest(payload);
      if (res && "error" in res) toast.error(res.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={
              isEdit && initial
                ? `/teacher/contests/${initial.id}`
                : "/teacher/contests"
            }
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit contest" : "Create contest"}
          </h1>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={pending}
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {pending ? "..." : "Save"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2 space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Start</Label>
            <Input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>End</Label>
            <Input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label>Class (leave as All for open contests)</Label>
            <Select value={classId} onValueChange={(v) => v && setClassId(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CLASSES}>All students</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} (Grade {c.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tField("problems")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pickedProblems.length > 0 && (
            <div className="space-y-1.5">
              {pickedProblems.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2 rounded border bg-card"
                >
                  <Badge
                    variant="outline"
                    className={`${DIFFICULTY_STYLES[p.problem.difficulty]} border-0`}
                  >
                    {tDiff(p.problem.difficulty)}
                  </Badge>
                  <span className="flex-1 truncate text-sm">{p.problem.title}</span>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs">{tField("points")}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10000}
                      value={p.points}
                      onChange={(e) =>
                        setPicked((arr) =>
                          arr.map((q) =>
                            q.id === p.id
                              ? { ...q, points: Number(e.target.value) }
                              : q,
                          ),
                        )
                      }
                      className="w-20 h-8"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      setPicked((arr) => arr.filter((q) => q.id !== p.id))
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-72 overflow-y-auto divide-y border rounded">
            {available.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">—</p>
            ) : (
              available.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setPicked((arr) => [...arr, { id: p.id, points: 100 }])
                  }
                  className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left"
                >
                  <Badge
                    variant="outline"
                    className={`${DIFFICULTY_STYLES[p.difficulty]} border-0`}
                  >
                    {tDiff(p.difficulty)}
                  </Badge>
                  <span className="flex-1 truncate text-sm">{p.title}</span>
                  <span className="text-xs text-amber-600 tabular-nums">
                    {p.xp_reward} XP
                  </span>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
