import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white">
      <header className="border-b-4 border-[#E62E2D] py-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-[#E62E2D] text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-display font-black text-xl tracking-widest">Aceon</span>
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="container py-16 max-w-3xl">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter">
              Terms<span className="text-[#E62E2D]">_of_Service</span>
            </h1>
            <p className="text-neutral-400 font-mono text-sm">
              Last updated: January 2026
            </p>
          </div>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Acceptance</h2>
            <p className="text-neutral-300 leading-relaxed">
              By accessing and using Aceon, you agree to be bound by these Terms of Service. 
              If you do not agree, please discontinue use immediately.
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Purpose</h2>
            <p className="text-neutral-300 leading-relaxed">
              Aceon is an unofficial academic companion designed for IITM BS Degree students. 
              It aggregates publicly available lecture content to provide a streamlined learning experience.
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">User Responsibilities</h2>
            <ul className="text-neutral-300 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#E62E2D] font-bold">01.</span>
                Use the platform for educational purposes only
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E62E2D] font-bold">02.</span>
                Do not attempt to scrape, copy, or redistribute content
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E62E2D] font-bold">03.</span>
                Maintain the security of your account credentials
              </li>
            </ul>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Intellectual Property</h2>
            <p className="text-neutral-300 leading-relaxed">
              All lecture content belongs to IIT Madras and respective content creators. 
              Aceon does not claim ownership of any educational materials. 
              The Aceon platform interface and design are open source.
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Disclaimer</h2>
            <div className="bg-neutral-900 border-2 border-[#E62E2D] p-4">
              <p className="text-neutral-300 leading-relaxed font-mono text-sm">
                Aceon is NOT officially affiliated with IIT Madras. 
                This is an independent, community-driven project created by students, for students.
              </p>
            </div>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Limitation of Liability</h2>
            <p className="text-neutral-300 leading-relaxed">
              Aceon is provided &quot;as is&quot; without warranties of any kind. We are not liable for 
              any damages arising from your use of the platform, including but not limited to 
              data loss, service interruptions, or inaccuracies in content.
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Changes to Terms</h2>
            <p className="text-neutral-300 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of Aceon 
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Contact</h2>
            <p className="text-neutral-300 leading-relaxed">
              Questions? Reach out via{" "}
              <a 
                href="https://github.com/Snehit70" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#E62E2D] hover:underline"
              >
                GitHub
              </a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t-4 border-black py-3 bg-[#E62E2D]">
        <div className="container flex items-center justify-between gap-4 text-sm font-bold uppercase text-black">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display font-black text-lg tracking-widest">Aceon</span>
          </div>
          <div className="flex items-center gap-6 tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-white">Terms</Link>
            <a href="https://github.com/Snehit70" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="font-sans text-xs opacity-80 hidden sm:block">© {new Date().getFullYear()} Aceon</p>
        </div>
      </footer>
    </div>
  );
}
