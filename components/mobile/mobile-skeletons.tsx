import { cn } from "@/lib/utils";

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-800/60", className)} />;
}

function CardShell({ children, accent = true }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="relative border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4">
      {accent && <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-primary/40" />}
      {children}
    </div>
  );
}

export function MobileHeaderSkeleton({ tag = "// Active_Operations", titleWidth = "w-40" }: { tag?: string; titleWidth?: string }) {
  return (
    <header className="mb-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/40">{tag}</p>
      <Bar className={cn("mt-2 h-7", titleWidth)} />
      <Bar className="mt-2 h-3 w-32 bg-neutral-800/40" />
    </header>
  );
}

export function EnrolledCardSkeleton() {
  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bar className="h-5 w-14 bg-primary/20" />
          <Bar className="h-3 w-16 bg-neutral-800/40" />
        </div>
        <Bar className="h-4 w-4 bg-neutral-800/40" />
      </div>
      <div className="mt-3 space-y-1.5">
        <Bar className="h-5 w-full" />
        <Bar className="h-5 w-3/5" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-1.5 flex-1 overflow-hidden bg-white/8">
          <div className="h-full w-1/3 animate-pulse bg-primary/40" />
        </div>
        <Bar className="h-3 w-8 bg-primary/30" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Bar className="h-3 w-14 bg-neutral-800/40" />
        <Bar className="h-3 w-12 bg-neutral-800/40" />
        <Bar className="h-3 w-20 bg-neutral-800/40" />
      </div>
    </CardShell>
  );
}

export function ArchiveTierSkeleton() {
  return (
    <div className="relative flex items-center gap-4 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4">
      <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-primary/30" />
      <Bar className="h-8 w-8 bg-primary/15" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Bar className="h-4 w-28" />
        <Bar className="h-3 w-44 bg-neutral-800/40" />
        <Bar className="h-3 w-20 bg-primary/30" />
      </div>
      <Bar className="h-4 w-4 bg-neutral-800/40" />
    </div>
  );
}

export function WeekRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border border-white/10 bg-black/40 p-4">
      <Bar className="h-3 w-8 bg-primary/30" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Bar className="h-4 w-3/4" />
        <Bar className="h-3 w-24 bg-neutral-800/40" />
      </div>
      <Bar className="h-4 w-4 bg-neutral-800/40" />
    </div>
  );
}

export function LectureRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border border-white/10 bg-black/40 p-3.5">
      <Bar className="h-9 w-9 bg-white/[0.04]" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Bar className="h-4 w-4/5" />
        <Bar className="h-3 w-20 bg-neutral-800/40" />
      </div>
    </div>
  );
}

export function MobileLecturesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-4 py-5 pb-28">
      <MobileHeaderSkeleton titleWidth="w-36" />
      <ul className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i}>
            <EnrolledCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MobileArchivesSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-4 py-5 pb-28">
      <MobileHeaderSkeleton tag="// Archive_Index" titleWidth="w-32" />
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <ArchiveTierSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MobileCourseSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-4 py-5 pb-28">
      <header className="mb-4 border-b border-white/10 pb-4">
        <Bar className="h-3 w-20 bg-primary/30" />
        <Bar className="mt-2 h-6 w-3/4" />
        <Bar className="mt-2 h-3 w-16 bg-neutral-800/40" />
      </header>
      <div className="mb-5 border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <Bar className="h-3 w-16 bg-neutral-800/40" />
          <Bar className="h-3 w-8 bg-primary/30" />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden bg-white/8">
          <div className="h-full w-1/4 animate-pulse bg-primary/40" />
        </div>
        <Bar className="mt-2 h-3 w-40 bg-neutral-800/40" />
      </div>
      <ul className="space-y-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i}>
            <WeekRowSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MobileWeekSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-4 py-5 pb-28">
      <header className="mb-4 border-b border-white/10 pb-4">
        <Bar className="h-3 w-20 bg-primary/30" />
        <Bar className="mt-2 h-6 w-2/3" />
        <Bar className="mt-2 h-3 w-12 bg-neutral-800/40" />
      </header>
      <ul className="space-y-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i}>
            <LectureRowSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MobileLectureSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-4 py-4 pb-28">
      <header className="mb-4 border-b border-white/10 pb-4">
        <Bar className="h-3 w-24 bg-primary/30" />
        <Bar className="mt-2 h-6 w-4/5" />
        <Bar className="mt-2 h-3 w-32 bg-neutral-800/40" />
      </header>
      <div className="-mx-1 aspect-video w-[calc(100%+8px)] animate-pulse bg-neutral-900 border border-white/10" />
      <div className="mt-5 space-y-3">
        <Bar className="h-12 w-full bg-primary/30" />
        <div className="grid grid-cols-2 gap-2.5">
          <Bar className="h-[52px] bg-white/[0.04]" />
          <Bar className="h-[52px] bg-primary/15" />
        </div>
      </div>
    </div>
  );
}

export function MobileProfileSkeleton() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-4 py-5 pb-32">
      <MobileHeaderSkeleton tag="// Operator" titleWidth="w-28" />
      <CardShell>
        <div className="flex items-center gap-3">
          <Bar className="h-12 w-12 bg-primary/15" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Bar className="h-4 w-40" />
            <Bar className="h-3 w-48 bg-neutral-800/40" />
            <Bar className="h-4 w-24 bg-primary/20" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Bar className="mx-auto h-3 w-12 bg-neutral-800/40" />
              <Bar className="mx-auto h-5 w-8" />
            </div>
          ))}
        </div>
      </CardShell>
      <section className="mt-5">
        <Bar className="mb-2 h-3 w-24 bg-neutral-800/40" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bar key={i} className="h-[60px]" />
          ))}
        </div>
      </section>
      <section className="mt-5 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-white/10 bg-white/[0.02] p-3.5">
            <Bar className="h-3 w-20 bg-primary/30" />
            <Bar className="mt-1.5 h-4 w-3/4" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Bar className="h-11 bg-white/[0.04]" />
              <Bar className="h-11 bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
