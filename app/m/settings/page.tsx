import { SettingsPanel } from "@/components/settings/settings-panel";

export default function MobileSettingsPage() {
  return (
    <div className="px-4 py-4 pb-6">
      <h1 className="font-display text-[1.35rem] font-bold uppercase leading-[1.1] tracking-wide text-white">
        Settings
      </h1>
      <p className="mb-4 mt-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
        Changes save as you make them
      </p>
      <SettingsPanel />
    </div>
  );
}
