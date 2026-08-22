import { notFound } from "next/navigation";

import { ContestDetail } from "@/components/contest-detail";
import { createServiceClient } from "@/lib/supabase/server";

import { ContestActions } from "./contest-actions";
import { requireTeacher } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function TeacherContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The layout calls this too, but a layout's redirect does not stop
  // this page rendering: React renders them together, and whatever the
  // page produced is flushed into the redirect response for anyone who
  // reads the body instead of following the Location header.
  await requireTeacher();

  const { id } = await params;
  const supabase = createServiceClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();
  if (!contest) notFound();

  return (
    <ContestDetail
      contestId={id}
      headerActions={<ContestActions id={id} title={contest.title} />}
    />
  );
}
