import { notFound } from "next/navigation";

import { ContestDetail } from "@/components/contest-detail";
import { createServiceClient } from "@/lib/supabase/server";

import { ContestActions } from "./contest-actions";

export const dynamic = "force-dynamic";

export default async function TeacherContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
