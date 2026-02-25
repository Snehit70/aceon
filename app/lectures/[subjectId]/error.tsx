"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Search } from "lucide-react";
import { ErrorDisplay } from "@/components/shared/error-display";
import { StripedBackground } from "@/components/shared/striped-background";

/**
 * LectureError - Isolated error boundary for lecture player.
 *
 * **Context**: Ensures that if the lecture player crashes, the user can still
 * navigate via the sidebar (if it's outside this boundary) or at least sees
 * a scoped error message without a full page reload.
 * 
 * **Special Case**: Detects invalid course ID errors (Convex validation failures)
 * and shows a "Course Not Found" UI instead of a generic error.
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

  // Detect if this is an invalid course ID error (Convex throws when ID format is invalid)
  // Convex ID validation errors have specific patterns - avoid matching unrelated errors
  const errorString = `${error.message || ""} ${error.stack || ""}`.toLowerCase();
  const isInvalidIdError = 
    (errorString.includes("courses:get") && (
      errorString.includes("id") || 
      errorString.includes("invalid") ||
      errorString.includes("validation")
    )) ||
    errorString.includes("document not found") ||
    errorString.includes("id does not match");

  // Show "Course Not Found" UI for invalid ID errors
  if (isInvalidIdError) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 p-4 text-center overflow-hidden bg-black">
        <StripedBackground />
        
        <div className="relative z-10">
          <div className="absolute inset-0 animate-ping opacity-10 bg-destructive rounded-full" />
          <FileQuestion className="h-24 w-24 text-destructive animate-pulse" strokeWidth={1} />
        </div>

        <div className="space-y-2 max-w-md relative z-10">
          <h2 className="text-4xl font-display font-black tracking-wider text-destructive uppercase drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
            MISSION FILE MISSING
          </h2>
          <p className="text-muted-foreground font-mono text-sm leading-relaxed">
            This course could not be located in the archives.
            <br />
            The file may have been classified or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs relative z-10">
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-none border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive group min-h-[44px]"
          >
            <Link href="/lectures">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              ALL COURSES
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="flex-1 rounded-none bg-secondary/80 hover:bg-secondary text-secondary-foreground group min-h-[44px]"
          >
            <Link href="/lectures?tab=library">
              <Search className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              BROWSE LIBRARY
            </Link>
          </Button>
        </div>

        {/* Decorative corners */}
        <div className="fixed inset-4 pointer-events-none opacity-20 z-10">
          <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-destructive" />
          <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-destructive" />
          <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-destructive" />
          <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-destructive" />
        </div>
      </div>
    );
  }

  // Generic error UI for other errors
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-8 bg-black">
      <StripedBackground />
      <div className="relative z-10">
        <ErrorDisplay
          title="SIGNAL LOST"
          message="Failed to load lecture data. The transmission was interrupted."
          error={error}
          reset={reset}
          secondaryAction={{
            label: "All Courses",
            href: "/lectures",
          }}
        />
      </div>
    </div>
  );
}
