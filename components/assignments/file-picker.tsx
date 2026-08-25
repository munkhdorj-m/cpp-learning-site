"use client";

import { useRef, useState } from "react";
import { Paperclip, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Pick a file and put it on the server.
 *
 * Shared by the teacher attaching a worksheet and the student handing work in,
 * because the awkward parts are the same for both: the size limit has to be
 * said before the upload rather than after it, and a failure has to say what
 * went wrong in words rather than turning into a silent no-op.
 */

export interface PickedFile {
  id: string;
  name: string;
  bytes: number;
  mime: string;
}

export function FilePicker({
  value,
  onChange,
  accept,
  label = "Attach a file",
  maxMb = 10,
}: {
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  accept?: string;
  label?: string;
  maxMb?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (file: File) => {
    setError("");
    // Checked here as well as on the server: telling a student their photo is
    // too big before spending a minute of a school connection uploading it is
    // the difference between a limit and a punishment.
    if (file.size > maxMb * 1024 * 1024) {
      setError(
        `That file is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${maxMb} MB.`,
      );
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "That file could not be uploaded.");
        return;
      }
      onChange(data as PickedFile);
    } catch {
      setError("The upload did not go through. Check the connection.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2">
        <Paperclip className="h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate text-sm">{value.name}</span>
        <span className="shrink-0 font-code text-[11px] text-muted-foreground">
          {value.bytes < 1048576
            ? `${Math.round(value.bytes / 1024)} KB`
            : `${(value.bytes / 1048576).toFixed(1)} MB`}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove the file"
          className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void send(f);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        {busy ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="mr-1.5 h-4 w-4" />
        )}
        {busy ? "Uploading…" : label}
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Up to {maxMb} MB. PDFs, images, code and zips.
      </p>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
