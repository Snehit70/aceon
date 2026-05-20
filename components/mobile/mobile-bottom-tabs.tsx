"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen, Archive, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/m/lectures?tab=enrolled", key: "enrolled", label: "Enrolled", icon: BookOpen },
  { href: "/m/lectures?tab=archives", key: "archives", label: "Archives", icon: Archive },
  { href: "/m/profile", key: "profile", label: "Profile", icon: User },
];

export function MobileBottomTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "enrolled";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-sm md:hidden">
      <div className="grid grid-cols-3">
        {tabs.map((item) => {
          const active = item.key === "profile" ? pathname === "/m/profile" : pathname === "/m/lectures" && tab === item.key;
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-1 border-r border-white/5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                "last:border-r-0",
                active ? "text-primary bg-primary/10" : "text-white/70",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
