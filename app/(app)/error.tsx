"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
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
