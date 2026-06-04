"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen, Archive, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/m/lectures?tab=enrolled", key: "enrolled", label: "Enrolled", icon: BookOpen },
  { href: "/m/lectures?tab=archives", key: "archives", label: "Archives", icon: Archive },
  { href: "/m/profile", key: "profile", label: "Profile", icon: User },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function MobileBottomTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const activeKey: TabKey | null = (() => {
    if (pathname.startsWith("/m/profile")) return "profile";
    if (pathname === "/m/lectures") return tabParam === "archives" ? "archives" : "enrolled";
    // Nested course / week / lecture views all hang off the Enrolled flow.
    if (pathname.startsWith("/m/course")) return "enrolled";
    if (pathname.startsWith("/m/")) return "enrolled";
    return null;
  })();

  return (
    <nav className="shrink-0 border-t border-white/10 bg-black/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3">
        {tabs.map((item) => {
          const active = activeKey === item.key;
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[60px] flex-col items-center justify-center gap-1 border-r border-white/5 text-[10px] font-bold uppercase tracking-wider transition-colors last:border-r-0",
                active ? "text-primary" : "text-white/55 active:text-white/80",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 h-[2px] w-10 -translate-x-1/2 bg-primary"
                />
              )}
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-white/60",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
