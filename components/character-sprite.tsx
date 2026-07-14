"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface CharacterSpriteProps {
  src: string;
  alt: string;
  /** Width in pixels for the Next/Image */
  width: number;
  height: number;
  /** CSS class for positioning (absolute, fixed, etc.) */
  className?: string;
  /** Floating animation duration in seconds */
  floatDuration?: number;
  /** Entrance delay in seconds */
  delay?: number;
  /** Scale on hover */
  hoverScale?: number;
}

/**
 * An animated character sprite that floats and bounces gently.
 * Supports both real images and inline SVG fallbacks.
 * Place them around the landing page hero.
 */
export function CharacterSprite({
  src,
  alt,
  width,
  height,
  className,
  floatDuration = 4,
  delay = 0,
  hoverScale = 1.08,
}: CharacterSpriteProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <motion.div
      className={cn("pointer-events-auto select-none", className)}
      initial={{ opacity: 0, y: 30, rotate: -5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{
        delay,
        duration: 0.7,
        ease: "easeOut",
      }}
      whileHover={{ scale: hoverScale }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          y: {
            duration: floatDuration,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: floatDuration + 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        style={{ width, height }}
      >
        {!errored ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              "object-contain drop-shadow-lg transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            unoptimized
          />
        ) : (
          <FallbackCharacter />
        )}
        {/* Loading shimmer */}
        {!loaded && !errored && (
          <div className="absolute inset-0 skeleton-shimmer rounded-xl" />
        )}
      </motion.div>
    </motion.div>
  );
}

/** Cute placeholder character drawn as inline SVG */
function FallbackCharacter() {
  return (
    <svg
      viewBox="0 0 120 160"
      className="h-full w-full drop-shadow-lg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="60" cy="120" rx="28" ry="32" className="fill-violet-400" />
      {/* Head */}
      <circle cx="60" cy="58" r="24" className="fill-amber-300" />
      {/* Eyes */}
      <circle cx="50" cy="54" r="4" className="fill-slate-800" />
      <circle cx="70" cy="54" r="4" className="fill-slate-800" />
      <circle cx="51" cy="52" r="1.5" className="fill-white" />
      <circle cx="71" cy="52" r="1.5" className="fill-white" />
      {/* Smile */}
      <path
        d="M52 68 Q60 76 68 68"
        stroke="currentColor"
        className="stroke-slate-800"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Blush */}
      <circle cx="40" cy="62" r="5" className="fill-rose-300 opacity-60" />
      <circle cx="80" cy="62" r="5" className="fill-rose-300 opacity-60" />
      {/* Arms */}
      <ellipse
        cx="30"
        cy="110"
        rx="12"
        ry="6"
        className="fill-amber-300"
        transform="rotate(-30 30 110)"
      />
      <ellipse
        cx="90"
        cy="110"
        rx="12"
        ry="6"
        className="fill-amber-300"
        transform="rotate(30 90 110)"
      />
      {/* Legs */}
      <rect
        x="42"
        y="145"
        width="14"
        height="12"
        rx="4"
        className="fill-violet-500"
      />
      <rect
        x="64"
        y="145"
        width="14"
        height="12"
        rx="4"
        className="fill-violet-500"
      />
      {/* Laptop */}
      <rect
        x="26"
        y="90"
        width="68"
        height="40"
        rx="4"
        className="fill-slate-700"
      />
      <rect
        x="32"
        y="96"
        width="56"
        height="28"
        rx="2"
        className="fill-sky-300"
      />
      <line
        x1="60"
        y1="130"
        x2="60"
        y2="140"
        stroke="currentColor"
        className="stroke-slate-700"
        strokeWidth="2"
      />
      <rect
        x="34"
        y="132"
        width="52"
        height="4"
        rx="1"
        className="fill-slate-600"
      />
      {/* Hair tuft */}
      <path d="M50 34 Q55 24 60 34" className="fill-amber-400" />
      <path d="M56 34 Q60 22 64 34" className="fill-amber-400" />
      <path d="M62 34 Q68 26 70 34" className="fill-amber-400" />
    </svg>
  );
}
