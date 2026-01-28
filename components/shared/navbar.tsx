"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BookOpenIcon } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-[#E62E2D] bg-black shadow-[0_4px_0_rgba(230,46,45,0.2)]">
      <div className="absolute inset-0 bg-[url('/images/texture-navbar.jpg')] bg-[length:100%_auto] bg-[center_35%] opacity-100 mix-blend-normal pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="flex h-16 w-full items-center px-6 relative z-10">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2 transition-transform hover:scale-105 group hover:-rotate-1">
             <div className="p-1.5 bg-black text-[#E62E2D] border-2 border-[#E62E2D] shadow-[2px_2px_0px_0px_#E62E2D] group-hover:bg-[#E62E2D] group-hover:text-black transition-all">
                <BookOpenIcon className="h-5 w-5" />
             </div>
            <span className="hidden font-display tracking-widest text-2xl uppercase sm:inline-block text-white group-hover:text-[#E62E2D] transition-colors drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Aceon</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <div className="flex items-center gap-2">
             <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default" size="sm" className="px-6 font-display font-bold tracking-wider uppercase bg-[#E62E2D] text-black hover:bg-white hover:text-black border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[4px_4px_0px_0px_#E62E2D] transition-all rounded-none">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-primary/10 transition-all hover:ring-primary/30"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
