import { Children, isValidElement, type ReactNode } from "react";

/**
 * The labels a Select's trigger should show, read off its own options.
 *
 * Base UI's `Select.Value` renders the raw VALUE unless the root is handed an
 * `items` map to look the label up in. Nothing in this app passed one, so any
 * select whose values are ids showed a naked UUID once closed — the class
 * picker on the assignment form, the teacher picker on the ask-a-question
 * form, and every other one keyed by id. Selects whose value happens to equal
 * its label ("easy", "medium") looked fine, which is why it went unnoticed.
 *
 * Deriving the map from the children means every existing call site is fixed
 * without being touched, and a new one cannot forget. A call site that wants
 * to be explicit can still pass `items` and win.
 */

/** Flatten an option's children down to the text a human would read. */
export function labelOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    return node.map(labelOf).join("").replace(/\s+/g, " ").trim();
  }
  if (isValidElement(node)) {
    // An icon has no text and contributes nothing; a wrapper contributes what
    // is inside it.
    const props = node.props as { children?: ReactNode };
    return labelOf(props?.children);
  }
  return "";
}

/**
 * Walk a Select's children and collect `value -> label`.
 *
 * Options are recognised by having a string `value` prop rather than by
 * component identity: identity comparison breaks the moment an option is
 * wrapped, aliased or re-exported, and failing open here would silently bring
 * the UUIDs back.
 */
export function deriveSelectItems(
  children: ReactNode,
): Record<string, ReactNode> {
  const out: Record<string, ReactNode> = {};

  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) return;

    const props = node.props as { value?: unknown; children?: ReactNode };
    if (typeof props?.value === "string") {
      const label = labelOf(props.children);
      // An option with no readable text is left out: mapping it to "" would
      // render an empty trigger, which is worse than the raw value.
      if (label) out[props.value] = label;
    }

    if (props?.children) Children.toArray(props.children).forEach(visit);
  };

  Children.toArray(children).forEach(visit);
  return out;
}
