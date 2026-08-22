"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { readDone, setDone, pullDone } from "@/lib/lesson-progress";

/**
 * Marks a Cambridge topic as read.
 *
 * The same control the lessons have, so a student's revision progress across
 * 46 topics is something they — and their teacher — can actually see.
 */
export function TopicDone({ slug }: { slug: string }) {
  const [done, setDoneState] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDoneState(readDone("cambridge"));
    void pullDone("cambridge").then(setDoneState);
  }, [slug]);

  const isDone = done.has(slug);

  return (
    <Button
      onClick={() => setDoneState(setDone(slug, !isDone, "cambridge"))}
      variant={isDone ? "outline" : "default"}
      className="w-full font-code sm:w-auto"
    >
      <CheckCircle2 className="mr-1.5 h-4 w-4" />
      {isDone ? "Revised — undo" : "I have revised this"}
    </Button>
  );
}
