import Link from "next/link";
import { Code2 } from "lucide-react";

export function SiteLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold text-lg tracking-tight"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
        <Code2 className="h-5 w-5" />
      </span>
      <span>
        CPP <span className="text-violet-600">Judge</span>
      </span>
    </Link>
  );
}
