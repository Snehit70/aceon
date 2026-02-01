import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white">
      {/* Header */}
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

      {/* Content */}
      <main className="container py-16 max-w-3xl">
        <div className="space-y-12">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter">
              Privacy<span className="text-[#E62E2D]">_Protocol</span>
            </h1>
            <p className="text-neutral-400 font-mono text-sm">
              Last updated: January 2026
            </p>
          </div>

          {/* Sections */}
          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Data Collection</h2>
            <p className="text-neutral-300 leading-relaxed">
              Aceon collects minimal data required to provide you with a personalized learning experience. 
              This includes your authentication information (via Clerk) and your course progress data 
              stored securely in Convex.
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">How We Use Your Data</h2>
            <ul className="text-neutral-300 leading-relaxed space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#E62E2D] font-bold">01.</span>
                Track your lecture completion progress
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E62E2D] font-bold">02.</span>
                Sync your progress across devices
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#E62E2D] font-bold">03.</span>
                Personalize your learning experience
              </li>
            </ul>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Third-Party Services</h2>
            <p className="text-neutral-300 leading-relaxed mb-4">
              We integrate with the following services:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-neutral-900 border-2 border-neutral-800 p-4">
                <h3 className="font-bold text-[#E62E2D]">Clerk</h3>
                <p className="text-sm text-neutral-400">Authentication</p>
              </div>
              <div className="bg-neutral-900 border-2 border-neutral-800 p-4">
                <h3 className="font-bold text-[#E62E2D]">Convex</h3>
                <p className="text-sm text-neutral-400">Database</p>
              </div>
              <div className="bg-neutral-900 border-2 border-neutral-800 p-4">
                <h3 className="font-bold text-[#E62E2D]">YouTube</h3>
                <p className="text-sm text-neutral-400">Video Embeds</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Your Rights</h2>
            <p className="text-neutral-300 leading-relaxed">
              You have the right to request deletion of your data at any time. 
              Contact us via GitHub to make such requests. We will process your 
              request within 30 days.
            </p>
          </section>

          <section className="space-y-4 border-l-4 border-[#E62E2D] pl-6">
            <h2 className="text-2xl font-display font-black uppercase">Contact</h2>
            <p className="text-neutral-300 leading-relaxed">
              For privacy-related inquiries, reach out via{" "}
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

      {/* Footer */}
      <footer className="border-t-4 border-black py-3 bg-[#E62E2D]">
        <div className="container flex items-center justify-between gap-4 text-sm font-bold uppercase text-black">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display font-black text-lg tracking-widest">Aceon</span>
          </div>
          <div className="flex items-center gap-6 tracking-widest">
            <Link href="/privacy" className="text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="https://github.com/Snehit70" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="font-sans text-xs opacity-80 hidden sm:block">© {new Date().getFullYear()} Aceon</p>
        </div>
      </footer>
    </div>
  );
}
