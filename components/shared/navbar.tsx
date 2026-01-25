"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuIcon, BookOpenIcon, HomeIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const routes = [
  { name: "HQ", path: "/", icon: HomeIcon },
  { name: "Missions", path: "/lectures", icon: BookOpenIcon },
];

export function Navbar() {
  const pathname = usePathname();
  
  // Check if we're in the lectures section (hide Home nav item)
  const isInLectures = pathname.startsWith("/lectures");
  const visibleRoutes = isInLectures ? routes.filter(r => r.path !== "/") : routes;

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-[#E62E2D] bg-black shadow-[0_4px_0_rgba(230,46,45,0.2)]">
      <div className="absolute inset-0 bg-[url('/images/navbar-bg.jpg')] bg-[length:100%_auto] bg-[center_35%] opacity-100 mix-blend-normal pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="flex h-16 w-full items-center px-6 relative z-10">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-2 transition-transform hover:scale-105 group hover:-rotate-1">
             <div className="p-1.5 bg-black text-[#E62E2D] border-2 border-[#E62E2D] shadow-[2px_2px_0px_0px_#E62E2D] group-hover:bg-[#E62E2D] group-hover:text-black transition-all">
                <BookOpenIcon className="h-5 w-5" />
             </div>
            <span className="hidden font-display tracking-widest text-2xl uppercase sm:inline-block text-white group-hover:text-[#E62E2D] transition-colors drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Aceon</span>
          </Link>
          {visibleRoutes.length > 0 && (
            <nav className="flex items-center space-x-8 text-sm font-bold uppercase tracking-wider">
              {visibleRoutes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    "transition-all hover:text-[#E62E2D] relative py-1 group text-lg",
                    pathname === route.path 
                      ? "text-[#E62E2D]" 
                      : "text-neutral-400 hover:text-white"
                  )}
                >
                  {route.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-[3px] bg-[#E62E2D] transition-all duration-300 origin-left skew-x-12",
                    pathname === route.path ? "w-full shadow-[0_0_8px_#E62E2D]" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden hover:bg-[#E62E2D]/10 hover:text-[#E62E2D] text-white"
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
              <SheetContent side="left" className="pr-0 border-r-2 border-[#E62E2D] bg-black text-white">
             <VisuallyHidden>
               <SheetTitle>Menu</SheetTitle>
             </VisuallyHidden>
            <Link href="/" className="flex items-center gap-2 mb-8 pl-2">
              <div className="p-1.5 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(230,46,45,1)]">
                  <BookOpenIcon className="h-6 w-6" />
              </div>
              <span className="font-display font-black text-xl tracking-widest uppercase">Aceon</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-2">
              <div className="flex flex-col space-y-4">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "flex items-center gap-4 py-3 text-xl font-display font-black uppercase tracking-wider transition-all hover:text-[#E62E2D] hover:pl-4",
                      pathname === route.path ? "text-[#E62E2D] border-l-4 border-[#E62E2D] pl-4 bg-white/5" : "text-neutral-400"
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

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
