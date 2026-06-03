import { LegalShell, LegalHeading, LegalSection } from "@/components/shared/legal-shell";
import { SOCIAL } from "@/lib/links";

export default function TermsPage() {
  return (
    <LegalShell active="terms">
      <div className="flex flex-col items-center text-center space-y-12 sm:space-y-16">
        <LegalHeading subtitle="Last updated: June 2026">
          Terms of <span className="text-primary">Service</span>
        </LegalHeading>

        <LegalSection title="Acceptance">
          <p className="text-neutral-300 leading-relaxed pt-1">
            By using Aceon, you agree to these terms. If you don&apos;t agree with them, please
            stop using the service.
          </p>
        </LegalSection>

        <LegalSection title="What Aceon Is">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is a free study companion for IIT Madras BS Degree students. It organizes
            publicly available lecture content so you can watch and track your progress in one
            place. It is an independent project and is not officially affiliated with IIT
            Madras.
          </p>
        </LegalSection>

        <LegalSection title="Your Account">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Using Aceon requires an account, which you create by signing in through Clerk.
            You&apos;re responsible for keeping your account secure and for activity that happens
            under it.
          </p>
        </LegalSection>

        <LegalSection title="Acceptable Use">
          <ul className="text-neutral-300 leading-relaxed space-y-2 pt-1">
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">01.</span>
              Use Aceon for your own learning
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">02.</span>
              Don&apos;t scrape, copy, or redistribute content from the service
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">03.</span>
              Don&apos;t disrupt, break, or attempt unauthorized access to the service
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="Content & Ownership">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Lecture videos and course materials belong to IIT Madras and their respective
            creators; Aceon doesn&apos;t claim ownership of them. The Aceon name, interface, and
            design belong to the project and its creator.
          </p>
        </LegalSection>

        <LegalSection title="Service Availability">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is a free, best-effort project. Features may change, and the service may be
            unavailable or discontinued at any time without notice.
          </p>
        </LegalSection>

        <LegalSection title="Disclaimer" className="w-full">
          <div className="bg-neutral-900 border-2 border-primary p-4 mt-1">
            <p className="text-neutral-300 leading-relaxed text-sm">
              Aceon is not officially affiliated with, or endorsed by, IIT Madras. It is an
              independent project created by a student, for students.
            </p>
          </div>
        </LegalSection>

        <LegalSection title="Limitation of Liability">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is provided &quot;as is,&quot; without warranties of any kind. We aren&apos;t liable
            for any damages arising from your use of the service, including data loss,
            interruptions, or inaccuracies in content.
          </p>
        </LegalSection>

        <LegalSection title="Changes to These Terms">
          <p className="text-neutral-300 leading-relaxed pt-1">
            We may update these terms from time to time. Continued use of Aceon after changes
            means you accept the updated terms.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Questions about these terms? Reach out on{" "}
            <a
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              LinkedIn
            </a>{" "}
            or{" "}
            <a
              href={SOCIAL.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              X
            </a>.
          </p>
        </LegalSection>
      </div>
    </LegalShell>
  );
}
