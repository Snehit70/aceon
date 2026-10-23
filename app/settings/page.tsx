import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SettingsPanel } from "@/components/settings/settings-panel";

export default function SettingsPage() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black text-white">
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Link
          href="/lectures"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Missions
        </Link>

        <div className="mb-8 mt-4 space-y-3">
          <h1 className="font-display text-5xl font-black uppercase tracking-normal sm:text-6xl">
            Set<span className="text-primary">tings</span>
          </h1>
          <p className="font-mono text-sm text-neutral-400">
            Tune the player and lecture flow. Changes save as you make them.
          </p>
        </div>

        <SettingsPanel />
      </div>
    </div>
  );
}
