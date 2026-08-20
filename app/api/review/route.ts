import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";

import { getCachedSession } from "@/lib/get-session";
import { query } from "@/lib/mysql/pool";
import { resolveItem, type ReviewCard } from "@/lib/progress/items";
import { today } from "@/lib/progress/schedule";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";

/**
 * The questions a student is due to see again.
 *
 * Ordered by how long they have been waiting, and capped: a queue of forty is
 * something a student abandons, so it is better to hand over a handful and let
 * them come back tomorrow.
 */
const LIMIT = 12;

export async function GET() {
  const user = await getCachedSession();
  if (!user) return NextResponse.json({ cards: [], due: 0 });

  const localeRaw = await getLocale();
  const en = (isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE) === "en";

  try {
    const rows = await query<{ item_key: string }>(
      `SELECT item_key FROM review_items
        WHERE user_id = ? AND due_on <= ?
        ORDER BY due_on ASC, last_seen ASC
        LIMIT ?`,
      [user.id, today(), LIMIT],
    );

    // A question that no longer exists is skipped rather than shown blank.
    const cards = rows
      .map((r) => resolveItem(r.item_key, en))
      .filter((c): c is ReviewCard => c !== null);

    const [{ n } = { n: 0 }] = await query<{ n: number }>(
      "SELECT COUNT(*) AS n FROM review_items WHERE user_id = ? AND due_on <= ?",
      [user.id, today()],
    );

    return NextResponse.json(
      { cards, due: Number(n) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json({ cards: [], due: 0 });
  }
}
