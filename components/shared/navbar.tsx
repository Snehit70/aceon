"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuIcon, CalculatorIcon, BookOpenIcon, HomeIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const routes = [
  { name: "Home", path: "/", icon: HomeIcon },
  { name: "Lectures", path: "/lectures", icon: BookOpenIcon },
  { name: "Calculator", path: "/calculator", icon: CalculatorIcon },
  { name: "Notes", path: "/notes", icon: BookOpenIcon },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-2 transition-transform hover:scale-105">
             <div className="p-1 bg-primary/10 rounded-md">
                <BookOpenIcon className="h-5 w-5 text-primary" />
             </div>
            <span className="hidden font-bold sm:inline-block tracking-tight text-lg">Aceon</span>
          </Link>
          <nav className="flex items-center space-x-8 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "transition-all hover:text-primary relative py-1",
                  pathname === route.path 
                    ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden hover:bg-primary/5 hover:text-primary"
            >
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 border-r-primary/20 bg-background/95 backdrop-blur-xl">
             <VisuallyHidden>
               <SheetTitle>Menu</SheetTitle>
             </VisuallyHidden>
            <Link href="/" className="flex items-center gap-2 mb-8 pl-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">Aceon</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-2">
              <div className="flex flex-col space-y-4">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "flex items-center gap-4 py-3 text-lg font-medium transition-colors hover:text-primary",
                      pathname === route.path ? "text-primary" : "text-muted-foreground"
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

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search could go here */}
          </div>
          <div className="flex items-center gap-2">
             <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default" size="sm" className="rounded-full px-6 shadow-sm hover:shadow-primary/20">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="mr-2 hidden md:inline-flex rounded-full hover:bg-primary/5 hover:text-primary">
                  Dashboard
                </Button>
              </Link>
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
