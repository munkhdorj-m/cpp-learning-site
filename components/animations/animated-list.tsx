"use client";

import { Children, cloneElement, isValidElement, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContainerTag = "div" | "ol" | "ul" | "section";

interface AnimatedListProps {
  children: ReactNode;
  /** Tag name for the container — defaults to "div". Use "ol" for ordered lists. */
  as?: ContainerTag;
  /** Amount each child staggers by (seconds). Default 0.05. */
  stagger?: number;
  className?: string;
}

/**
 * Fades children in one after another.
 *
 * Done with a CSS animation and a per-child delay rather than a motion
 * library — this renders long problem lists, and the effect is not worth
 * shipping ~50 kB of JavaScript for.
 *
 * The delay is set on each child directly instead of wrapping it, so an
 * <li> stays a direct child of its <ol> (the previous version wrapped every
 * item in a <div>, which is invalid inside a list).
 */
export function AnimatedList({
  children,
  className,
  as: Tag = "div",
  stagger = 0.05,
}: AnimatedListProps) {
  return (
    <Tag className={cn(className)}>
      {Children.map(children, (child, i) => {
        if (!isValidElement<{ style?: React.CSSProperties }>(child)) {
          return child;
        }
        // Cap the delay so a long list doesn't take forever to appear.
        const delay = Math.min(i * stagger, 1.2);
        return cloneElement(child, {
          style: {
            ...(child.props.style ?? {}),
            animationDelay: `${delay}s`,
          },
          className: cn(
            "animate-flicker-in",
            (child.props as { className?: string }).className,
          ),
        } as Partial<{ style: React.CSSProperties; className: string }>);
      })}
    </Tag>
  );
}
