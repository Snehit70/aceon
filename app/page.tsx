"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Bookmark, StickyNote, GraduationCap, CheckCircle2 } from "lucide-react";
import { useUser, SignUpButton } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-mono selection:bg-accent selection:text-accent-foreground overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center space-y-10 py-32 md:py-40 lg:py-48 overflow-hidden">
        
        <div className="absolute inset-0 -z-10 pointer-events-none">
           <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-accent/5 blur-[120px] rounded-full animate-pulse-custom" />
           
           <div className="absolute bottom-0 w-full h-24 bg-[repeating-linear-gradient(45deg,#000,#000_20px,#E62E2D_20px,#E62E2D_40px)] opacity-20" />
        </div>

        <div className="container px-4 md:px-6 flex flex-col items-center space-y-8 text-center relative z-10">
          
          
          <div className="inline-flex items-center border-2 border-accent bg-black px-4 py-1.5 text-sm font-bold tracking-widest uppercase text-accent shadow-[4px_4px_0px_0px_rgba(43,255,0,0.4)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(43,255,0,0.6)] transition-all cursor-crosshair">
            <span className="flex h-2 w-2 bg-accent mr-3 animate-pulse" />
            Public Safety Bureau // Authorized Access Only
          </div>
          
          
          {/* Main Title */}
          <h1 className="font-display font-black tracking-tighter text-7xl md:text-9xl lg:text-[11rem] leading-[0.8] uppercase flex flex-col items-center relative group">
            <span className="relative z-10 text-transparent bg-clip-text bg-[url('/images/chainsaw-text-bg.webp')] bg-cover bg-center bg-no-repeat drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] [-webkit-text-stroke:2px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-300 select-none animate-pulse-custom">
              Your Academic
            </span>
            <span className="relative z-10 text-transparent bg-clip-text bg-[url('/images/chainsaw-text-bg.webp')] bg-cover bg-[center_bottom] bg-no-repeat drop-shadow-[0_0_2px_rgba(230,46,45,0.5)] [-webkit-text-stroke:2px_rgba(230,46,45,0.8)] hover:scale-105 transition-transform duration-300 delay-75 select-none">
              Weapon
            </span>
             
            <span className="absolute -z-10 text-[20rem] opacity-5 text-white/10 font-glitch top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">X</span>
          </h1>
          
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 font-mono uppercase tracking-widest border-l-4 border-accent pl-6 text-left">
            // Mission: Ace IITM BS Degree.<br/>
            // Targets: Video Surveillance, Field Logs, Vital Points.<br/>
            // Status: <span className="text-accent font-bold animate-pulse">Online</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto pt-8">
            <Button asChild size="lg" className="h-16 px-10 text-xl font-display font-bold uppercase tracking-widest border-2 border-accent bg-accent text-black hover:bg-black hover:text-accent hover:border-accent shadow-[6px_6px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#E62E2D] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all clip-corner rounded-none">
              <Link href="/lectures">
                Start_Hunt <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
            
            {isSignedIn ? (
              <Button asChild variant="outline" size="lg" className="h-16 px-10 text-xl font-display font-bold uppercase tracking-widest border-2 border-white/20 bg-transparent text-white hover:bg-white hover:text-black hover:border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all clip-corner rounded-none">
                <Link href="/lectures">
                  My_Missions
                </Link>
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button variant="outline" size="lg" className="h-16 px-10 text-xl font-display font-bold uppercase tracking-widest border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white hover:border-primary shadow-[6px_6px_0px_0px_rgba(230,46,45,0.2)] hover:shadow-[6px_6px_0px_0px_#E62E2D] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all clip-corner rounded-none cursor-pointer">
                  Sign_Up_Free
                </Button>
              </SignUpButton>
            )}
          </div>

          <div className="pt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground uppercase tracking-wider text-xs font-bold">
             <div className="flex items-center gap-2 border border-white/10 px-3 py-1 bg-white/5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>100% Free</span>
             </div>
             <div className="flex items-center gap-2 border border-white/10 px-3 py-1 bg-white/5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Open Source</span>
             </div>
             <div className="flex items-center gap-2 border border-white/10 px-3 py-1 bg-white/5">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Student Built</span>
             </div>
          </div>
        </div>
      </section>

      
      {/* Feature Grid */}
      <section className="container px-4 md:px-6 py-24 space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase text-white">
            Arsenal <span className="text-primary">//</span> Tools
          </h2>
          <p className="text-lg text-muted-foreground font-mono uppercase tracking-widest">
            Equip yourself for the academic hunt.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Card 1 */}
          <div className="group relative border-2 border-border bg-black/50 p-8 hover:border-accent transition-all duration-200 clip-corner">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-start h-full space-y-4">
              <div className="p-4 border-2 border-accent/20 bg-accent/5 mb-2 group-hover:bg-accent group-hover:text-black transition-colors duration-200">
                <Play className="h-8 w-8 text-accent group-hover:text-black" />
              </div>
              <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-white group-hover:text-accent">Elimination Status</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                Track completion rates. Resume hunt instantly. Sync data across all terminals.
              </p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity font-display text-4xl text-white/5 pointer-events-none select-none">01</div>
          </div>

          
          {/* Card 2 */}
          <div className="group relative border-2 border-border bg-black/50 p-8 hover:border-primary transition-all duration-200 clip-corner">
             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-start h-full space-y-4">
              <div className="p-4 border-2 border-primary/20 bg-primary/5 mb-2 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <Bookmark className="h-8 w-8 text-primary group-hover:text-white" />
              </div>
              <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-white group-hover:text-primary">Vital Points</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                Mark critical weaknesses. Jump to key intel. Efficient revision protocol.
              </p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity font-display text-4xl text-white/5 pointer-events-none select-none">02</div>
          </div>

          
          {/* Card 3 */}
          <div className="group relative border-2 border-border bg-black/50 p-8 hover:border-white transition-all duration-200 clip-corner">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-start h-full space-y-4">
              <div className="p-4 border-2 border-white/20 bg-white/5 mb-2 group-hover:bg-white group-hover:text-black transition-colors duration-200">
                <StickyNote className="h-8 w-8 text-white group-hover:text-black" />
              </div>
              <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-white group-hover:text-white">Field Logs</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                Record contextual data. Link logs to video frames. Precision recall.
              </p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity font-display text-4xl text-white/5 pointer-events-none select-none">03</div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-border py-12 bg-black relative">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground font-mono uppercase">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white clip-corner">
                <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-widest">Aceon</span>
          </div>
          <div className="flex gap-8 tracking-widest">
            <Link href="#" className="hover:text-accent hover:underline decoration-2 underline-offset-4 transition-all">Privacy</Link>
            <Link href="#" className="hover:text-accent hover:underline decoration-2 underline-offset-4 transition-all">Terms</Link>
            <Link href="#" className="hover:text-accent hover:underline decoration-2 underline-offset-4 transition-all">GitHub</Link>
          </div>
          <p>© {new Date().getFullYear()} Aceon. Open Source.</p>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent" />
      </footer>
    </div>
  );
}
