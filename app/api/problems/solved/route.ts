import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { query } from "@/lib/mysql/pool";

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

  // Practice only. A problem solved for homework stays open here — that is
  // the whole point of the two tracks: homework should not use up the practice
  // a student could still get from a problem. See lib/assignment-track.ts.
  const data = await query<{ problem_id: string }>(
    `SELECT DISTINCT problem_id
       FROM submissions
      WHERE user_id = ?
        AND verdict = 'accepted'
        AND assignment_id IS NULL`,
    [user.id],
  );

  const solved = data.map((s) => s.problem_id);

  return NextResponse.json(
    { solved },
    { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } },
  );
}
