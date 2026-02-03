"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

/**
 * Error - Global error boundary fallback.
 * 
 * **Context**: Catches unhandled errors in the React component tree and displays
 * a user-friendly error message instead of crashing the app.
 * 
 * **User Flow**:
 * 1. Error occurs in any component -> This boundary catches it.
 * 2. User sees error message with "Try again" button.
 * 3. Clicking "Try again" calls `reset()` to attempt recovery.
 * 
 * **Logging**: Errors are logged to console for debugging.
 * 
 * @param props - Error boundary props.
 * @param props.error - The error object with optional digest string.
 * @param props.reset - Callback to reset the error boundary and retry.
 * @returns Error UI with retry button.
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
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
      </div>
      <p className="text-muted-foreground max-w-md text-center">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
