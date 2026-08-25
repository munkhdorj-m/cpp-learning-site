"use client";

import { useState } from "react";
import { FolderGit2, Loader2, Plus, Trash2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StarterFile } from "@/lib/github-starter";

/**
 * Work the judge cannot mark.
 *
 * The teacher says what to do, how it may be handed in, and what it is out of.
 * Optionally they point at a GitHub repository and the starter code is copied
 * here — see lib/github-starter.ts for why the import happens once, now,
 * rather than once per student later.
 */

export interface TaskDraft {
  key: string;
  title: string;
  instructions: string;
  points: number;
  accept_file: boolean;
  accept_link: boolean;
  accept_text: boolean;
  accept_ide: boolean;
  starter_repo: string;
  starter_files: StarterFile[];
}

export function newTask(): TaskDraft {
  return {
    key: Math.random().toString(36).slice(2),
    title: "",
    instructions: "",
    points: 100,
    accept_file: true,
    accept_link: true,
    accept_text: true,
    accept_ide: false,
    starter_repo: "",
    starter_files: [],
  };
}

const WAYS = [
  ["accept_file", "A file"],
  ["accept_link", "A link"],
  ["accept_text", "Typed answer"],
  ["accept_ide", "Code in the editor"],
] as const;

function StarterImport({
  task,
  update,
}: {
  task: TaskDraft;
  update: (patch: Partial<TaskDraft>) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/github/starter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: task.starter_repo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "That repository could not be read.");
        return;
      }
      update({ starter_files: data.files as StarterFile[] });
    } catch {
      setError("Could not reach GitHub.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-primary/15 p-2.5">
      <Label className="flex items-center gap-1.5 text-xs">
        <FolderGit2 className="h-3.5 w-3.5" />
        Starter code from GitHub (optional)
      </Label>
      <div className="flex gap-2">
        <Input
          value={task.starter_repo}
          onChange={(e) =>
            update({ starter_repo: e.target.value, starter_files: [] })
          }
          placeholder="https://github.com/owner/repo"
          className="h-9 font-code text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy || !task.starter_repo.trim()}
          onClick={() => void load()}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Import"}
        </Button>
      </div>

      {task.starter_files.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-neon-lime">
          <Check className="h-3.5 w-3.5" />
          {task.starter_files.length} file
          {task.starter_files.length === 1 ? "" : "s"}:{" "}
          <span className="font-code">
            {task.starter_files.map((f) => f.name).join(", ")}
          </span>
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground">
        Copied here once. Each student opens their own copy in the editor —
        nobody needs a GitHub account.
      </p>
    </div>
  );
}

export function TasksEditor({
  tasks,
  onChange,
}: {
  tasks: TaskDraft[];
  onChange: (next: TaskDraft[]) => void;
}) {
  const update = (key: string, patch: Partial<TaskDraft>) =>
    onChange(tasks.map((t) => (t.key === key ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-3">
      {tasks.length === 0 && (
        <p className="text-sm text-muted-foreground">
          For work the judge cannot mark — an essay, a photo of working, a
          Python file, a notebook link.
        </p>
      )}

      {tasks.map((t, i) => (
        <div
          key={t.key}
          className="space-y-2.5 rounded-lg border border-primary/15 p-3"
        >
          <div className="flex items-center gap-2">
            <span className="hud-label shrink-0">{i + 1}</span>
            <Input
              value={t.title}
              onChange={(e) => update(t.key, { title: e.target.value })}
              placeholder="What are they doing?"
              maxLength={200}
              className="h-9"
            />
            <Input
              type="number"
              min={1}
              max={10000}
              value={t.points}
              onChange={(e) =>
                update(t.key, { points: Number(e.target.value) || 1 })
              }
              className="h-9 w-20 text-center font-code"
              aria-label="Points"
            />
            <button
              type="button"
              onClick={() => onChange(tasks.filter((x) => x.key !== t.key))}
              aria-label="Remove"
              className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <Textarea
            value={t.instructions}
            onChange={(e) => update(t.key, { instructions: e.target.value })}
            placeholder="Instructions (optional)"
            maxLength={4000}
            className="min-h-[64px] text-sm"
          />

          <div>
            <Label className="text-xs">How may they hand it in?</Label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {WAYS.map(([field, label]) => {
                const on = t[field];
                return (
                  <button
                    key={field}
                    type="button"
                    aria-pressed={on}
                    onClick={() => update(t.key, { [field]: !on })}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      on
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-primary/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {t.accept_ide && (
            <StarterImport task={t} update={(p) => update(t.key, p)} />
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...tasks, newTask()])}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Task
      </Button>
    </div>
  );
}
