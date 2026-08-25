"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  FolderGit2,
  Loader2,
  Send,
  Undo2,
  Paperclip,
  Link2,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  handInTask,
  startFromStarter,
  withdrawHandIn,
} from "@/app/actions/assignment-work";
import { FilePicker, type PickedFile } from "./file-picker";

/**
 * One task, from the student's side.
 *
 * Handing in again replaces what was there and clears any mark — the teacher
 * marked what was handed in, and once that changes the mark is about something
 * that is no longer there.
 */

export interface TaskView {
  id: string;
  title: string;
  instructions: string | null;
  points: number;
  accept_file: boolean;
  accept_link: boolean;
  accept_text: boolean;
  accept_ide: boolean;
  has_starter: boolean;
  /** The student's current hand-in, if they have made one. */
  mine: {
    note: string | null;
    link: string | null;
    upload_id: string | null;
    upload_name: string | null;
    ide_project_id: string | null;
    submitted_at: string;
    score: number | null;
    feedback: string | null;
  } | null;
}

export function HandIn({ task, open }: { task: TaskView; open: boolean }) {
  const [note, setNote] = useState(task.mine?.note ?? "");
  const [link, setLink] = useState(task.mine?.link ?? "");
  const [file, setFile] = useState<PickedFile | null>(
    task.mine?.upload_id && task.mine.upload_name
      ? {
          id: task.mine.upload_id,
          name: task.mine.upload_name,
          bytes: 0,
          mime: "",
        }
      : null,
  );
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(!task.mine);

  const marked = task.mine?.score !== null && task.mine?.score !== undefined;

  const submit = () =>
    start(async () => {
      const res = await handInTask(task.id, {
        note,
        link,
        upload_id: file?.id ?? null,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Handed in.");
        setEditing(false);
      }
    });

  const withdraw = () =>
    start(async () => {
      const res = await withdrawHandIn(task.id);
      if (res?.error) toast.error(res.error);
      else {
        setNote("");
        setLink("");
        setFile(null);
        setEditing(true);
        toast.success("Taken back.");
      }
    });

  const openStarter = () =>
    start(async () => {
      const res = await startFromStarter(task.id);
      if (res?.error) toast.error(res.error);
      else toast.success("Copied into your editor. Open Code editor to start.");
    });

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 p-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className="font-semibold">{task.title}</h3>
        <span className="ml-auto font-code text-xs text-muted-foreground">
          {marked ? `${task.mine?.score} / ${task.points}` : `${task.points} pts`}
        </span>
      </div>

      {task.instructions && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {task.instructions}
        </p>
      )}

      {task.has_starter && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={openStarter}
        >
          <FolderGit2 className="mr-1.5 h-4 w-4" />
          Copy the starter code to my editor
        </Button>
      )}

      {/* What they already handed in */}
      {task.mine && !editing && (
        <div className="space-y-2 rounded-lg border border-neon-lime/30 bg-neon-lime/[0.06] p-3">
          <p className="flex items-center gap-1.5 text-sm text-neon-lime">
            <Check className="h-4 w-4" />
            Handed in{" "}
            {new Date(task.mine.submitted_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          {task.mine.upload_id && (
            <a
              href={`/api/uploads/${task.mine.upload_id}`}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Paperclip className="h-3.5 w-3.5" />
              {task.mine.upload_name}
            </a>
          )}
          {task.mine.link && (
            <a
              href={task.mine.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 truncate text-sm text-primary hover:underline"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              {task.mine.link}
            </a>
          )}
          {task.mine.note && (
            <p className="whitespace-pre-wrap text-sm">{task.mine.note}</p>
          )}

          {marked && task.mine.feedback && (
            <p className="rounded border border-primary/20 bg-background/40 p-2.5 text-sm">
              <span className="hud-label mr-1.5">FEEDBACK</span>
              {task.mine.feedback}
            </p>
          )}

          {open && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                disabled={pending}
              >
                Change it
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={withdraw}
                disabled={pending}
              >
                <Undo2 className="mr-1.5 h-4 w-4" />
                Take it back
              </Button>
            </div>
          )}
        </div>
      )}

      {/* The form */}
      {open && editing && (
        <div className="space-y-2.5">
          {task.accept_file && (
            <FilePicker value={file} onChange={setFile} label="Attach my work" />
          )}
          {task.accept_link && (
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://… a document, notebook or repository"
              inputMode="url"
              className="h-9 font-code text-xs"
              aria-label="A link to my work"
            />
          )}
          {task.accept_text && (
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type your answer"
              className="min-h-[90px] text-sm"
              aria-label="My answer"
            />
          )}
          {task.accept_ide && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Code2 className="h-3.5 w-3.5" />
              Working in the{" "}
              <Link href="/ide" className="text-primary hover:underline">
                code editor
              </Link>
              ? Save it there, then attach it here as a file.
            </p>
          )}

          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={submit} disabled={pending}>
              {pending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Hand in
            </Button>
            {task.mine && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={pending}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {!open && !task.mine && (
        <p className="text-sm text-muted-foreground">
          The deadline has passed and late work is not accepted.
        </p>
      )}
    </div>
  );
}
