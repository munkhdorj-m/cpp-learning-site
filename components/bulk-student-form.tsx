"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { UserPlus, Printer, Eye, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Generated {
  displayName: string;
  username: string;
  password: string;
}

export function BulkStudentForm({
  classId,
  className,
  siteUrl,
}: {
  classId: string;
  className: string;
  siteUrl: string;
}) {
  const router = useRouter();
  const [names, setNames] = useState("");
  const [preview, setPreview] = useState<
    { displayName: string; username: string }[] | null
  >(null);
  const [created, setCreated] = useState<Generated[] | null>(null);
  const [busy, setBusy] = useState(false);

  const nameList = names
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);

  const call = async (isPreview: boolean) => {
    if (nameList.length === 0) {
      toast.error("Add at least one name");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/teacher/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          names: nameList,
          preview: isPreview,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed");
        return;
      }
      if (isPreview) {
        setPreview(data.students);
        setCreated(null);
      } else {
        setCreated(data.students);
        setPreview(null);
        setNames("");
        toast.success(
          `Created ${data.created} account${data.created === 1 ? "" : "s"}` +
            (data.skipped ? ` · ${data.skipped} skipped` : ""),
        );
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div>
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">{"//"}</span>
            ADD STUDENTS
          </div>
          <p className="text-sm text-muted-foreground">
            One name per line. Logins and passwords are generated for you.
          </p>
        </div>

        <Textarea
          value={names}
          onChange={(e) => setNames(e.target.value)}
          rows={6}
          placeholder={"Бат Дорж\nСараа Мөнх\nТувшин Эрдэнэ"}
          className="font-mono text-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-code text-xs text-muted-foreground">
            {nameList.length} name{nameList.length === 1 ? "" : "s"}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || nameList.length === 0}
            onClick={() => call(true)}
            className="ml-auto"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            Preview
          </Button>
          <Button
            size="sm"
            disabled={busy || nameList.length === 0}
            onClick={() => call(false)}
            className="font-code"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Create accounts
          </Button>
        </div>

        {preview && (
          <div className="rounded-lg border border-primary/20 p-3">
            <div className="hud-label mb-2">PREVIEW — nothing created yet</div>
            <ul className="space-y-1 font-mono text-xs">
              {preview.map((s) => (
                <li key={s.username} className="flex justify-between gap-3">
                  <span className="truncate">{s.displayName}</span>
                  <span className="text-primary">{s.username}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {created && created.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-neon-amber/40 bg-neon-amber/10 p-2.5 text-xs text-neon-amber">
              <Check className="h-4 w-4 shrink-0" />
              Print or write these down now — passwords are stored encrypted and
              cannot be shown again.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="font-code"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              Print slips
            </Button>

            {/* On screen: the slips as a normal part of the card. */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {created.map((s) => (
                <Slip
                  key={s.username}
                  student={s}
                  className={className}
                  siteUrl={siteUrl}
                />
              ))}
            </div>

            {/* On paper: the same slips, but attached directly to <body> so
                the print stylesheet can hide every sibling outright. Hiding
                them in place would leave their space behind as blank pages,
                and an absolutely positioned sheet lands wherever the nearest
                positioned ancestor happens to be. */}
            <PrintSheet>
              <div className="print-only">
                {className} · {siteUrl} · {new Date().toLocaleDateString()}
              </div>
              <div className="print-slips">
                {created.map((s) => (
                  <Slip
                    key={s.username}
                    student={s}
                    className={className}
                    siteUrl={siteUrl}
                  />
                ))}
              </div>
            </PrintSheet>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Slip({
  student,
  className,
  siteUrl,
}: {
  student: Generated;
  className: string;
  siteUrl: string;
}) {
  return (
    <div className="rounded-lg border border-primary/25 p-3">
      <div className="text-sm font-semibold">{student.displayName}</div>
      <div className="text-[11px] text-muted-foreground">
        {className} · {siteUrl}
      </div>
      <dl className="mt-1.5 font-mono text-sm">
        <div className="flex gap-2">
          <dt className="text-muted-foreground">user:</dt>
          <dd className="font-bold">{student.username}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">pass:</dt>
          <dd className="font-bold">{student.password}</dd>
        </div>
      </dl>
    </div>
  );
}

/** Renders its children as a direct child of <body>, for printing only. */
function PrintSheet({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return createPortal(
    <div className="print-sheet">{children}</div>,
    document.body,
  );
}
