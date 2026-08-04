import { Fragment } from "react";

/**
 * Lesson text with the two bits of markup the course actually uses:
 * `backticks` for inline code and **stars** for emphasis.
 *
 * Lesson copy has always been written with backticks in it, but the old
 * renderer printed them literally — students read "`int` means whole number"
 * with the quotes showing.
 */
/**
 * The same text with the markup removed rather than rendered — for places
 * that can only hold a plain string, like the side-rail links.
 */
export function plainText(text: string): string {
  return text.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

export function Prose({ text }: { text: string }) {
  // One split keeps the pieces in order; the capture groups keep the
  // delimiters so we can tell which kind of piece each one is.
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("`") && p.endsWith("`") && p.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-primary/10 px-1 py-0.5 font-mono text-[0.9em] text-primary"
            >
              {p.slice(1, -1)}
            </code>
          );
        }
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
