"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const DeferredVisuals = dynamic(
  () => import("@/components/lectures/deferred-visuals"),
  { ssr: false }
);

interface LecturesSkeletonProps {
  mode?: "enrolled" | "library";
  count?: number;
}

export default function LecturesSkeleton({ mode = "enrolled", count = 4 }: LecturesSkeletonProps) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden relative">
      <DeferredVisuals />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-8 md:py-12 max-w-7xl space-y-7 sm:space-y-10 md:space-y-16 relative z-10 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex items-center gap-4">
            <div className="h-9 sm:h-10 w-28 sm:w-32 bg-neutral-800/40 animate-pulse" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 md:gap-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2 transform -rotate-1 sm:skew-x-[-5deg]">
                <div className="h-12 sm:h-16 w-36 sm:w-52 bg-neutral-800/50 animate-pulse" />
                <div className="h-12 sm:h-16 w-44 sm:w-72 bg-[#E62E2D]/20 animate-pulse transform sm:skew-x-[10deg]" />
              </div>
              <div className="h-12 sm:h-16 w-full max-w-[600px] bg-white/10 border-l-4 border-[#E62E2D]/50 p-2.5 sm:p-4 flex items-center animate-pulse transform sm:rotate-1">
                <div className="h-4 sm:h-6 w-48 sm:w-96 bg-neutral-800/50" />
              </div>
            </div>
            <div className="h-10 sm:h-12 w-40 sm:w-56 border-2 sm:border-4 border-neutral-700 bg-neutral-900/30 animate-pulse" />
          </div>
        </div>

        <div className="space-y-6 md:space-y-12">
          <div className="flex gap-4 sm:gap-8 border-b-4 border-neutral-800 overflow-hidden">
            <div className={cn(
              "h-10 sm:h-12 w-40 sm:w-56 mb-[-4px] flex items-center transition-all",
              mode === "enrolled" ? "border-b-4 border-[#E62E2D]/50" : "border-transparent"
            )}>
              <div className={cn(
                "h-6 sm:h-8 w-32 sm:w-48 animate-pulse",
                mode === "enrolled" ? "bg-neutral-800/50" : "bg-neutral-900/30"
              )} />
            </div>
            <div className={cn(
              "h-10 sm:h-12 w-40 sm:w-56 mb-[-4px] flex items-center transition-all",
              mode === "library" ? "border-b-4 border-[#E62E2D]/50" : "border-transparent"
            )}>
              <div className={cn(
                "h-6 sm:h-8 w-32 sm:w-48 animate-pulse",
                mode === "library" ? "bg-neutral-800/50" : "bg-neutral-900/30"
              )} />
            </div>
          </div>

          {mode === "enrolled" ? (
            <div className="grid gap-3 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border-2 border-neutral-800 bg-black clip-corner overflow-hidden animate-pulse">
                  <div className="p-3 sm:p-4 border-b-2 border-neutral-800 bg-neutral-900/20 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 sm:h-5 w-12 sm:w-16 border border-[#E62E2D]/50 bg-[#E62E2D]/20" />
                      <div className="h-3.5 sm:h-4 w-14 sm:w-20 bg-neutral-800/50" />
                    </div>
                    <div className="h-6 sm:h-8 w-4/5 bg-neutral-800/50" />
                  </div>

                  <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-3.5 sm:h-4 w-16 sm:w-24 bg-neutral-800/50" />
                        <div className="h-3.5 sm:h-4 w-6 sm:w-8 bg-[#E62E2D]/40" />
                      </div>
                      <div className="h-3 w-full bg-neutral-900 border border-neutral-800">
                        <div className="h-full w-1/4 bg-[#E62E2D]/40" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-dashed border-neutral-800">
                      <div className="space-y-1">
                        <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-neutral-800/50" />
                        <div className="h-4 sm:h-5 w-10 sm:w-12 bg-neutral-800/50" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-neutral-800/50" />
                        <div className="h-4 sm:h-5 w-12 sm:w-16 bg-neutral-800/50" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full animate-pulse">
                <div className="h-10 sm:h-14 w-full md:w-80 bg-neutral-900/50 border-[3px] sm:border-4 border-neutral-800" />

                <div className="flex gap-1.5 sm:gap-2 items-center">
                  <div className="h-9 sm:h-11 w-20 sm:w-24 bg-[#E62E2D]/10 border-2 border-neutral-800" />
                  <div className="w-px h-5 sm:h-6 bg-neutral-700" />
                  <div className="h-9 sm:h-11 w-20 sm:w-24 bg-neutral-900/50 border-2 border-neutral-800" />
                  <div className="h-9 sm:h-11 w-24 sm:w-28 bg-neutral-900/50 border-2 border-neutral-800" />
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[48px] sm:h-[56px] border-2 border-border bg-secondary/5 px-3 sm:px-4 flex items-center justify-between animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-neutral-800/50" />
                      <div className="h-4 sm:h-5 w-24 sm:w-32 bg-neutral-800/50" />
                    </div>
                    <div className="h-3 sm:h-4 w-12 sm:w-16 bg-neutral-800/50" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
