import Link from "next/link";
import { TerminalSquare } from "lucide-react";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2 font-code text-lg font-bold tracking-tight"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--color-primary)] transition-transform group-hover:scale-105">
        <TerminalSquare className="h-5 w-5" />
      </span>
      <span className="font-code">
        <span className="text-muted-foreground">&lt;</span>
        cpp
        <span className="text-neon-cyan text-glow">_judge</span>
        <span className="text-muted-foreground">/&gt;</span>
      </span>
    </Link>
  );
}
