"use client";

/**
 * Tiny Web Audio API wrapper for gamification sounds.
 * All sounds are synthesized — no audio files needed.
 * Each function creates a short oscillator-based sound.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // AudioContext may not be available (SSR, user hasn't interacted yet) — silent fail
  }
}

/** Quick ascending chime for correct answer / success */
export function playCorrect(): void {
  tone(880, 0.1, "sine", 0.12);
  setTimeout(() => tone(1100, 0.15, "sine", 0.1), 80);
}

/** Low descending buzz for wrong answer / error */
export function playWrong(): void {
  tone(300, 0.15, "square", 0.08);
  setTimeout(() => tone(200, 0.2, "square", 0.06), 100);
}

/** Ascending fanfare for level-up */
export function playLevelUp(): void {
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => tone(freq, 0.25, "triangle", 0.12), i * 120);
  });
}

/** Sparkle for badge earned */
export function playBadge(): void {
  const notes = [1200, 1400, 1600, 1800];
  notes.forEach((freq, i) => {
    setTimeout(() => tone(freq, 0.1, "sine", 0.08), i * 50);
  });
}
