import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { query } from "@/lib/mysql/pool";
import { hasTable } from "@/lib/mysql/has-table";
import {
  BUCKET_KEY,
  BUCKET_ORDER,
  bucketFor,
  buildAssignmentListQuery,
  type Bucket,
} from "@/lib/assignments";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/**
 * A student's assignments, sorted by what they still have to do.
 *
 * It used to group by the calendar — active, upcoming, past — which answers a
 * question nobody asks. What a student wants to know is what is left, and the
 * old page could not tell them: it had no notion of finishing anything. The
 * groups are now the four states an assignment is actually in, and the one
 * that matters is at the top.
 */

interface Row {
  id: string;
  title: string;
  start_at: string;
  due_at: string;
  allow_late: number;
  turned_in_at: string | null;
  late: number | null;
  problems: number;
  solved: number;
  points: number;
  earned: number;
  tasks: number;
  handed_in: number;
}

export default async function StudentAssignmentsPage() {
  await requireAuth();

  const t = await getTranslations("assignments");
  const localeRaw = await getLocale();
  const locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // One query. The old page made four round trips and then did the arithmetic
  // in JavaScript; with a term's worth of assignments that is a lot of rows
  // pulled across the wire to count them.
  //
  // Every subselect is scoped to this student, and the assignment list itself
  // is scoped to their class — a student cannot see another class's work.
  // Migrations are applied by hand here, so the code can land before the
  // tables do. Ask first, and leave out the columns whose tables are not there
  // yet rather than throwing ER_NO_SUCH_TABLE at every student in the school.
  const [hasTurnins, hasTasks] = await Promise.all([
    hasTable("assignment_turnins"),
    hasTable("assignment_tasks"),
  ]);

  const { sql, params } = buildAssignmentListQuery({
    userId: user.id,
    hasTurnins,
    hasTasks,
  });
  const rows = await query<Row>(sql, params);

  const now = Date.now();
  const grouped = new Map<Bucket, Row[]>();
  for (const r of rows) {
    const bucket = bucketFor(
      {
        startAt: r.start_at,
        dueAt: r.due_at,
        allowLate: !!r.allow_late,
        turnedIn: !!r.turned_in_at,
      },
      now,
    );
    if (!grouped.has(bucket)) grouped.set(bucket, []);
    grouped.get(bucket)!.push(r);
  }

  // Inside a group: soonest deadline first, except the ones already behind
  // you, where the most recent is the interesting end.
  for (const [b, list] of grouped) {
    list.sort((x, y) => {
      const dx = new Date(x.due_at).getTime();
      const dy = new Date(y.due_at).getTime();
      return b === "done" || b === "missed" ? dy - dx : dx - dy;
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <div className="hud-label flex items-center gap-2">
          <span className="text-primary">{"//"}</span>
          ASSIGNMENTS
        </div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="py-12 text-center text-muted-foreground">{t("none")}</p>
        </Card>
      ) : (
        BUCKET_ORDER.filter((b) => grouped.has(b)).map((bucket) => (
          <div key={bucket} className="space-y-2">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {bucket === "missed" && (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              )}
              {t(BUCKET_KEY[bucket])}
              <span className="font-code text-[10px] font-normal opacity-60 tabular-nums">
                {grouped.get(bucket)!.length}
              </span>
            </h2>
            <div className="grid gap-2">
              {grouped.get(bucket)!.map((a) => (
                <AssignmentCard
                  key={a.id}
                  row={a}
                  bucket={bucket}
                  locale={locale}
                  labels={{
                    due: t("due"),
                    pts: t("pts_short"),
                    late: t("late"),
                  }}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AssignmentCard({
  row,
  bucket,
  locale,
  labels,
}: {
  row: Row;
  bucket: Bucket;
  locale: string;
  labels: { due: string; pts: string; late: string };
}) {
  const done = bucket === "turned_in" || bucket === "done";
  const missed = bucket === "missed";

  // Problems and tasks are both work, so both count toward the bar. An
  // assignment with neither is a worksheet: there is nothing to fill in, and a
  // bar stuck at zero would read as "you have not started" when there is
  // nothing to start.
  const totalWork = Number(row.problems) + Number(row.tasks);
  const doneWork = Number(row.solved) + Number(row.handed_in);
  const pct = totalWork > 0 ? (doneWork / totalWork) * 100 : 0;
  const points = Number(row.points);
  const earned = Number(row.earned);

  return (
    <Link href={`/assignments/${row.id}`}>
      <Card
        className={cn(
          "hud-hover transition-colors",
          done && "border-signal-ok/40 bg-signal-ok/[0.05]",
          missed && "border-destructive/35",
          bucket === "done" && "opacity-75",
        )}
      >
        <div className="flex items-center gap-3 p-4">
          <span className="shrink-0">
            {done ? (
              <CheckCircle2 className="h-5 w-5 text-signal-ok" />
            ) : missed ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : bucket === "upcoming" ? (
              <Clock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">
              {row.title}
              {done && !!row.late && (
                <span className="ml-2 font-code text-[10px] text-neon-amber">
                  {labels.late}
                </span>
              )}
            </div>
            {totalWork > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 max-w-[140px] flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full transition-all",
                      doneWork >= totalWork ? "bg-signal-ok" : "bg-primary",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-code text-[11px] tabular-nums text-muted-foreground">
                  {doneWork} / {totalWork}
                </span>
              </div>
            )}
          </div>

          {/* Points, which the list never used to show at all — a student had
              to open every assignment to find out which one was worth doing. */}
          {points > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 font-code text-xs font-semibold tabular-nums text-arcade-yellow">
              <Sparkles className="h-3 w-3" />
              {earned}/{points} {labels.pts}
            </span>
          )}

          <span className="inline-flex shrink-0 items-center gap-1.5 font-code text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(row.due_at).toLocaleDateString(locale, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </Card>
    </Link>
  );
}
