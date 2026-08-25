import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth-helpers";
import { unreadCount } from "@/lib/messages";

/**
 * How many messages are waiting for whoever is asking.
 *
 * The header badge polls this. There is no realtime transport on this stack —
 * Passenger fronts a plain Next handler, with nowhere to attach a socket — so
 * a small poll is the honest option. It reads one indexed COUNT and returns a
 * single number.
 */
export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }

  try {
    const count = await unreadCount(profile.id, profile.role);
    return NextResponse.json(
      { count },
      // Never cached: a stale badge is worse than no badge.
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // The tables arrive with a migration run by hand. Until then this is
    // simply zero rather than a red error in every student's console.
    return NextResponse.json({ count: 0 });
  }
}
