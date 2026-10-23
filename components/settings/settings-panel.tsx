"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { Captions, FastForward, MonitorPlay, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import {
  AUTOPLAY_COUNTDOWN_OPTIONS,
  CONTROLS_HIDE_OPTIONS,
  DEFAULT_SETTINGS,
  HOLD_BOOST_OPTIONS,
  PLAYBACK_RATES,
  SEEK_STEP_OPTIONS,
} from "@/lib/settings";
import { cn } from "@/lib/utils";

interface SettingRowProps {
  label: string;
  description: string;
  children: ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/10 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 sm:max-w-[26rem]">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white">{label}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/55">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface SegmentedProps<T extends number> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  format: (value: T) => string;
  disabled?: boolean;
}

/** Single-choice picker for a short list of numeric options. */
function Segmented<T extends number>({ label, value, options, onChange, format, disabled = false }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled}
      className={cn("inline-flex flex-wrap border border-white/15", disabled && "opacity-40")}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              "min-h-[44px] min-w-[52px] border-r border-white/10 px-3 font-mono text-xs font-bold uppercase tracking-wider transition-colors last:border-r-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
              selected
                ? "bg-primary text-white"
                : "bg-black/40 text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            {format(option)}
          </button>
        );
      })}
    </div>
  );
}

function SettingSwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[44px] items-center">
      <Switch aria-label={label} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof FastForward; title: string; children: ReactNode }) {
  return (
    <section className="border border-white/10 bg-card/50 backdrop-blur-sm">
      <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="font-display text-base font-bold uppercase tracking-wider text-white">{title}</h2>
      </header>
      <div className="px-4 sm:px-5">{children}</div>
    </section>
  );
}

const formatRate = (rate: number) => `${rate}x`;
const formatSeconds = (seconds: number) => `${seconds}s`;
const formatHide = (seconds: number) => (seconds === 0 ? "Never" : `${seconds}s`);

/**
 * SettingsPanel - All user preferences for the lecture experience.
 *
 * Every change saves immediately to this browser and applies to open lecture tabs.
 * Defaults mirror Aceon's original behaviour, so nothing changes until a setting is touched.
 */
export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const isDefault = (Object.keys(DEFAULT_SETTINGS) as Array<keyof typeof DEFAULT_SETTINGS>).every(
    (key) => settings[key] === DEFAULT_SETTINGS[key],
  );

  return (
    <div className="space-y-5">
      <Section icon={FastForward} title="Playback">
        <SettingRow
          label="Default speed"
          description="Speed a lecture starts at. Changing speed in the player only lasts until you reload."
        >
          <Segmented
            label="Default speed"
            value={settings.defaultPlaybackRate}
            options={PLAYBACK_RATES}
            onChange={(defaultPlaybackRate) => updateSettings({ defaultPlaybackRate })}
            format={formatRate}
          />
        </SettingRow>
        <SettingRow
          label="Hold-Space boost"
          description="Speed while you hold Space. Letting go restores your previous speed."
        >
          <Segmented
            label="Hold-Space boost speed"
            value={settings.holdBoostRate}
            options={HOLD_BOOST_OPTIONS}
            onChange={(holdBoostRate) => updateSettings({ holdBoostRate })}
            format={formatRate}
          />
        </SettingRow>
        <SettingRow
          label="Skip length"
          description="How far the left and right arrow keys jump."
        >
          <Segmented
            label="Skip length"
            value={settings.seekStepSeconds}
            options={SEEK_STEP_OPTIONS}
            onChange={(seekStepSeconds) => updateSettings({ seekStepSeconds })}
            format={formatSeconds}
          />
        </SettingRow>
        <SettingRow
          label="Resume where I left off"
          description="Start each lecture from your last position. Turn off to always start from the beginning."
        >
          <SettingSwitch
            label="Resume where I left off"
            checked={settings.resumePlayback}
            onCheckedChange={(resumePlayback) => updateSettings({ resumePlayback })}
          />
        </SettingRow>
      </Section>

      <Section icon={SkipForward} title="Up next">
        <SettingRow
          label="Autoplay next lecture"
          description="When a lecture ends, count down and move on to the next one."
        >
          <SettingSwitch
            label="Autoplay next lecture"
            checked={settings.autoplayNext}
            onCheckedChange={(autoplayNext) => updateSettings({ autoplayNext })}
          />
        </SettingRow>
        <SettingRow
          label="Countdown"
          description="How long you get to cancel before the next lecture starts."
        >
          <Segmented
            label="Autoplay countdown"
            value={settings.autoplayCountdownSeconds}
            options={AUTOPLAY_COUNTDOWN_OPTIONS}
            onChange={(autoplayCountdownSeconds) => updateSettings({ autoplayCountdownSeconds })}
            format={formatSeconds}
            disabled={!settings.autoplayNext}
          />
        </SettingRow>
      </Section>

      <Section icon={Captions} title="Captions">
        <SettingRow
          label="Captions on by default"
          description="Show captions automatically on lectures that have them. You can still toggle with C."
        >
          <SettingSwitch
            label="Captions on by default"
            checked={settings.captionsDefault}
            onCheckedChange={(captionsDefault) => updateSettings({ captionsDefault })}
          />
        </SettingRow>
      </Section>

      <Section icon={MonitorPlay} title="Player & sidebar">
        <SettingRow
          label="Hide controls after"
          description="Idle time before the player controls fade out during playback."
        >
          <Segmented
            label="Hide controls after"
            value={settings.controlsHideSeconds}
            options={CONTROLS_HIDE_OPTIONS}
            onChange={(controlsHideSeconds) => updateSettings({ controlsHideSeconds })}
            format={formatHide}
          />
        </SettingRow>
        <SettingRow
          label="Confirm bulk actions"
          description="Ask before marking a whole week or course complete or incomplete."
        >
          <SettingSwitch
            label="Confirm bulk actions"
            checked={settings.confirmBulkActions}
            onCheckedChange={(confirmBulkActions) => updateSettings({ confirmBulkActions })}
          />
        </SettingRow>
      </Section>

      <div className="flex flex-col gap-3 border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs leading-relaxed text-white/55">
          Settings are saved in this browser only. They won&apos;t follow you to another device.
        </p>
        <Button
          type="button"
          variant="ghost"
          disabled={isDefault}
          onClick={() => {
            resetSettings();
            toast.success("Settings reset to defaults");
          }}
          className="min-h-[44px] shrink-0 gap-2 border border-white/15 bg-white/5 font-mono text-xs font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
