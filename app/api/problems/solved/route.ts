import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { solved: [] },
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } },
    );
  }

  const { data } = await supabase
    .from("submissions")
    .select("problem_id")
    .eq("user_id", user.id)
    .eq("verdict", "accepted");

  const solved = (data ?? []).map((s) => s.problem_id);

  return NextResponse.json(
    { solved },
    { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } },
  );
}
