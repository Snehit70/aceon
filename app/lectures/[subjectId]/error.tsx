"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { StripedBackground } from "@/components/shared/striped-background";

/**
 * LectureError - Isolated error boundary for lecture player.
 *
 * **Context**: Ensures that if the lecture player crashes, the user can still
 * navigate via the sidebar (if it's outside this boundary) or at least sees
 * a scoped error message without a full page reload.
 */
export default function LectureError({
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
    <div className="relative flex h-full w-full items-center justify-center p-8 bg-black">
      <StripedBackground />
      <div className="relative z-10">
        <ErrorDisplay
          title="SIGNAL LOST"
          message="Failed to load lecture data. The transmission was interrupted."
          error={error}
          reset={reset}
        />
      </div>
    </div>
  );
}
