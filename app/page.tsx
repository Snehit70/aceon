"use client";

import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { GraduationCap } from "lucide-react";
import packageJson from "@/package.json";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden">
      
      <Hero />

      <footer className="border-t-4 border-black py-3 bg-[#E62E2D]">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold uppercase text-black">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-black text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display font-black text-lg tracking-widest">Aceon</span>
          </div>
          <div className="flex items-center gap-6 tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="https://github.com/Snehit70" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="font-sans text-xs opacity-80 hidden sm:block">
            © {new Date().getFullYear()} Aceon • v{packageJson.version}
          </p>
        </div>
      </footer>
    </div>
  );
}
