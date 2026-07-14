import { notFound } from "next/navigation";

import { ContestDetail } from "@/components/contest-detail";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ContestStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createServiceClient();
  const { data: contest } = await admin
    .from("contests")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!contest) notFound();

  return <ContestDetail contestId={id} currentUserId={user?.id ?? null} />;
}
