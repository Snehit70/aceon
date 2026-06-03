import { LegalShell } from "@/components/shared/legal-shell";

export default function ChangelogPage() {
  return (
    <LegalShell showFooter={false}>
      <div className="flex flex-col items-center text-center space-y-10 sm:space-y-12">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-[clamp(2.5rem,14vw,4.5rem)] md:text-7xl font-display font-black uppercase tracking-normal md:tracking-tighter break-words">
            Change<span className="text-[#E62E2D]">log</span>
          </h1>
          <p className="text-neutral-400 font-mono text-sm">
            What&apos;s new in Aceon.
          </p>
        </div>

        {/* Placeholder */}
        <section className="max-w-2xl w-full">
          <div className="bg-neutral-900 border-2 border-neutral-800 p-8">
            <p className="text-neutral-300 leading-relaxed">
              Release notes are on the way. Check back here to see what&apos;s changed.
            </p>
          </div>
        </section>
      </div>
    </LegalShell>
  );
}
