import { NextResponse } from "next/server";
import { z } from "zod";

import { Judge0RateLimitError, runOnce } from "@/lib/judge0";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const schema = z.object({
  code: z.string().min(1).max(100_000),
  stdin: z.string().max(100_000).default(""),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const result = await runOnce({
      source: parsed.data.code,
      stdin: parsed.data.stdin,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Judge0RateLimitError) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    return NextResponse.json({ error: "judge_error" }, { status: 500 });
  }
}
