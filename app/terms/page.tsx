import { LegalShell } from "@/components/shared/legal-shell";

const LINKEDIN_URL = "https://www.linkedin.com/in/snehit70/";
const X_URL = "https://x.com/snehit70";

export default function TermsPage() {
  return (
    <LegalShell active="terms">
      <div className="flex flex-col items-center text-center space-y-12 sm:space-y-16">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-[clamp(2.5rem,14vw,4.5rem)] md:text-7xl font-display font-black uppercase tracking-normal md:tracking-tighter break-words">
            Terms of <span className="text-[#E62E2D]">Service</span>
          </h1>
          <p className="text-neutral-400 font-mono text-sm">
            Last updated: June 2026
          </p>
        </div>

        {/* Acceptance */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Acceptance</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            By using Aceon, you agree to these terms. If you don&apos;t agree with them, please
            stop using the service.
          </p>
        </section>

        {/* What Aceon Is */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">What Aceon Is</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is a free study companion for IIT Madras BS Degree students. It organizes
            publicly available lecture content so you can watch and track your progress in one
            place. It is an independent project and is not officially affiliated with IIT
            Madras.
          </p>
        </section>

        {/* Your Account */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Your Account</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Using Aceon requires an account, which you create by signing in through Clerk.
            You&apos;re responsible for keeping your account secure and for activity that happens
            under it.
          </p>
        </section>

        {/* Acceptable Use */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Acceptable Use</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <ul className="text-neutral-300 leading-relaxed space-y-2 pt-1">
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">01.</span>
              Use Aceon for your own learning
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">02.</span>
              Don&apos;t scrape, copy, or redistribute content from the service
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">03.</span>
              Don&apos;t disrupt, break, or attempt unauthorized access to the service
            </li>
          </ul>
        </section>

        {/* Content & Ownership */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Content &amp; Ownership</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Lecture videos and course materials belong to IIT Madras and their respective
            creators; Aceon doesn&apos;t claim ownership of them. The Aceon name, interface, and
            design belong to the project and its creator.
          </p>
        </section>

        {/* Service Availability */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Service Availability</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is a free, best-effort project. Features may change, and the service may be
            unavailable or discontinued at any time without notice.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="space-y-3 max-w-2xl w-full">
          <h2 className="text-2xl font-display font-black uppercase">Disclaimer</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <div className="bg-neutral-900 border-2 border-[#E62E2D] p-4 mt-1">
            <p className="text-neutral-300 leading-relaxed text-sm">
              Aceon is not officially affiliated with, or endorsed by, IIT Madras. It is an
              independent project created by a student, for students.
            </p>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Limitation of Liability</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is provided &quot;as is,&quot; without warranties of any kind. We aren&apos;t liable
            for any damages arising from your use of the service, including data loss,
            interruptions, or inaccuracies in content.
          </p>
        </section>

        {/* Changes to These Terms */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Changes to These Terms</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            We may update these terms from time to time. Continued use of Aceon after changes
            means you accept the updated terms.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Contact</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Questions about these terms? Reach out on{" "}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E62E2D] hover:underline"
            >
              LinkedIn
            </a>{" "}
            or{" "}
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E62E2D] hover:underline"
            >
              X
            </a>.
          </p>
        </section>
      </div>
    </LegalShell>
  );
}
