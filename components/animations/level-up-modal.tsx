"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import { playLevelUp } from "@/lib/sounds";

interface LevelUpModalProps {
  open: boolean;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ open, newLevel, onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      // Fire confetti bursts
      const duration = 1500;
      const end = Date.now() + duration;
      const colors = ["#a78bfa", "#c084fc", "#f59e0b", "#10b981", "#f472b6"];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
          scalar: 0.9,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
          scalar: 0.9,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      playLevelUp();

      // Auto-dismiss after 3.5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setVisible(false);
            onClose();
          }}
        >
          <motion.div
            className="text-center select-none"
            initial={{ scale: 0.3, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.p
              className="text-6xl md:text-8xl font-black text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              LEVEL UP!
            </motion.p>
            <motion.p
              className="text-3xl md:text-4xl font-bold text-white mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Level {newLevel}
            </motion.p>
            <motion.p
              className="text-lg text-white/70 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Keep going! 🚀
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
