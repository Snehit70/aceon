import type { ReactNode } from "react";
import { MobileBottomTabs } from "@/components/mobile/mobile-bottom-tabs";

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:hidden min-h-[calc(100dvh-3.5rem)] bg-black text-white">
      <main className="pb-16">{children}</main>
      <MobileBottomTabs />
    </div>
  );
}
