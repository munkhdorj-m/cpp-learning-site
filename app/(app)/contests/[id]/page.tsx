import { notFound } from "next/navigation";

import { ContestDetail } from "@/components/contest-detail";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function ContestStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // renders a named student roster — verified high-severity leak
  await requireAuth();

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
