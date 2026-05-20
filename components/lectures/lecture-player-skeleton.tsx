export default function LecturePlayerSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden md:gap-3">
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-x-hidden overflow-y-auto relative">
        <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
        <div
          className="fixed inset-0 opacity-10 pointer-events-none z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, #ffffff 4px, #ffffff 5px)",
          }}
        />
        <div className="fixed inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none z-0" />

        <div className="md:hidden sticky top-0 flex min-h-[56px] items-center gap-2 px-3 py-2 border-b bg-background/90 backdrop-blur-sm relative z-20 animate-pulse">
          <div className="h-10 w-10 bg-neutral-800/50" />
          <div className="h-5 flex-1 bg-neutral-800/50" />
        </div>

        <div className="flex-1 px-4 py-3 sm:p-4 md:p-6 w-full space-y-3 md:space-y-4 max-w-none ml-4 lg:ml-6 xl:ml-8 mr-0 pr-4 relative z-10 animate-pulse">
          <div className="h-10 w-40 bg-white/5 border border-white/10" />
          <div className="aspect-video w-full bg-black border border-white/10 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-16 bg-black -skew-x-6 border-2 border-[#E62E2D]/70 flex items-center justify-center shadow-[3px_3px_0px_0px_#E62E2D]">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[18px] border-l-[#E62E2D]/80 skew-x-6 ml-1" />
              </div>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-10 w-3/4 bg-neutral-800/50" />
              <div className="h-5 w-32 bg-neutral-800/30" />
            </div>
            <div className="h-14 w-44 bg-[#2BFF00]/10 border border-[#2BFF00]/40" />
          </div>
        </div>
      </main>

      <aside className="hidden md:flex w-[352px] border-l bg-background flex-col shrink-0 relative overflow-hidden animate-pulse">
        <div className="absolute top-3 right-3 h-8 w-8 bg-neutral-800/50 z-20" />
        <div className="h-[86px] border-b border-white/10 bg-neutral-900/30" />
        <div className="flex-1 p-5 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2 pb-3 border-b border-white/5">
              <div className="h-6 w-24 bg-neutral-800/50" />
              <div className="h-11 w-full bg-neutral-900/40 border border-neutral-800" />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
