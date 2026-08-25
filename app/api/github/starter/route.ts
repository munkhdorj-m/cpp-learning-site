import { NextResponse } from "next/server";
import { z } from "zod";

import { getCachedProfile, getCachedSession } from "@/lib/get-session";
import { fetchStarterFiles } from "@/lib/github-starter";

/**
 * Preview the starter code in a repository, for the teacher setting the task.
 *
 * Teachers only, and deliberately so: this makes the server fetch a URL that
 * somebody typed, and letting any signed-in student do that turns the site
 * into a way to probe whatever the server can reach. lib/github-starter.ts
 * only ever talks to github.com, but the guard is here as well because the
 * expensive mistake is the one where both layers assumed the other checked.
 */

export const runtime = "nodejs";

const body = z.object({ url: z.string().trim().min(1).max(500) });

export async function POST(request: Request) {
  const user = await getCachedSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const profile = await getCachedProfile(user.id);
  if (profile?.role !== "teacher") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Send a repository URL." }, { status: 400 });
  }

  try {
    const { files, ref } = await fetchStarterFiles(parsed.data.url);
    return NextResponse.json({
      repo: `${ref.owner}/${ref.repo}${ref.dir ? "/" + ref.dir : ""}`,
      branch: ref.ref,
      files,
    });
  } catch (e) {
    // fetchStarterFiles writes its messages for a teacher to read.
    const message =
      e instanceof Error ? e.message : "That repository could not be read.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
