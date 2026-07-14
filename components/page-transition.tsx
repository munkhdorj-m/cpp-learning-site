"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18 },
  },
  // No exit animation — exit delay was blocking navigation by 150ms+.
  // New page fades in over the old content for a seamless, fast transition.
};

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
