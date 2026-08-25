import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getCachedProfile, getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import {
  MAX_UPLOAD_BYTES,
  displayName,
  isAllowedType,
  storeFile,
} from "@/lib/uploads";

/**
 * Take one file and keep it.
 *
 * Anyone signed in may upload: teachers attach materials, students hand work
 * in. What they may later READ is a different question, answered per file in
 * [id]/route.ts.
 */

// fs and Buffer — this cannot run on the edge.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Refuse on the declared length before reading a byte. Without this, a
  // 500 MB body is buffered into memory in full and only then rejected —
  // which on a 4 GB box is a way to take the site down rather than a limit.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 4096) {
    return NextResponse.json(
      { error: `That file is too big. The limit is ${MAX_UPLOAD_BYTES / 1048576} MB.` },
      { status: 413 },
    );
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const entry = form.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: "Could not read that upload." }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }

  const name = displayName(file.name);
  const mime = file.type || "application/octet-stream";
  if (!isAllowedType(mime, name)) {
    return NextResponse.json(
      { error: "That kind of file is not accepted." },
      { status: 415 },
    );
  }

  const data = Buffer.from(await file.arrayBuffer());

  try {
    const stored = await storeFile(data, mime, name);
    const id = randomUUID();
    await query(
      `INSERT INTO uploads (id, owner_id, original_name, mime, bytes, stored_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.id, name, mime, stored.bytes, stored.storedName],
    );
    return NextResponse.json({
      id,
      name,
      mime,
      bytes: stored.bytes,
    });
  } catch (e) {
    // storeFile's messages are written for a student to read.
    const message =
      e instanceof Error ? e.message : "That file could not be saved.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Teachers can see how much of the disk the site is using. */
export async function GET() {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const profile = await getCachedProfile(user.id);
  if (profile?.role !== "teacher") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const rows = await query<{ files: number; bytes: string | null }>(
    "SELECT COUNT(*) AS files, SUM(bytes) AS bytes FROM uploads",
  );
  return NextResponse.json(
    { files: rows[0]?.files ?? 0, bytes: Number(rows[0]?.bytes ?? 0) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
