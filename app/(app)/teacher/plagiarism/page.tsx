import { getTranslations, getLocale } from "next-intl/server";
import { ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createServiceClient } from "@/lib/supabase/server";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

import { PlagiarismList } from "./plagiarism-list";

export const dynamic = "force-dynamic";

export default async function PlagiarismPage() {
  const t = await getTranslations("teacher.plagiarism");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = createServiceClient();

  const { data: pairs } = await supabase
    .from("code_similarity")
    .select(
      "id, submission_a_id, submission_b_id, problem_id, class_id, similarity, reviewed, created_at",
    )
    .order("reviewed", { ascending: true })
    .order("similarity", { ascending: false })
    .order("created_at", { ascending: false });

  // Collect related IDs
  const subIds = Array.from(
    new Set(
      (pairs ?? []).flatMap((p) => [p.submission_a_id, p.submission_b_id]),
    ),
  );
  const problemIds = Array.from(new Set((pairs ?? []).map((p) => p.problem_id)));
  const classIds = Array.from(
    new Set((pairs ?? []).map((p) => p.class_id).filter((id): id is string => !!id)),
  );

  const [subsRes, probsRes, classesRes] = await Promise.all([
    subIds.length > 0
      ? supabase
          .from("submissions")
          .select("id, user_id, code, created_at")
          .in("id", subIds)
      : Promise.resolve({ data: [] as { id: string; user_id: string; code: string; created_at: string }[] }),
    problemIds.length > 0
      ? supabase
          .from("problems")
          .select("id, slug, title_mn, title_en")
          .in("id", problemIds)
      : Promise.resolve({ data: [] as { id: string; slug: string; title_mn: string; title_en: string | null }[] }),
    classIds.length > 0
      ? supabase.from("classes").select("id, name").in("id", classIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const subsById = new Map(
    (subsRes.data ?? []).map((s) => [s.id, s] as const),
  );
  const userIds = Array.from(new Set((subsRes.data ?? []).map((s) => s.user_id)));
  const { data: profileRows } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, username")
        .in("id", userIds)
    : { data: [] as { id: string; display_name: string; username: string }[] };
  const profilesById = new Map(
    (profileRows ?? []).map((p) => [p.id, p] as const),
  );
  const problemsById = new Map(
    (probsRes.data ?? []).map((p) => [p.id, p] as const),
  );
  const classesById = new Map((classesRes.data ?? []).map((c) => [c.id, c.name] as const));

  const items = (pairs ?? []).map((p) => {
    const subA = subsById.get(p.submission_a_id);
    const subB = subsById.get(p.submission_b_id);
    const probInfo = problemsById.get(p.problem_id);
    return {
      id: p.id,
      similarity: p.similarity,
      reviewed: p.reviewed,
      created_at: p.created_at,
      problem_slug: probInfo?.slug ?? null,
      problem_title:
        probInfo
          ? locale === "en" && probInfo.title_en
            ? probInfo.title_en
            : probInfo.title_mn
          : "—",
      class_name: p.class_id ? classesById.get(p.class_id) ?? "—" : "—",
      student_a: subA
        ? profilesById.get(subA.user_id)?.display_name ?? "?"
        : "?",
      student_b: subB
        ? profilesById.get(subB.user_id)?.display_name ?? "?"
        : "?",
      code_a: subA?.code ?? "",
      code_b: subB?.code ?? "",
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <p className="text-center text-muted-foreground py-12">{t("no_flags")}</p>
        </Card>
      ) : (
        <PlagiarismList items={items} />
      )}
    </div>
  );
}
