"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startThread } from "@/app/actions/messages";

/** A student asking a new question, of a teacher they pick. */
export function AskForm({
  teachers,
}: {
  teachers: { id: string; display_name: string }[];
}) {
  const t = useTranslations("messages");
  const router = useRouter();
  // Pre-selected when there is only one teacher, which is the common case
  // in a small school — no point making someone choose from a list of one.
  const [teacherId, setTeacherId] = useState(
    teachers.length === 1 ? teachers[0].id : "",
  );
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await startThread({ subject, body, teacherId });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setSubject("");
      setBody("");
      toast.success(t("sent"));
      if (res.threadId) router.push(`/messages/${res.threadId}`);
      else router.refresh();
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="space-y-3">
          <div className="hud-label flex items-center gap-2">
            <span className="text-primary">{"//"}</span>
            {t("ask_title")}
          </div>
          {/* Who it goes to. Only this teacher will ever see it. */}
          <div className="space-y-1.5">
            <Label htmlFor="ask-teacher">{t("to_teacher")}</Label>
            <Select
              value={teacherId}
              onValueChange={(v) => v && setTeacherId(v)}
            >
              <SelectTrigger id="ask-teacher">
                <SelectValue placeholder={t("pick_teacher")} />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((tt) => (
                  <SelectItem key={tt.id} value={tt.id}>
                    {tt.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            placeholder={t("body_placeholder")}
            aria-label={t("your_question")}
            maxLength={4000}
            rows={4}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !teacherId || !subject.trim() || !body.trim()}>
              <Send className="mr-1.5 h-4 w-4" />
              {pending ? "…" : t("send")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
