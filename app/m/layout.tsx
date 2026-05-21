import type { ReactNode } from "react";
import { MobileBottomTabs } from "@/components/mobile/mobile-bottom-tabs";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:hidden flex h-[calc(100dvh-3.5rem)] flex-col bg-black text-white">
      <main className="flex-1 overflow-y-auto overscroll-contain">{children}</main>
      <MobileBottomTabs />
    </div>
  );
}
