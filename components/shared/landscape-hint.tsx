"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface LandscapeHintProps {
  /**
   * Whether the video player is ready/active.
   * The hint will only trigger if this is true.
   */
  isReady?: boolean;
}

export default function LandscapeHint({ isReady = false }: LandscapeHintProps) {
  const isPortrait = useMediaQuery("(max-width: 768px) and (orientation: portrait)");
  // Visibility of the hint, lazily initialized to false.
  const [isVisible, setIsVisible] = useState(false);
  // Whether the hint has already been shown this session, initialized from sessionStorage.
  const [hasShown, setHasShown] = useState(() => {
    try {
      return !!sessionStorage.getItem("aceon-landscape-hint-shown");
    } catch {
      // In environments where sessionStorage is unavailable (e.g., incognito), default to false.
      return false;
    }
  });

  // Effect to trigger the hint when conditions are met.
  useEffect(() => {
    if (isReady && isPortrait && !hasShown && !isVisible) {
      // Defer state updates to avoid synchronous setState in effect.
      const timerId = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
        try {
          sessionStorage.setItem("aceon-landscape-hint-shown", "true");
        } catch {}
        // Auto‑hide after 3 seconds.
        const hideTimer = setTimeout(() => setIsVisible(false), 3000);
        // Cleanup hide timer on unmount or condition change.
        return () => clearTimeout(hideTimer);
      }, 0);
      // Cleanup the initial timeout if the effect re‑runs before it fires.
      return () => clearTimeout(timerId);
    }
  }, [isReady, isPortrait, hasShown, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => setIsVisible(false)}
          className={cn(
            "absolute bottom-16 left-1/2 -translate-x-1/2 z-40",
            "flex items-center gap-2 px-4 py-2.5 rounded-full",
            "bg-background/60 backdrop-blur-md border border-white/10 shadow-xl",
            "cursor-pointer select-none"
          )}
        >
          <div className="p-1 rounded-full bg-indigo-500/20">
            <RotateCw className="w-4 h-4 text-indigo-400 animate-[spin_3s_linear_infinite]" />
          </div>
          <span className="text-xs font-medium text-foreground/90 whitespace-nowrap tracking-wide">
            Rotate for better view
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
