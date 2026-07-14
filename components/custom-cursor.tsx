"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Subtle custom cursor — a small ring that follows the mouse.
 * Only shown on non-touch devices (pointer: fine).
 */
export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 30, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 200, damping: 30, mass: 0.3 });

  useEffect(() => {
    // Only enable on fine-pointer devices (mouse/trackpad, not touch)
    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;
    setVisible(true);
    setIsPointer(true);

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  if (!isPointer || !visible) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference"
      style={{ x: springX, y: springY }}
    >
      {/* Outer ring */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-white/60" />
      {/* Inner dot */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-white" />
    </motion.div>
  );
}
