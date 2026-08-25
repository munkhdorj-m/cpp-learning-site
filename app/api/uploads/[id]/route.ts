import { NextResponse } from "next/server";

import { getCachedProfile, getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { readFile, removeFile, servesInline } from "@/lib/uploads";

/**
 * Hand back one file, to someone entitled to it.
 *
 * This route exists because the alternative — dropping uploads into public/ —
 * would publish every one of them to anyone who could guess a URL. An
 * assignment PDF may be next week's test, and a hand-in is a student's own
 * work that their classmates have no business reading.
 */

export const runtime = "nodejs";

interface UploadRow {
  id: string;
  owner_id: string | null;
  original_name: string;
  mime: string;
  bytes: number;
  stored_name: string;
}

/**
 * May this person read this file?
 *
 * - Their own upload: yes. That covers every hand-in a student made.
 * - A teacher: yes. They set the work and mark it.
 * - A student: only when the file is attached to an assignment set for their
 *   own class. Not a classmate's hand-in, and not another class's worksheet.
 */
async function mayRead(
  upload: UploadRow,
  userId: string,
  role: string | undefined,
): Promise<boolean> {
  if (upload.owner_id === userId) return true;
  if (role === "teacher") return true;

  const rows = await query<{ ok: number }>(
    `SELECT 1 AS ok
       FROM assignment_materials m
       JOIN assignments a  ON a.id = m.assignment_id
       JOIN profiles     p ON p.id = ?
      WHERE m.upload_id = ?
        AND p.class_id  = a.class_id
      LIMIT 1`,
    [userId, upload.id],
  );
  return rows.length > 0;
}

async function load(id: string): Promise<UploadRow | null> {
  const rows = await query<UploadRow>(
    `SELECT id, owner_id, original_name, mime, bytes, stored_name
       FROM uploads WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const upload = await load(id);
  // The same answer whether the file is missing or forbidden: telling someone
  // which of the two it is lets them enumerate what exists.
  const profile = await getCachedProfile(user.id);
  if (!upload || !(await mayRead(upload, user.id, profile?.role))) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let body: Buffer;
  try {
    body = await readFile(upload.stored_name);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Only a short list renders in place; everything else downloads. See the
  // note in lib/uploads.ts about serving user files from our own origin.
  const inline = servesInline(upload.mime);
  const filename = upload.original_name.replace(/"/g, "");

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": inline ? upload.mime : "application/octet-stream",
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      // Belt and braces against a file whose bytes disagree with its declared
      // type: no sniffing, no framing, and nothing the page could execute.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox; frame-ancestors 'none'",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

/** Remove a file. Its owner, or a teacher tidying up. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const upload = await load(id);
  if (!upload) return NextResponse.json({ ok: true });

  const profile = await getCachedProfile(user.id);
  if (upload.owner_id !== user.id && profile?.role !== "teacher") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Row first: a row with no file is a broken download, but a file with no row
  // is invisible rubbish that nothing will ever clean up.
  await query("DELETE FROM uploads WHERE id = ?", [id]);
  await removeFile(upload.stored_name);
  return NextResponse.json({ ok: true });
}
