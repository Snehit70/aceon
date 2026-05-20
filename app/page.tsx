"use client";

import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/landing/hero";
import packageJson from "@/package.json";

/**
 * LandingPage - Public marketing home page.
 * 
 * **Context**: The first page unauthenticated users see. 
 * Authenticated users are redirected to `/lectures` via middleware (not client-side).
 * 
 * **Components**:
 * - `Hero`: Main visual component with Chainsaw Man theme and "Start Hunt" CTA.
 * - Footer: Links to legal pages and version info.
 * 
 * **Style**: Uses the brand's Blood Red (#E62E2D) and Black aesthetic.
 * 
 * @returns The landing page layout.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden">
      
      <Hero />

      <footer className="border-t-4 border-black py-3 bg-[#E62E2D]">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-sm font-bold uppercase text-black">
          <div className="flex items-center gap-2">
            <Image
              src="/images/aceon-logo.webp"
              alt="Aceon logo"
              width={528}
              height={192}
              className="h-7 w-auto max-w-[88px] select-none"
            />
            <span className="font-display font-black text-lg tracking-widest">Aceon</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6 tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="https://github.com/Snehit70" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="font-sans text-xs opacity-80">
            © {new Date().getFullYear()} Aceon • v{packageJson.version}
          </p>
        </div>
      </footer>
    </div>
  );
}
