"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Info, History, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/Snehit70";

/**
 * Links surfaced in the navbar for signed-in users. Internal routes use Next
 * `Link`; the GitHub entry is external. Privacy/Terms live in the page footers,
 * not here.
 */
const navLinks = [
  { label: "About", href: "/about", icon: Info, external: false },
  { label: "Changelog", href: "/changelog", icon: History, external: false },
  { label: "GitHub", href: GITHUB_URL, icon: Github, external: true },
] as const;

/**
 * Navbar - Global navigation header.
 *
 * **Context**: Persistent header across all pages. Handles branding and authentication controls.
 *
 * **Integrations**:
 * - Clerk: Uses `SignedIn`/`SignedOut`/`SignInButton`/`UserButton` for auth state.
 *
 * **Navigation**: For signed-in users, surfaces About / GitHub as inline links on
 * tablet and up; on mobile the same links are folded into the Clerk avatar dropdown.
 * Privacy and Terms are reachable from the page footers rather than the navbar.
 *
 * **Style**: Implements the "Chainsaw Man" aesthetic with blood red (#E62E2D) accents,
 * textured background, and aggressive typography.
 *
 * @returns A sticky navigation header with logo and auth controls.
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-[#E62E2D] bg-black shadow-[0_4px_0_rgba(230,46,45,0.2)]">
      <div className="absolute inset-0 bg-[url('/images/texture-navbar.webp')] bg-[length:100%_auto] bg-[center_35%] opacity-100 mix-blend-normal pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="flex h-14 sm:h-16 w-full items-center px-4 sm:px-6 relative z-10">
        <div className="mr-3 sm:mr-4 flex">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 group hover:-rotate-1">
            <Image
              src="/images/aceon-logo.webp"
              alt="Aceon logo"
              width={528}
              height={192}
              className="h-7 w-auto max-w-[82px] select-none sm:h-10 sm:max-w-[132px]"
              priority
            />
            <span
              className="inline-flex font-display text-[0.96rem] uppercase leading-none tracking-[0.08em] transition-transform group-hover:translate-x-[1px] sm:text-[1.42rem] sm:tracking-[0.16em]"
              style={{
                textShadow: "1px 1px 0 rgba(230, 46, 45, 0.8), 0 0 10px rgba(230, 46, 45, 0.16)",
              }}
            >
              Aceon
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          {/* Inline links — signed-in only, tablet and up. Folded into the avatar menu on mobile. */}
          <SignedIn>
          <nav className="hidden items-center gap-4 sm:flex lg:gap-6">
            {navLinks.map(({ label, href, external }) => {
              const isActive = !external && pathname === href;
              const className = cn(
                "relative font-display text-xs uppercase tracking-wider transition-colors sm:text-sm",
                isActive ? "text-[#E62E2D]" : "text-white/70 hover:text-[#E62E2D]",
              );
              const marker = isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#E62E2D]"
                />
              ) : null;

              return external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={className}
                >
                  {label}
                  {marker}
                </Link>
              );
            })}
          </nav>
          </SignedIn>

          <div className="flex items-center gap-2">
             <SignedOut>
              <SignInButton mode="modal">
                <Button variant="default" size="sm" className="h-10 px-5 sm:px-6 font-display font-bold tracking-wider uppercase bg-[#E62E2D] text-black hover:bg-white hover:text-black border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[4px_4px_0px_0px_#E62E2D] transition-all rounded-none">
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
              >
                {/* Reachable on mobile via the avatar dropdown. */}
                <UserButton.MenuItems>
                  {navLinks.map(({ label, href, icon: Icon, external }) =>
                    external ? (
                      <UserButton.Action
                        key={label}
                        label={label}
                        labelIcon={<Icon className="h-4 w-4" />}
                        onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
                      />
                    ) : (
                      <UserButton.Link
                        key={label}
                        label={label}
                        href={href}
                        labelIcon={<Icon className="h-4 w-4" />}
                      />
                    )
                  )}
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
