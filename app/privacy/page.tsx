import { LegalShell } from "@/components/shared/legal-shell";

const LINKEDIN_URL = "https://www.linkedin.com/in/snehit70/";
const X_URL = "https://x.com/snehit70";

export default function PrivacyPage() {
  return (
    <LegalShell active="privacy">
      <div className="flex flex-col items-center text-center space-y-12 sm:space-y-16">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-[clamp(2.5rem,14vw,4.5rem)] md:text-7xl font-display font-black uppercase tracking-normal md:tracking-tighter break-words">
            Privacy <span className="text-[#E62E2D]">Policy</span>
          </h1>
          <p className="text-neutral-400 font-mono text-sm">
            Last updated: June 2026
          </p>
        </div>

        {/* Overview */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Overview</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            This policy explains what data Aceon collects, why it&apos;s collected, and the
            control you have over it. In short: Aceon stores only what it needs to run your
            account and keep track of your learning progress.
          </p>
        </section>

        {/* What We Collect */}
        <section className="space-y-4 max-w-2xl w-full">
          <h2 className="text-2xl font-display font-black uppercase">What We Collect</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <div className="space-y-4 pt-1 text-left sm:text-center">
            <div>
              <p className="font-bold text-white">Account</p>
              <p className="text-neutral-300 leading-relaxed">
                When you sign in through Clerk, we store your email address, name, profile
                photo, and the date you joined.
              </p>
            </div>
            <div>
              <p className="font-bold text-white">Preferences</p>
              <p className="text-neutral-300 leading-relaxed">
                Your selected academic level and the courses you mark as enrolled.
              </p>
            </div>
            <div>
              <p className="font-bold text-white">Learning activity</p>
              <p className="text-neutral-300 leading-relaxed">
                For each video: how much you&apos;ve watched, your last playback position,
                whether it&apos;s complete, and when you last watched it.
              </p>
            </div>
            <div>
              <p className="font-bold text-white">Notes</p>
              <p className="text-neutral-300 leading-relaxed">
                The text and timestamps of any notes you write on a video.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Your Data */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">How We Use Your Data</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <ul className="text-neutral-300 leading-relaxed space-y-2 pt-1">
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">01.</span>
              Track your progress and let you resume where you left off
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">02.</span>
              Sync your progress and notes across your devices
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">03.</span>
              Show the right courses for your level and enrolled list
            </li>
            <li className="flex items-start justify-center gap-2">
              <span className="text-[#E62E2D] font-bold">04.</span>
              Operate, maintain, and secure your account
            </li>
          </ul>
        </section>

        {/* Third-Party Services */}
        <section className="space-y-4 max-w-2xl w-full">
          <h2 className="text-2xl font-display font-black uppercase">Third-Party Services</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon relies on these providers, each of which handles data under its own privacy
            policy:
          </p>
          <div className="grid gap-4 sm:grid-cols-3 pt-1">
            <div className="bg-neutral-900 border-2 border-neutral-800 p-4">
              <h3 className="font-bold text-[#E62E2D]">Clerk</h3>
              <p className="text-sm text-neutral-400">Authentication</p>
            </div>
            <div className="bg-neutral-900 border-2 border-neutral-800 p-4">
              <h3 className="font-bold text-[#E62E2D]">Convex</h3>
              <p className="text-sm text-neutral-400">Data storage</p>
            </div>
            <div className="bg-neutral-900 border-2 border-neutral-800 p-4">
              <h3 className="font-bold text-[#E62E2D]">YouTube</h3>
              <p className="text-sm text-neutral-400">Video playback</p>
            </div>
          </div>
        </section>

        {/* Cookies & Tracking */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Cookies &amp; Tracking</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            Aceon uses cookies set by Clerk to keep you signed in. We don&apos;t currently use
            analytics, advertising, or third-party tracking. Lectures are embedded from
            YouTube, which may set its own cookies and collect data under Google&apos;s privacy
            policy when you watch.
          </p>
        </section>

        {/* Your Rights */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Your Rights</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            You can ask to see, correct, or delete your data at any time. Contact us to
            request deletion and we&apos;ll remove your account, progress, and notes within
            30 days.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-3 max-w-2xl">
          <h2 className="text-2xl font-display font-black uppercase">Contact</h2>
          <span className="mx-auto block h-1 w-12 bg-[#E62E2D]" aria-hidden="true" />
          <p className="text-neutral-300 leading-relaxed pt-1">
            For privacy questions or data requests, reach out on{" "}
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
