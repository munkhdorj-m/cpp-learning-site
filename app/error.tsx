"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Oops!</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button
        onClick={reset}
        className="bg-violet-600 text-white hover:bg-violet-700"
      >
        <RotateCcw className="h-4 w-4 mr-1.5" />
        Try again
      </Button>
    </div>
  );
}
