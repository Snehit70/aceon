"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/Snehit70";

type LegalKey = "about" | "privacy" | "terms";

const footerLinks = [
  { key: "about", label: "About", href: "/about", external: false },
  { key: "privacy", label: "Privacy", href: "/privacy", external: false },
  { key: "terms", label: "Terms", href: "/terms", external: false },
  { key: "github", label: "GitHub", href: GITHUB_URL, external: true },
] as const;

interface LegalShellProps {
  /**
   * Highlights the matching footer link as the current page. Omit for content
   * pages (e.g. Changelog) that reuse this chrome but aren't in the footer.
   */
  active?: LegalKey;
  /** Render the legal footer. Defaults to true; set false for content pages. */
  showFooter?: boolean;
  children: ReactNode;
}

/**
 * LegalShell - Shared chrome for the About / Privacy / Terms pages.
 *
 * **Context**: These pages previously each duplicated their own header and footer
 * markup, which let them drift out of sync. This shell centralizes that chrome:
 * a back row (branding lives in the global navbar, so no logo here), a fade-up
 * content wrapper, and the consistent legal footer.
 *
 * @param props.active - Which footer link to mark as current.
 * @param props.showFooter - Whether to render the legal footer (default true).
 * @param props.children - Page body, rendered inside the centered content column.
 */
export function LegalShell({ active, showFooter = true, children }: LegalShellProps) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white">
      {/* Back row — branding lives in the global navbar, so no logo here. */}
      <div className="border-b border-white/10 py-4">
        <div className="container mx-auto">
          <Link
            href="/lectures"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto py-12 sm:py-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="border-t-4 border-black py-3 bg-[#E62E2D]">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-sm font-bold uppercase text-black">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6 tracking-widest">
              {footerLinks.map(({ key, label, href, external }) => {
                const className = cn(
                  "transition-colors",
                  key === active ? "text-white" : "hover:text-white",
                );
                return external ? (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {label}
                  </a>
                ) : (
                  <Link key={key} href={href} className={className}>
                    {label}
                  </Link>
                );
              })}
            </div>
            <p className="font-sans text-xs opacity-80">© {new Date().getFullYear()} Aceon</p>
          </div>
        </footer>
      )}
    </div>
  );
}
