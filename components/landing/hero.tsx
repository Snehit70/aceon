"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crosshair } from "lucide-react";
import { motion } from "framer-motion";
import { useUser, SignUpButton } from "@clerk/nextjs";

import { Particles } from "@/components/landing/particles";

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative flex min-h-[calc(100dvh-67px)] flex-col items-center justify-center overflow-hidden px-4 py-12 md:py-24 text-center">
      <div className="absolute inset-0 z-0 select-none bg-black">
        <div 
            className="absolute inset-0 bg-[url('/images/hero-bg-chainsaw.jpg')] bg-cover bg-center opacity-50 mix-blend-luminosity grayscale contrast-125" 
        />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[#E62E2D]/10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <Particles />
      </div>

      <div className="z-10 flex max-w-7xl flex-col items-center gap-6">
        
        <motion.div 
          initial={{ opacity: 0, scale: 1.5, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className="relative inline-block mb-4"
        >
             <h2 className="font-display text-4xl md:text-6xl italic font-black uppercase tracking-tighter text-white drop-shadow-[4px_4px_0_#E62E2D]">
                Devour Lectures. <span className="text-black bg-[#E62E2D] px-2 transform -skew-x-12 inline-block">Conquer Degree.</span>
             </h2>
        </motion.div>

        <div className="relative py-4 group">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center font-display uppercase font-black tracking-tighter leading-[0.85]"
          >
            <span className="text-6xl md:text-8xl lg:text-[10rem] text-transparent bg-clip-text bg-[url('/images/hero-aki.jpg')] bg-cover bg-center drop-shadow-[0_0_10px_rgba(230,46,45,0.5)] [-webkit-text-stroke:2px_white]">
              Academic
            </span>
            <span className="text-7xl md:text-9xl lg:text-[12rem] text-transparent bg-clip-text bg-[url('/images/hero-text-mask.webp')] bg-cover bg-center relative z-10 drop-shadow-[6px_6px_0_rgba(0,0,0,1)] [-webkit-text-stroke:2px_white]">
               Weapon
            </span>
          </motion.h1>
          
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "120%" }}
             transition={{ delay: 0.6, duration: 0.3 }}
             className="absolute top-[60%] left-[50%] -translate-x-1/2 h-4 bg-[#E62E2D] -rotate-2 opacity-80 pointer-events-none mix-blend-exclusion"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-col gap-6 sm:flex-row items-center"
        >
          <Button 
            asChild 
            size="lg" 
            className="group/btn relative h-20 px-12 overflow-hidden border-0 bg-[#E62E2D] text-white font-display text-3xl uppercase tracking-widest transition-all duration-200 ease-out -skew-x-6 shadow-[6px_6px_0px_0px_#000] hover:skew-x-0 hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] before:absolute before:inset-0 before:bg-[url('/images/noise.svg')] before:opacity-20 before:mix-blend-overlay"
          >
            <Link href="/lectures">
              <span className="inline-block skew-x-6 group-hover/btn:skew-x-0 transition-transform duration-200">Start_Hunt</span>
            </Link>
          </Button>

          {isSignedIn ? (
             <Button 
                asChild 
                variant="outline"
                size="lg" 
                className="group/btn relative h-20 px-12 border-4 border-[#E62E2D] bg-black text-white font-display text-3xl uppercase tracking-widest transition-all duration-200 ease-out skew-x-6 shadow-[6px_6px_0px_0px_#E62E2D] hover:skew-x-0 hover:bg-[#E62E2D] hover:border-[#E62E2D] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#E62E2D]"
              >
                <Link href="/lectures">
                  <span className="inline-block -skew-x-6 group-hover/btn:skew-x-0 transition-transform duration-200">My_Missions</span>
                </Link>
              </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button 
                variant="outline"
                size="lg" 
                className="group/btn relative h-20 px-12 border-4 border-[#E62E2D] bg-black text-white font-display text-3xl uppercase tracking-widest transition-all duration-200 ease-out skew-x-6 shadow-[6px_6px_0px_0px_#E62E2D] hover:skew-x-0 hover:bg-[#E62E2D] hover:border-[#E62E2D] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#E62E2D] cursor-pointer"
              >
                <span className="inline-block -skew-x-6 group-hover/btn:skew-x-0 transition-transform duration-200">Join_Bureau</span>
              </Button>
            </SignUpButton>
          )}
        </motion.div>
      </div>
    </section>
  );
}
