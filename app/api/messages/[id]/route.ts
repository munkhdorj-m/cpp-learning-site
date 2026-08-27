import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth-helpers";
import { loadConversation, mayReadThread } from "@/lib/messages";

/**
 * One conversation's messages, for the open thread to poll.
 *
 * Polling rather than a socket or SSE: the app runs behind Phusion Passenger
 * on cPanel, which hands each request to a plain Next handler and offers
 * nowhere to hold a connection open. Passenger also buffers responses and
 * times idle ones out, so a long-lived stream is a coin flip on this host and
 * a short poll is not.
 *
 * The whole thread comes back rather than a delta. School threads are a
 * handful of messages, a cursor is one more thing to get subtly wrong at the
 * boundary (two messages in the same millisecond), and replacing the list
 * wholesale means the client can never drift out of step with the server.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { thread, messages } = await loadConversation(id);
    // Same answer for "does not exist" and "not yours": a 404 that only
    // appears for real threads tells you which ids are real.
    if (!thread || !mayReadThread(thread, profile)) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        closed: !!thread.closed_at,
        messages: messages.map((m) => ({
          id: m.id,
          sender_id: m.sender_id,
          sender_name: m.sender_name,
          from_teacher: !!m.from_teacher,
          body: m.body,
          created_at: m.created_at,
          read_at: m.read_at,
          upload_id: m.upload_id ?? null,
          upload_name: m.upload_name ?? null,
          upload_mime: m.upload_mime ?? null,
          upload_bytes: m.upload_bytes ?? null,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    // The tables arrive with a migration run by hand. Until then this is an
    // empty conversation, not a red error every few seconds in the console.
    return NextResponse.json({ closed: false, messages: [] });
  }
}
