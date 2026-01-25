"use client";

import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { Play, Bookmark, StickyNote, GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden">
      
      <Hero />
      
      <section className="container px-4 md:px-6 py-24 space-y-16 relative z-10 bg-black">
        <div className="absolute inset-0 bg-[url('/images/halftone.svg')] opacity-5 pointer-events-none mix-blend-screen" />
        <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-8xl font-display font-black tracking-tighter uppercase text-white drop-shadow-[4px_4px_0_#E62E2D] -rotate-1 skew-x-[-5deg]">
            Weapons of Mass <span className="text-[#E62E2D] bg-white px-2 text-6xl md:text-8xl inline-block transform skew-x-[10deg] border-4 border-black">Construction</span>
          </h2>
          <p className="text-xl text-white font-display uppercase tracking-widest bg-[#E62E2D] inline-block px-4 py-1 transform rotate-1">
            Equip yourself. Dominate the curriculum.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          
          <div className="group relative border-4 border-white bg-black p-8 hover:border-[#E62E2D] hover:bg-white hover:text-black transition-all duration-200 shadow-[8px_8px_0px_0px_#333] hover:shadow-[12px_12px_0px_0px_#E62E2D] hover:-translate-y-2 clip-corner">
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#E62E2D] z-20 flex items-center justify-center border-l-4 border-b-4 border-black group-hover:bg-black group-hover:border-[#E62E2D] transition-colors">
                 <span className="font-display text-2xl font-black text-white group-hover:text-[#E62E2D]">01</span>
            </div>
            <div className="relative z-10 flex flex-col items-start h-full space-y-4">
              <div className="p-3 bg-white text-black border-4 border-black group-hover:bg-[#E62E2D] group-hover:text-white transition-colors transform -rotate-3 group-hover:rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Play className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-display font-black uppercase tracking-tight leading-none mt-2">Elimination<br/><span className="text-[#E62E2D] group-hover:text-black">Status</span></h3>
              <p className="font-sans font-bold text-sm leading-relaxed text-neutral-400 group-hover:text-black/80 border-l-4 border-[#E62E2D] pl-4 group-hover:border-black">
                Track completion rates. Resume hunt instantly. Sync data across all terminals.
              </p>
            </div>
          </div>

          <div className="group relative border-4 border-white bg-black p-8 hover:border-[#E62E2D] hover:bg-white hover:text-black transition-all duration-200 shadow-[8px_8px_0px_0px_#333] hover:shadow-[12px_12px_0px_0px_#E62E2D] hover:-translate-y-2 clip-corner">
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#E62E2D] z-20 flex items-center justify-center border-l-4 border-b-4 border-black group-hover:bg-black group-hover:border-[#E62E2D] transition-colors">
                 <span className="font-display text-2xl font-black text-white group-hover:text-[#E62E2D]">02</span>
            </div>
            <div className="relative z-10 flex flex-col items-start h-full space-y-4">
              <div className="p-3 bg-white text-black border-4 border-black group-hover:bg-[#E62E2D] group-hover:text-white transition-colors transform rotate-2 group-hover:-rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Bookmark className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-display font-black uppercase tracking-tight leading-none mt-2">Vital<br/><span className="text-[#E62E2D] group-hover:text-black">Points</span></h3>
              <p className="font-sans font-bold text-sm leading-relaxed text-neutral-400 group-hover:text-black/80 border-l-4 border-[#E62E2D] pl-4 group-hover:border-black">
                Mark critical weaknesses. Jump to key intel. Efficient revision protocol.
              </p>
            </div>
          </div>

          <div className="group relative border-4 border-white bg-black p-8 hover:border-[#E62E2D] hover:bg-white hover:text-black transition-all duration-200 shadow-[8px_8px_0px_0px_#333] hover:shadow-[12px_12px_0px_0px_#E62E2D] hover:-translate-y-2 clip-corner">
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#E62E2D] z-20 flex items-center justify-center border-l-4 border-b-4 border-black group-hover:bg-black group-hover:border-[#E62E2D] transition-colors">
                 <span className="font-display text-2xl font-black text-white group-hover:text-[#E62E2D]">03</span>
            </div>
            <div className="relative z-10 flex flex-col items-start h-full space-y-4">
              <div className="p-3 bg-white text-black border-4 border-black group-hover:bg-[#E62E2D] group-hover:text-white transition-colors transform -rotate-1 group-hover:rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <StickyNote className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-display font-black uppercase tracking-tight leading-none mt-2">Field<br/><span className="text-[#E62E2D] group-hover:text-black">Logs</span></h3>
              <p className="font-sans font-bold text-sm leading-relaxed text-neutral-400 group-hover:text-black/80 border-l-4 border-[#E62E2D] pl-4 group-hover:border-black">
                Record contextual data. Link logs to video frames. Precision recall.
              </p>
            </div>
          </div>
        </div>
      </section>

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
