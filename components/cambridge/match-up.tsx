"use client";

import { useCallback, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MatchSet } from "@/lib/cambridge/match-sets";

/**
 * Sort statements under the thing they describe.
 *
 * A large share of the syllabus is definitions that only ever get read —
 * which device is an input, what pharming actually means, which part of the
 * OS does what. Recall is the skill being tested, so the exercise has to make
 * the student produce the answer rather than recognise it in a list.
 *
 * Pick an item, then pick the group it belongs to. Wrong placements are shown
 * individually so a student learns which one they confused.
 */
export function MatchUp({ sets }: { sets: MatchSet[] }) {
  const [at, setAt] = useState(0);
  const set = sets[at];

  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const allItems = set.groups.flatMap((g) => g.items);
  const [order, setOrder] = useState<string[]>(() => shuffle(allItems));

  const reset = useCallback((s: MatchSet) => {
    setPlaced({});
    setSelected(null);
    setChecked(false);
    setOrder(shuffle(s.groups.flatMap((g) => g.items)));
  }, []);

  const pickSet = (i: number) => {
    setAt(i);
    reset(sets[i]);
  };

  const pool = order.filter((i) => !placed[i]);

  const place = (group: string) => {
    if (!selected || checked) return;
    setPlaced((p) => ({ ...p, [selected]: group }));
    setSelected(null);
  };

  const takeBack = (item: string) => {
    if (checked) return;
    setPlaced((p) => {
      const next = { ...p };
      delete next[item];
      return next;
    });
  };

  const homeOf = (item: string) =>
    set.groups.find((g) => g.items.includes(item))!.name;
  const isRight = (item: string) => placed[item] === homeOf(item);

  const rightCount = allItems.filter((i) => placed[i] && isRight(i)).length;

  return (
    <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="hud-label">SORT THEM</span>
        {checked && (
          <span className="ml-auto font-code text-xs text-muted-foreground">
            {rightCount}/{allItems.length} correct
          </span>
        )}
      </div>

      {sets.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {sets.map((s, i) => (
            <button
              key={s.title}
              onClick={() => pickSet(i)}
              className={cn(
                "rounded-lg border px-2.5 py-1 font-code text-xs transition-colors",
                at === i
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground">{set.ask}</p>

      {/* Still to sort */}
      {pool.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pool.map((item) => (
            <button
              key={item}
              onClick={() => setSelected(selected === item ? null : item)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-left text-sm transition-colors",
                selected === item
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-primary/20 bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {pool.length > 0 && (
        <p className="font-code text-[10px] tracking-widest text-muted-foreground">
          {selected ? "NOW CHOOSE ITS GROUP" : "PICK ONE, THEN PICK ITS GROUP"}
        </p>
      )}

      {/* The groups */}
      <div
        className={cn(
          "grid gap-2",
          set.groups.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {set.groups.map((g) => {
          const mine = allItems.filter((i) => placed[i] === g.name);
          return (
            <div
              key={g.name}
              className={cn(
                "rounded-lg border p-2 transition-colors",
                selected && !checked
                  ? "cursor-pointer border-primary/50 bg-primary/[0.08] hover:bg-primary/15"
                  : "border-primary/15 bg-background/30",
              )}
              onClick={() => place(g.name)}
            >
              <div className="hud-label mb-1.5 text-[10px]">{g.name}</div>
              <ul className="space-y-1">
                {mine.map((item) => (
                  <li key={item}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        takeBack(item);
                      }}
                      className={cn(
                        "flex w-full items-start gap-1.5 rounded border px-2 py-1 text-left text-xs transition-colors",
                        !checked && "border-primary/25 bg-primary/[0.06]",
                        checked && isRight(item) && "border-neon-lime/50 bg-neon-lime/10 text-neon-lime",
                        checked && !isRight(item) && "border-destructive/50 bg-destructive/10 text-destructive",
                      )}
                    >
                      <span className="min-w-0 flex-1">{item}</span>
                      {checked &&
                        (isRight(item) ? (
                          <Check className="mt-0.5 h-3 w-3 shrink-0" />
                        ) : (
                          <X className="mt-0.5 h-3 w-3 shrink-0" />
                        ))}
                    </button>
                  </li>
                ))}
                {mine.length === 0 && (
                  <li className="rounded border border-dashed border-primary/15 px-2 py-2 text-center text-[11px] text-muted-foreground">
                    empty
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => setChecked(true)}
          disabled={pool.length > 0 || checked}
          className="font-code"
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Check
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => reset(set)}
          className="ml-auto font-code"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Start again
        </Button>
      </div>

      {checked && rightCount === allItems.length && (
        <p className="flex items-center gap-1.5 text-sm text-neon-lime">
          <Check className="h-4 w-4" /> All of them in the right place.
        </p>
      )}
      {checked && rightCount < allItems.length && (
        <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/[0.06] p-2.5 text-sm">
          <p className="text-muted-foreground">These belong somewhere else:</p>
          <ul className="space-y-0.5">
            {allItems
              .filter((i) => !isRight(i))
              .map((i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  <span className="text-foreground">{i}</span> →{" "}
                  <span className="font-code text-primary">{homeOf(i)}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
