"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { StripedBackground } from "@/components/shared/striped-background";

/**
 * GlobalError - Root layout error boundary.
 *
 * **Context**: Catches errors that happen in the root layout or template,
 * which `app/error.tsx` cannot catch.
 *
 * **Requirement**: Must define its own `<html>` and `<body>` tags because
 * it replaces the root layout when active.
 */
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
    <html lang="en">
      <body className="bg-black text-foreground antialiased overflow-hidden">
        <StripedBackground />
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4 z-10">
          <ErrorDisplay
            title="CRITICAL SYSTEM FAILURE"
            message="The application core has encountered an unrecoverable error."
            error={error}
            reset={reset}
          />
        </main>
      </body>
    </html>
  );
}
