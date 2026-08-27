"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageSquarePlus, Search, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { startThread } from "@/app/actions/messages";

/**
 * A teacher starting a conversation with one student.
 *
 * The picker is a filter over a list rather than a dropdown: a school has
 * hundreds of students, and finding one in a native select means scrolling
 * past every other name in the register. Typing three letters is faster than
 * any list can be.
 *
 * Collapsed by default — the page is a queue of questions to answer, and a
 * compose form sitting permanently at the top of it is in the way.
 */
export function NewThreadForm({
  students,
}: {
  students: { id: string; display_name: string; class_name: string | null }[];
}) {
  const t = useTranslations("messages");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const chosen = students.find((s) => s.id === studentId) ?? null;

  const matches = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return [];
    return students
      .filter(
        (s) =>
          s.display_name.toLowerCase().includes(needle) ||
          (s.class_name ?? "").toLowerCase().includes(needle),
      )
      .slice(0, 8);
  }, [students, filter]);

  const reset = () => {
    setFilter("");
    setStudentId("");
    setSubject("");
    setBody("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await startThread({ subject, body, studentId });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      reset();
      setOpen(false);
      toast.success(t("sent"));
      if (res.threadId) router.push(`/messages/${res.threadId}`);
      else router.refresh();
    });
  };

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <MessageSquarePlus className="mr-1.5 h-4 w-4" />
        {t("new_thread")}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="space-y-3">
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">{"//"}</span>
            {t("new_thread")}
            <button
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="ml-auto text-muted-foreground hover:text-foreground"
              aria-label={t("cancel")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {chosen ? (
            <div className="flex items-center gap-2 border border-primary/30 bg-primary/[0.07] px-3 py-2 text-sm">
              <span className="font-semibold">{chosen.display_name}</span>
              {chosen.class_name && (
                <span className="font-code text-xs text-muted-foreground">
                  {chosen.class_name}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setStudentId("");
                  setFilter("");
                }}
                className="ml-auto text-muted-foreground hover:text-foreground"
                aria-label={t("change_student")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={t("find_student")}
                  aria-label={t("find_student")}
                  className="h-9 pl-8"
                  autoFocus
                />
              </div>
              {filter.trim() !== "" && (
                <div className="max-h-56 overflow-y-auto border border-border">
                  {matches.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground">
                      {t("no_student_match")}
                    </p>
                  ) : (
                    matches.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStudentId(s.id)}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                          "hover:bg-muted/60",
                        )}
                      >
                        <span className="flex-1 truncate">{s.display_name}</span>
                        {s.class_name && (
                          <span className="shrink-0 font-code text-[11px] text-muted-foreground">
                            {s.class_name}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("subject_placeholder")}
            aria-label={t("subject")}
            maxLength={200}
            required
          />
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("teacher_body_placeholder")}
            aria-label={t("message")}
            maxLength={4000}
            rows={4}
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={pending || !studentId || !subject.trim() || !body.trim()}
            >
              <Send className="mr-1.5 h-4 w-4" />
              {pending ? "…" : t("send")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
