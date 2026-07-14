"use client";

import { motion, type MotionProps } from "framer-motion";
import { Children, type ReactNode, isValidElement } from "react";

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

const itemVariant = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function MotionComponent({
  tag,
  ...props
}: { tag: ContainerTag } & MotionProps & {
    className?: string;
    children?: ReactNode;
    variants?: Record<string, unknown>;
    initial?: string;
    animate?: string;
  }) {
  const Component = motion[tag] as React.ComponentType<
    MotionProps & { className?: string; children?: ReactNode }
  >;
  return <Component {...props} />;
}

export function AnimatedList({
  children,
  className,
  as: Tag = "div",
  stagger = 0.05,
}: AnimatedListProps) {
  return (
    <MotionComponent
      tag={Tag}
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
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        return <motion.div variants={itemVariant}>{child}</motion.div>;
      })}
    </MotionComponent>
  );
}
