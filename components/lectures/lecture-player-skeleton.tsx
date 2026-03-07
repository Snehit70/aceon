export default function LecturePlayerSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[url('/images/halftone.svg')] opacity-5 pointer-events-none mix-blend-screen z-0" />
      <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#ffffff_4px,#ffffff_5px)]"
      />
      <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
      
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-67px)] relative z-10">
        <aside className="w-full lg:w-80 xl:w-96 border-r-2 border-neutral-800 bg-black/50 backdrop-blur-sm overflow-hidden animate-pulse">
          <div className="p-4 border-b-2 border-neutral-800 space-y-3">
            <div className="h-6 w-32 bg-neutral-800/50" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 bg-[#E62E2D]/40" />
              <div className="h-4 w-16 bg-neutral-800/50" />
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="h-10 w-full bg-neutral-800/30 border-2 border-neutral-800" />
          </div>
          
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-b border-neutral-800">
                <div className="p-3 flex items-center justify-between">
                  <div className="h-5 w-24 bg-neutral-800/50" />
                  <div className="h-4 w-16 bg-neutral-800/30" />
                </div>
                <div className="px-3 pb-3 space-y-2">
                  {Array.from({ length: 2 + (i % 3) }).map((_, j) => (
                    <div key={j} className="h-12 bg-neutral-900/50 border border-neutral-800 p-2 flex items-center gap-2">
                      <div className="w-4 h-4 bg-neutral-800/50" />
                      <div className="h-4 flex-1 bg-neutral-800/50" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
        
        <main className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b-2 border-neutral-800">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-neutral-800/50" />
              <div className="space-y-2">
                <div className="h-6 w-64 bg-neutral-800/50" />
                <div className="h-4 w-48 bg-neutral-800/30" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-neutral-800/50 border-2 border-neutral-800" />
              <div className="h-10 w-32 bg-[#E62E2D]/20 border-2 border-[#E62E2D]/50" />
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-neutral-900/30">
            <div className="w-full max-w-4xl aspect-video bg-black border-2 border-neutral-800 flex items-center justify-center">
              {/* Angular play button skeleton - matches actual paused state */}
              <div className="relative">
                <div className="w-24 h-20 bg-neutral-800/50 backdrop-blur-sm -skew-x-6 border-2 border-[#E62E2D]/30 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(230,46,45,0.2)]">
                  {/* Play triangle placeholder */}
                  <div className="w-0 h-0 skew-x-6 border-l-[20px] border-l-neutral-600/50 border-y-[12px] border-y-transparent" />
                </div>
                {/* Corner accent */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E62E2D]/30" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#E62E2D]/20" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
