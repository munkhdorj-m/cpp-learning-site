"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Floating Action Button for quick IDE access on mobile.
 * Visible only on screens < md.
 */
export function Fab() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 md:hidden"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href="/ide"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg hover:bg-violet-700 hover:scale-110 transition-all active:scale-95"
        aria-label="Open code editor"
      >
        <Code2 className="h-6 w-6" />
      </Link>
    </motion.div>
  );
}
