"use client";

import { cn } from "@/lib/utils";

interface LecturesSkeletonProps {
  mode?: "enrolled" | "library";
  count?: number;
}

export default function LecturesSkeleton({ mode = "enrolled", count = 4 }: LecturesSkeletonProps) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[url('/images/halftone.svg')] opacity-5 pointer-events-none mix-blend-screen z-0" />
      <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#ffffff_4px,#ffffff_5px)]"
      />
      <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl space-y-16 relative z-10 animate-in fade-in duration-500">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 bg-neutral-800/50 animate-pulse" />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 transform -rotate-1 skew-x-[-5deg]">
                <div className="h-16 w-48 bg-neutral-800/50 animate-pulse" />
                <div className="h-16 w-64 bg-[#E62E2D]/20 animate-pulse transform skew-x-[10deg]" />
              </div>
              <div className="h-16 w-[600px] max-w-full bg-neutral-900/50 border-l-4 border-[#E62E2D]/50 pl-4 flex items-center animate-pulse transform rotate-1">
                <div className="h-6 w-96 bg-neutral-800/50" />
              </div>
            </div>
            <div className="h-12 w-56 border-4 border-neutral-800 bg-neutral-900/30 animate-pulse" />
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex gap-8 border-b-4 border-neutral-800">
            <div className={cn(
              "h-12 w-56 mb-[-4px] flex items-center transition-all",
              mode === "enrolled" ? "border-b-4 border-[#E62E2D]/50" : "border-transparent"
            )}>
              <div className={cn(
                "h-8 w-48 animate-pulse",
                mode === "enrolled" ? "bg-neutral-800/50" : "bg-neutral-900/30"
              )} />
            </div>
            <div className={cn(
              "h-12 w-56 mb-[-4px] flex items-center transition-all",
              mode === "library" ? "border-b-4 border-[#E62E2D]/50" : "border-transparent"
            )}>
              <div className={cn(
                "h-8 w-48 animate-pulse",
                mode === "library" ? "bg-neutral-800/50" : "bg-neutral-900/30"
              )} />
            </div>
          </div>

          {mode === "enrolled" ? (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="border-2 border-neutral-800 bg-black clip-corner overflow-hidden animate-pulse">
                  <div className="p-4 border-b-2 border-neutral-800 bg-neutral-900/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-16 border border-[#E62E2D]/50 bg-[#E62E2D]/20" />
                      <div className="h-4 w-20 bg-neutral-800/50" />
                    </div>
                    <div className="h-8 w-3/4 bg-neutral-800/50" />
                  </div>
                  
                  <div className="p-4 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-neutral-800/50" />
                        <div className="h-4 w-8 bg-[#E62E2D]/40" />
                      </div>
                      <div className="h-3 w-full bg-neutral-900 border border-neutral-800">
                        <div className="h-full w-1/4 bg-[#E62E2D]/40" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-neutral-800">
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-neutral-800/50" />
                        <div className="h-5 w-12 bg-neutral-800/50" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-neutral-800/50" />
                        <div className="h-5 w-16 bg-neutral-800/50" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-4 w-full animate-pulse">
                <div className="h-14 w-full sm:w-80 bg-neutral-900/50 border-4 border-neutral-800" />
                
                <div className="flex gap-2 items-center">
                   <div className="h-11 w-24 bg-[#E62E2D]/10 border-2 border-neutral-800" />
                   <div className="w-px h-6 bg-neutral-800" />
                   <div className="h-11 w-24 bg-neutral-900/50 border-2 border-neutral-800" />
                   <div className="h-11 w-24 bg-neutral-900/50 border-2 border-neutral-800" />
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-[60px] border-2 border-neutral-800 bg-neutral-900/20 p-4 flex items-center justify-between animate-pulse">
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-neutral-800/50" />
                        <div className="h-5 w-32 bg-neutral-800/50" />
                     </div>
                     <div className="h-4 w-16 bg-neutral-800/50" />
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
