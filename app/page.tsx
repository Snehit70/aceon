"use client";

import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden">
      
      <Hero />

      <footer className="border-t-[8px] border-black py-6 bg-[#E62E2D] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10 mix-blend-multiply pointer-events-none" />
        <div className="absolute -left-10 -bottom-20 text-[15rem] font-display font-black text-black opacity-10 rotate-12 select-none pointer-events-none">
             ACEON
        </div>
        <div className="container relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold uppercase text-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-white transform -rotate-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
                <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-display font-black text-3xl tracking-widest">Aceon</span>
          </div>
          <div className="flex gap-8 tracking-widest text-lg">
            <Link href="#" className="hover:text-white hover:underline decoration-4 underline-offset-4 transition-all">Privacy</Link>
            <Link href="#" className="hover:text-white hover:underline decoration-4 underline-offset-4 transition-all">Terms</Link>
            <Link href="#" className="hover:text-white hover:underline decoration-4 underline-offset-4 transition-all">GitHub</Link>
          </div>
          <p className="font-sans text-xs opacity-80">© {new Date().getFullYear()} Aceon. Public Safety Bureau.</p>
        </div>
      </footer>
    </div>
  );
}
