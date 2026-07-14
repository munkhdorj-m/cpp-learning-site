"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Plus,
  Copy,
  RefreshCcw,
  Check,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createClass,
  updateClass,
  deleteClass,
  regenerateInviteCode,
} from "@/app/actions/classes";

interface Item {
  id: string;
  name: string;
  grade: 7 | 8;
  invite_code: string;
  students: number;
}

interface Labels {
  title: string;
  new: string;
  name: string;
  grade: string;
  invite_code: string;
  students: string;
  regenerate: string;
  create_title: string;
  create_button: string;
  no_classes: string;
  copy_code: string;
  code_copied: string;
  regenerate_confirm: string;
}

type DialogMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; id: string; initial: { name: string; grade: 7 | 8 } };

export function ClassesManager({
  items,
  labels,
}: {
  items: Item[];
  labels: Labels;
}) {
  const [mode, setMode] = useState<DialogMode>({ kind: "closed" });
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<"7" | "8">("7");
  const [pending, startTransition] = useTransition();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const openCreate = () => {
    setName("");
    setGrade("7");
    setMode({ kind: "create" });
  };
  const openEdit = (item: Item) => {
    setName(item.name);
    setGrade(item.grade === 7 ? "7" : "8");
    setMode({ kind: "edit", id: item.id, initial: { name: item.name, grade: item.grade } });
  };
  const closeDialog = () => setMode({ kind: "closed" });

  const handleSubmit = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      if (mode.kind === "edit") {
        const res = await updateClass(mode.id, {
          name: name.trim(),
          grade: grade === "7" ? 7 : 8,
        });
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
      } else {
        const fd = new FormData();
        fd.set("name", name.trim());
        fd.set("grade", grade);
        const res = await createClass(fd);
        if ("error" in res) {
          toast.error(res.error);
          return;
        }
      }
      closeDialog();
    });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(labels.code_copied);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRegenerate = (classId: string) => {
    if (!confirm(labels.regenerate_confirm)) return;
    startTransition(async () => {
      const res = await regenerateInviteCode(classId);
      if ("error" in res) toast.error(res.error);
    });
  };

  const handleDelete = (item: Item) => {
    if (
      !confirm(
        `Delete class "${item.name}"? Students will be unassigned. This cannot be undone.`,
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteClass(item.id);
      if ("error" in res) toast.error(res.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{labels.title}</h1>
        <Dialog
          open={mode.kind !== "closed"}
          onOpenChange={(open) => (open ? openCreate() : closeDialog())}
        >
          <DialogTrigger
            render={
              <Button
                className="bg-violet-600 text-white hover:bg-violet-700"
                size="sm"
                onClick={openCreate}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {labels.new}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {mode.kind === "edit" ? "Edit class" : labels.create_title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="class-name">{labels.name}</Label>
                <Input
                  id="class-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="7A"
                  maxLength={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{labels.grade}</Label>
                <Select value={grade} onValueChange={(v) => v && setGrade(v as "7" | "8")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={pending || !name.trim()}
                className="bg-violet-600 text-white hover:bg-violet-700"
              >
                {mode.kind === "edit" ? "Save" : labels.create_button}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">
            {labels.no_classes}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="hidden sm:grid grid-cols-[100px_60px_1fr_80px_180px] gap-3 px-4 py-2 border-b text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <div>{labels.name}</div>
            <div>{labels.grade}</div>
            <div>{labels.invite_code}</div>
            <div className="text-right">{labels.students}</div>
            <div></div>
          </div>
          <div className="divide-y">
            {items.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[100px_60px_1fr_80px_180px] gap-3 px-4 py-3 items-center"
              >
                <Link
                  href={`/teacher/classes/${c.id}`}
                  className="font-semibold sm:font-medium hover:text-violet-600 inline-flex items-center gap-1 group"
                >
                  {c.name}
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
                </Link>
                <div className="text-sm text-muted-foreground tabular-nums hidden sm:block">
                  {c.grade}
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <code className="px-2 py-1 rounded bg-muted font-mono text-xs">
                    {c.invite_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleCopy(c.invite_code)}
                    aria-label="Copy"
                  >
                    {copiedCode === c.invite_code ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <div className="text-right text-sm tabular-nums hidden sm:block">
                  {c.students}
                </div>
                <div className="flex items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(c)}
                    aria-label="Edit"
                    disabled={pending}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRegenerate(c.id)}
                    aria-label="Regenerate code"
                    disabled={pending}
                    title={labels.regenerate}
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(c)}
                    aria-label="Delete"
                    disabled={pending}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
