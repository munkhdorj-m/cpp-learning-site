"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type AnimatedCardProps = HTMLMotionProps<"div"> & {
  glowOnHover?: boolean;
  glowColor?: string;
};

const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, glowOnHover = false, glowColor, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm",
          glowOnHover &&
            "transition-shadow duration-300 hover:shadow-[0_0_20px_var(--tw-shadow-color)]",
          className,
        )}
        style={
          glowOnHover && glowColor
            ? ({ "--tw-shadow-color": glowColor } as React.CSSProperties)
            : undefined
        }
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
