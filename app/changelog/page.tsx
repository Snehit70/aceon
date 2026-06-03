import { LegalShell, LegalHeading } from "@/components/shared/legal-shell";

export default function ChangelogPage() {
  return (
    <LegalShell showFooter={false}>
      <div className="flex flex-col items-center text-center space-y-10 sm:space-y-12">
        <LegalHeading subtitle="What's new in Aceon.">
          Change<span className="text-primary">log</span>
        </LegalHeading>

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
