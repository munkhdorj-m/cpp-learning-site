import { imageFor } from "@/lib/lesson-images";
import { cn } from "@/lib/utils";

/**
 * A photograph with the credit its licence requires.
 *
 * Plain `<img>` rather than next/image: these are already resized and served
 * from the same host, so the optimiser would add a moving part to the cPanel
 * deployment for no gain. `loading="lazy"` plus the explicit dimensions keep
 * the page from jumping as they arrive.
 */
export function Figure({
  id,
  caption,
  className,
  priority,
}: {
  id: string;
  caption?: string;
  className?: string;
  /** The lesson's own picture is above the fold, so it should not be lazy. */
  priority?: boolean;
}) {
  const img = imageFor(id);
  if (!img) return null;

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-primary/20 bg-black/20",
        className,
      )}
    >
      <img
        src={img.src}
        width={img.width}
        height={img.height}
        alt={caption || img.title}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-auto w-full object-cover"
      />
      <figcaption className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-primary/15 px-3 py-1.5">
        {caption && <span className="text-sm">{caption}</span>}
        <a
          href={img.source}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="ml-auto font-code text-[10px] text-muted-foreground transition-colors hover:text-primary"
        >
          {img.creator && img.creator !== "unknown" ? `${img.creator} · ` : ""}
          {img.license}
        </a>
      </figcaption>
    </figure>
  );
}

/** Several photographs side by side — used for the device topics. */
export function FigureGrid({
  ids,
  captions,
}: {
  ids: string[];
  captions?: Record<string, string>;
}) {
  const shown = ids.filter((id) => imageFor(id));
  if (shown.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-3",
        shown.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {shown.map((id) => (
        <Figure key={id} id={id} caption={captions?.[id]} />
      ))}
    </div>
  );
}
