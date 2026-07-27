import Link from "next/link";
import { Code2 } from "lucide-react";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="group flex min-w-0 items-center gap-2 font-code text-base font-bold tracking-tight sm:text-lg"
      aria-label="ХаСү Computer Science"
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_16px_-4px_var(--color-primary)] transition-transform group-hover:scale-105">
        <Code2 className="h-5 w-5" />
      </span>
      <span className="truncate">
        ХаСү
        {/* Full wording only where there is room for it. */}
        <span className="hidden text-neon-cyan text-glow md:inline">
          {" "}
          Computer Science
        </span>
        <span className="text-neon-cyan text-glow md:hidden"> CS</span>
      </span>
    </Link>
  );
}
