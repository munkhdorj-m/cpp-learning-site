"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { Children, type ReactNode, isValidElement } from "react";

import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface AnimatedListProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  /** Tag name for the container — defaults to "div". Use "ol" for ordered lists. */
  as?: "div" | "ol" | "ul" | "section";
  /** Amount each child staggers by (seconds). Default 0.05. */
  stagger?: number;
}

export function AnimatedList({
  children,
  className,
  as: Tag = "div",
  stagger = 0.05,
  ...props
}: AnimatedListProps) {
  const MotionTag = motion.create(Tag as any);

  return (
    <MotionTag
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: stagger },
        },
      }}
      initial="hidden"
      animate="show"
      className={cn(className)}
      {...(props as any)}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        return <motion.div variants={itemVariant}>{child}</motion.div>;
      })}
    </MotionTag>
  );
}
