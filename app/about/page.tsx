import { LegalShell, LegalHeading, LegalSection } from "@/components/shared/legal-shell";
import { SOCIAL } from "@/lib/links";

export default function AboutPage() {
  return (
    <LegalShell active="about">
      <div className="flex flex-col items-center text-center space-y-12 sm:space-y-16">
        <LegalHeading subtitle="A focused study companion for IIT Madras BS students.">
          About <span className="text-primary">Aceon</span>
        </LegalHeading>

        <LegalSection title="What Aceon Is">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is a study companion for IIT Madras BS Degree students. It brings your
            course lectures, video playback, and progress tracking into one clean,
            distraction-free place, so you can find the right lecture quickly and pick up
            exactly where you left off.
          </p>
        </LegalSection>

        <LegalSection title="What You Can Do">
          <ul className="text-neutral-300 leading-relaxed space-y-2 pt-1">
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">→</span>
              Watch course lectures and resume from where you last stopped
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">→</span>
              Track completion per video, per week, and per course
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">→</span>
              Switch between your enrolled courses and the full course library
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">→</span>
              Browse and filter courses by level: Foundation, Diploma, or Degree
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">→</span>
              Take timestamped notes while you watch
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-primary font-bold">→</span>
              Use it on desktop or on a layout built for mobile
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="Who It's For">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is built for IIT Madras BS Degree students at any stage, whether you&apos;re
            at the Foundation, Diploma, or Degree level. If you want a simpler way to work
            through your coursework and keep track of what you&apos;ve finished, it&apos;s for you.
          </p>
        </LegalSection>

        <LegalSection title="The Project">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is an independent project built and maintained by a student. The source
            code is currently private and is being prepared to be made public soon.
          </p>
        </LegalSection>

        <LegalSection title="Contact">
          <p className="text-neutral-300 leading-relaxed pt-1">
            Questions, feedback, or bug reports? Reach out on{" "}
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
