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
import { startThread } from "@/app/actions/messages";

/** A student asking a new question. */
export function AskForm() {
  const t = useTranslations("messages");
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await startThread({ subject, body });
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
            <Button type="submit" disabled={pending || !subject.trim() || !body.trim()}>
              <Send className="mr-1.5 h-4 w-4" />
              {pending ? "…" : t("send")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
