"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useSettings, PLAYBACK_SPEEDS, SEEK_INTERVALS, AUTOPLAY_DELAYS } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings as SettingsIcon,
  Video,
  User,
  Info,
  ExternalLink,
  RotateCcw,
  LogOut,
  Keyboard,
  ArrowLeft,
} from "lucide-react";
import { KeyboardShortcutsHelp } from "@/components/shared/keyboard-shortcuts-help";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function Toggle({ 
  checked, 
  onChange,
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors",
        checked 
          ? "bg-primary border-primary" 
          : "bg-transparent border-white/20"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}

function formatSpeed(speed: number): string {
  return speed === 1 ? "1x" : `${speed}x`;
}

function formatSeek(seconds: number): string {
  return `${seconds}s`;
}

function formatDelay(seconds: number): string {
  return `${seconds}s`;
}

/**
 * SettingsPage - User preferences and account management.
 * 
 * Features:
 * - Video Player settings (playback speed, autoplay, seek interval, volume)
 * - Account management (Clerk)
 * - App info and keyboard shortcuts
 */
export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const {
    defaultPlaybackSpeed,
    autoplayEnabled,
    autoplayDelay,
    seekInterval,
    rememberVolume,
    setDefaultPlaybackSpeed,
    setAutoplayEnabled,
    setAutoplayDelay,
    setSeekInterval,
    setRememberVolume,
    resetToDefaults,
  } = useSettings();

  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleReset = () => {
    resetToDefaults();
    toast.success("Settings reset to defaults");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, #ffffff 4px, #ffffff 5px)`
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 container max-w-3xl mx-auto px-6 py-12 space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E62E2D] text-black">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-widest">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground font-medium tracking-wide uppercase text-sm">
            Calibrate your hunting gear.
          </p>
        </div>

        {/* Video Player Settings */}
        <section className="border-2 border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Video Player
              </h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Default Playback Speed */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold uppercase tracking-wide text-sm">Default Speed</p>
                <p className="text-xs text-muted-foreground mt-1">Starting playback rate for all videos</p>
              </div>
              <Select
                value={String(defaultPlaybackSpeed)}
                onValueChange={(v) => setDefaultPlaybackSpeed(Number(v) as typeof defaultPlaybackSpeed)}
              >
                <SelectTrigger className="w-28 bg-black border-white/10 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <SelectItem 
                      key={speed} 
                      value={String(speed)}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {formatSpeed(speed)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Autoplay */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold uppercase tracking-wide text-sm">Autoplay Next</p>
                <p className="text-xs text-muted-foreground mt-1">Automatically play the next lecture</p>
              </div>
              <Toggle
                checked={autoplayEnabled}
                onChange={setAutoplayEnabled}
              />
            </div>

            {/* Autoplay Delay */}
            {autoplayEnabled && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold uppercase tracking-wide text-sm">Autoplay Delay</p>
                  <p className="text-xs text-muted-foreground mt-1">Countdown before auto-advancing</p>
                </div>
                <Select
                  value={String(autoplayDelay)}
                  onValueChange={(v) => setAutoplayDelay(Number(v) as typeof autoplayDelay)}
                >
                  <SelectTrigger className="w-28 bg-black border-white/10 text-white font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10">
                    {AUTOPLAY_DELAYS.map((delay) => (
                      <SelectItem 
                        key={delay} 
                        value={String(delay)}
                        className="text-white hover:bg-white/10 focus:bg-white/10"
                      >
                        {formatDelay(delay)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Seek Interval */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold uppercase tracking-wide text-sm">Seek Interval</p>
                <p className="text-xs text-muted-foreground mt-1">Arrow key jump distance</p>
              </div>
              <Select
                value={String(seekInterval)}
                onValueChange={(v) => setSeekInterval(Number(v) as typeof seekInterval)}
              >
                <SelectTrigger className="w-28 bg-black border-white/10 text-white font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {SEEK_INTERVALS.map((interval) => (
                    <SelectItem 
                      key={interval} 
                      value={String(interval)}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {formatSeek(interval)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remember Volume */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold uppercase tracking-wide text-sm">Remember Volume</p>
                <p className="text-xs text-muted-foreground mt-1">Restore volume between sessions</p>
              </div>
              <Toggle
                checked={rememberVolume}
                onChange={setRememberVolume}
              />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="border-2 border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                Account
              </h2>
            </div>
          </div>
          
          <div className="p-6 flex flex-wrap gap-4">
            {isLoaded && user ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white uppercase tracking-wider font-bold"
                >
                  <a
                    href="https://accounts.clerk.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Manage Account
                  </a>
                </Button>
                <SignOutButton>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 hover:bg-white/10 text-white uppercase tracking-wider font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <p className="text-muted-foreground">Not signed in</p>
            )}
          </div>
        </section>

        {/* About */}
        <section className="border-2 border-white/10 bg-black/50 backdrop-blur-sm">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">
                About
              </h2>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold uppercase tracking-wide text-sm">Version</p>
                <p className="text-xs text-muted-foreground font-mono">0.9.0</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(true)}
                className="text-muted-foreground hover:text-white uppercase tracking-wider font-bold"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Shortcuts
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm pt-2">
              <a 
                href="https://github.com/Snehit70" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider text-xs"
              >
                GitHub
              </a>
              <Link 
                href="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider text-xs"
              >
                Privacy
              </Link>
              <Link 
                href="/terms"
                className="text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider text-xs"
              >
                Terms
              </Link>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white uppercase tracking-wider font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </section>
      </div>

      <KeyboardShortcutsHelp 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </div>
  );
}