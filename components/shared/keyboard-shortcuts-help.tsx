"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";
import { useEffect } from "react";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "Space", action: "Play / Pause" },
  { key: "←", action: "Seek backward 10s" },
  { key: "→", action: "Seek forward 10s" },
  { key: "↑", action: "Volume up" },
  { key: "↓", action: "Volume down" },
  { key: "+", action: "Next rate" },
  { key: "-", action: "Previous rate" },
  { key: "F", action: "Toggle fullscreen" },
  { key: "M", action: "Mute / Unmute" },
  { key: "?", action: "Show this help" },
  { key: "Esc", action: "Close / Exit fullscreen" },
];

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-white/50 text-xs">Video player controls</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div 
                  key={shortcut.key} 
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors"
                >
                  <span className="text-white/70 text-sm">{shortcut.action}</span>
                  <kbd className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-xs font-mono rounded">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-center text-white/40 text-xs">
                Press <kbd className="px-2 py-0.5 bg-white/10 border border-white/20 text-white/60 rounded text-[10px]">?</kbd> anytime to toggle
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
