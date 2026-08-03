import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { countByTopic } from "@/lib/problem-topics";

/**
 * How many problems sit under each Learn topic.
 *
 * Lesson pages are statically generated, so they cannot query the database
 * themselves. They fetch this instead, which lets a lesson hide its practice
 * link when no problem practises it yet. The answer is the same for everyone,
 * so it caches publicly.
 */
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("problems")
    .select("tags")
    .eq("is_public", true);

  const counts = countByTopic(
    ((data ?? []) as { tags: unknown }[]).map((p) => ({
      tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
    })),
  );

  return NextResponse.json(
    { counts },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
