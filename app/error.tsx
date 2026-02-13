"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { StripedBackground } from "@/components/shared/striped-background";

/**
 * Error - Root error boundary fallback.
 *
 * **Context**: Catches errors in the root component tree.
 * **Design**: Uses the reusable Chainsaw Man themed ErrorDisplay.
 */
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
    <main className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 bg-black">
      <StripedBackground />
      <div className="relative z-10">
        <ErrorDisplay
          title="SYSTEM MALFUNCTION"
          message="An unexpected error occurred in the component tree."
          error={error}
          reset={reset}
        />
      </div>
    </main>
  );
}
