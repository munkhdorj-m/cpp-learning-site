"use client";

import { Link2, Paperclip, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePicker, type PickedFile } from "./file-picker";

/**
 * What the teacher attaches for students to read.
 *
 * Two kinds only. A link covers a video, a Google Doc, a repository, a past
 * paper on someone else's site. A file covers the worksheet that only exists
 * as a PDF on the teacher's laptop, which is the case the site could not
 * handle at all before.
 */

export interface MaterialDraft {
  key: string;
  kind: "link" | "file";
  title: string;
  url: string;
  file: PickedFile | null;
}

export function newMaterial(kind: "link" | "file"): MaterialDraft {
  return {
    key: Math.random().toString(36).slice(2),
    kind,
    title: "",
    url: "",
    file: null,
  };
}

export function MaterialsEditor({
  materials,
  onChange,
}: {
  materials: MaterialDraft[];
  onChange: (next: MaterialDraft[]) => void;
}) {
  const update = (key: string, patch: Partial<MaterialDraft>) =>
    onChange(materials.map((m) => (m.key === key ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-3">
      {materials.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nothing attached yet. Add a link or a file students should read.
        </p>
      )}

      {materials.map((m) => (
        <div
          key={m.key}
          className="space-y-2 rounded-lg border border-primary/15 p-3"
        >
          <div className="flex items-center gap-2">
            {m.kind === "link" ? (
              <Link2 className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Paperclip className="h-4 w-4 shrink-0 text-primary" />
            )}
            <Input
              value={m.title}
              onChange={(e) => update(m.key, { title: e.target.value })}
              placeholder={
                m.kind === "link" ? "What is this link?" : "What is this file?"
              }
              maxLength={200}
              className="h-9"
            />
            <button
              type="button"
              onClick={() => onChange(materials.filter((x) => x.key !== m.key))}
              aria-label="Remove"
              className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {m.kind === "link" ? (
            <Input
              value={m.url}
              onChange={(e) => update(m.key, { url: e.target.value })}
              placeholder="https://…"
              inputMode="url"
              className="h-9 font-code text-xs"
            />
          ) : (
            <FilePicker
              value={m.file}
              onChange={(file) => update(m.key, { file })}
              label="Choose the file"
            />
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...materials, newMaterial("link")])}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...materials, newMaterial("file")])}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          File
        </Button>
      </div>
    </div>
  );
}
