"use client";

/**
 * Render a full-screen themed loading screen with layered decorative backgrounds and pulsing skeleton visuals.
 *
 * This is a purely presentational component that displays halftone/noise/gradient background layers and centered animated placeholder elements; it has no state or side effects.
 *
 * @returns The JSX element for the full-screen loading UI.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[url('/images/halftone.svg')] opacity-5 pointer-events-none mix-blend-screen z-0" />
      <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            #ffffff 4px,
            #ffffff 5px
          )`
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
      
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="h-32 w-32 border-4 border-neutral-800 bg-neutral-900 clip-corner shadow-[8px_8px_0px_0px_#262626] animate-pulse transform -rotate-6" />
            <div className="absolute inset-0 h-32 w-32 border-4 border-[#E62E2D] bg-transparent clip-corner shadow-[8px_8px_0px_0px_#E62E2D] animate-pulse transform rotate-6" />
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-40 bg-neutral-900 border-2 border-neutral-800 clip-corner animate-pulse transform -rotate-2" />
              <div className="h-6 w-32 bg-[#E62E2D]/20 border-2 border-[#E62E2D]/50 clip-corner animate-pulse transform rotate-2" />
            </div>
            <div className="h-3 w-56 bg-neutral-800 border border-neutral-700 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}