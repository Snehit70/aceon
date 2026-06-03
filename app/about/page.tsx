import { LegalShell } from "@/components/shared/legal-shell";

const LINKEDIN_URL = "https://www.linkedin.com/in/snehit70/";
const X_URL = "https://x.com/snehit70";

export default function AboutPage() {
  return (
    <LegalShell active="about">
      <div className="flex flex-col items-center text-center space-y-12 sm:space-y-16">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-[clamp(2.5rem,14vw,4.5rem)] md:text-7xl font-display font-black uppercase tracking-normal md:tracking-tighter break-words">
            About <span className="text-[#E62E2D]">Aceon</span>
          </h1>
          <p className="text-neutral-400 font-mono text-sm">
            A focused study companion for IIT Madras BS students.
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">What Aceon Is</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is a study companion for IIT Madras BS Degree students. It brings your
            course lectures, video playback, and progress tracking into one clean,
            distraction-free place, so you can find the right lecture quickly and pick up
            exactly where you left off.
          </p>
        </section>

        {/* What you can do */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">What You Can Do</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <ul className="text-neutral-300 leading-relaxed space-y-2 pt-1">
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">→</span>
              Watch course lectures and resume from where you last stopped
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">→</span>
              Track completion per video, per week, and per course
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">→</span>
              Switch between your enrolled courses and the full course library
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">→</span>
              Browse and filter courses by level: Foundation, Diploma, or Degree
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">→</span>
              Take timestamped notes while you watch
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">→</span>
              Use it on desktop or on a layout built for mobile
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Who It&apos;s For</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is built for IIT Madras BS Degree students at any stage, whether you&apos;re
            at the Foundation, Diploma, or Degree level. If you want a simpler way to work
            through your coursework and keep track of what you&apos;ve finished, it&apos;s for you.
          </p>
        </section>

        {/* The Project */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">The Project</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon is an independent project built and maintained by a student. The source
            code is currently private and is being prepared to be made public soon.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Contact</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Questions, feedback, or bug reports? Reach out on{" "}
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
