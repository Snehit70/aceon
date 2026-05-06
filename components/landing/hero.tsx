"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useUser, SignUpButton } from "@clerk/nextjs";

import { Particles } from "@/components/landing/particles";

/**
 * Hero - Landing page hero section with CTA buttons.
 * 
 * **Context**: The main visual entry point for new users. Features the "Chainsaw Man" 
 * themed design with animated text, background effects, and primary CTAs.
 * 
 * **Integrations**:
 * - Clerk: Uses `useUser` to show different CTAs for signed-in vs. anonymous users.
 * - Particles: Renders animated background particles for visual effect.
 * 
 * **User Flow**:
 * - Anonymous users see "Start_Hunt" (browse) and "Join_Bureau" (sign up).
 * - Signed-in users see "Start_Hunt" and "My_Missions" (dashboard).
 * 
 * **Style**: Aggressive brutalist design with skewed buttons, text masks, and blood red accents.
 * 
 * @returns The hero section with animated content and CTAs.
 */
export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section className="relative flex min-h-[calc(100dvh-59px)] sm:min-h-[calc(100dvh-67px)] flex-col items-center justify-start overflow-hidden px-3 pb-10 pt-24 sm:justify-center sm:px-4 sm:py-12 md:py-24 text-center">
      <div className="absolute inset-0 z-0 select-none bg-black">
        <Image
          src="/images/hero-bg-chainsaw.webp"
          alt=""
          fill
          priority
          className="object-cover opacity-50 mix-blend-luminosity grayscale contrast-125"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAAABAAAAAAAAAAAA"
        />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[#E62E2D]/10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <Particles />
      </div>

      <div className="z-10 flex max-w-7xl flex-col items-center gap-4 sm:gap-6">
        
        <motion.div 
          initial={{ opacity: 0, scale: 1.5, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 0.4, ease: "backOut" }}
          className="relative inline-block mb-1 sm:mb-4 max-w-full"
        >
             <h2 className="font-display text-[clamp(1.65rem,8.7vw,2.3rem)] sm:text-4xl md:text-6xl italic font-black uppercase tracking-normal sm:tracking-tighter text-white drop-shadow-[3px_3px_0_#E62E2D] sm:drop-shadow-[4px_4px_0_#E62E2D] leading-[0.95]">
                Devour Lectures. <span className="text-black bg-[#E62E2D] px-2 transform -skew-x-12 inline-block mt-1">Conquer Degree.</span>
             </h2>
        </motion.div>

        <div className="relative py-1 sm:py-4 group max-w-full">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center font-display uppercase font-black tracking-normal sm:tracking-tighter leading-[0.85]"
          >
            <span className="text-[clamp(3rem,15.5vw,4.8rem)] md:text-8xl lg:text-[10rem] text-transparent bg-clip-text bg-[url('/images/hero-aki.jpg')] bg-cover bg-center drop-shadow-[0_0_10px_rgba(230,46,45,0.5)] [-webkit-text-stroke:1px_white] md:[-webkit-text-stroke:2px_white]">
              Academic
            </span>
            <span className="text-[clamp(3.6rem,18vw,5.7rem)] md:text-9xl lg:text-[12rem] text-transparent bg-clip-text bg-[url('/images/hero-text-mask.webp')] bg-cover bg-center relative z-10 drop-shadow-[5px_5px_0_rgba(0,0,0,1)] sm:drop-shadow-[6px_6px_0_rgba(0,0,0,1)] [-webkit-text-stroke:1px_white] md:[-webkit-text-stroke:2px_white]">
               Weapon
            </span>
          </motion.h1>
          
          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "120%" }}
             transition={{ delay: 0.6, duration: 0.3 }}
             className="absolute top-[60%] left-[50%] -translate-x-1/2 h-3 sm:h-4 bg-[#E62E2D] -rotate-2 opacity-80 pointer-events-none mix-blend-exclusion"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 sm:mt-12 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-6"
        >
          {isSignedIn ? (
            <Button 
              asChild 
              size="lg" 
              className="group/btn relative min-h-[48px] w-full overflow-hidden border-0 bg-[#E62E2D] px-7 text-white font-display text-base uppercase tracking-widest transition-all duration-200 ease-out -skew-x-3 shadow-[4px_4px_0px_0px_#000] hover:skew-x-0 hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] before:absolute before:inset-0 before:bg-[url('/images/noise.svg')] before:opacity-20 before:mix-blend-overlay sm:h-20 sm:w-auto sm:px-12 sm:text-3xl sm:-skew-x-6 sm:shadow-[6px_6px_0px_0px_#000]"
            >
              <Link href="/lectures?tab=enrolled">
                <span className="inline-block skew-x-6 group-hover/btn:skew-x-0 transition-transform duration-200">My_Missions</span>
              </Link>
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button 
                size="lg" 
                className="group/btn relative min-h-[48px] w-full overflow-hidden border-0 bg-[#E62E2D] px-7 text-white font-display text-base uppercase tracking-widest transition-all duration-200 ease-out -skew-x-3 shadow-[4px_4px_0px_0px_#000] hover:skew-x-0 hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] before:absolute before:inset-0 before:bg-[url('/images/noise.svg')] before:opacity-20 before:mix-blend-overlay cursor-pointer sm:h-20 sm:w-auto sm:px-12 sm:text-3xl sm:-skew-x-6 sm:shadow-[6px_6px_0px_0px_#000]"
              >
                <span className="inline-block skew-x-6 group-hover/btn:skew-x-0 transition-transform duration-200">Join_Bureau</span>
              </Button>
            </SignUpButton>
          )}

          <Button 
            asChild 
            variant="outline"
            size="lg" 
            className="group/btn relative min-h-[48px] w-full border-[3px] border-[#E62E2D] bg-black px-7 text-white font-display text-base uppercase tracking-widest transition-all duration-200 ease-out skew-x-3 shadow-[4px_4px_0px_0px_#E62E2D] hover:skew-x-0 hover:bg-[#E62E2D] hover:border-[#E62E2D] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#E62E2D] sm:h-20 sm:w-auto sm:border-4 sm:px-12 sm:text-3xl sm:skew-x-6 sm:shadow-[6px_6px_0px_0px_#E62E2D]"
          >
            <Link href="/lectures?tab=library">
              <span className="inline-block -skew-x-6 group-hover/btn:skew-x-0 transition-transform duration-200">Start_Hunt</span>
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
