"use client";

import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LectureHeaderProps {
  title: string;
  weekTitle: string;
  duration: number;
  showUserActions?: boolean;
  isCompleted?: boolean;
  onMarkComplete?: () => void;
}

/**
 * LectureHeader - Top bar of the video player view.
 * 
 * **Context**: Displays current video metadata (title, week, duration) and primary user actions.
 * 
 * **Integrations**: 
 * - Takes `onMarkComplete` callback to toggle video completion status via Convex.
 * 
 * **Style**: Implements the "Chainsaw Man" aesthetic with aggressive uppercase fonts, 
 * neon accents, and brutalist spacing.
 * 
 * @param props - Component props.
 * @param props.title - Title of the current video.
 * @param props.weekTitle - Title of the week (e.g., "Week 1").
 * @param props.duration - Duration in seconds (formatted to minutes).
 * @param props.showUserActions - Whether to show the Mark Complete button.
 * @param props.isCompleted - Current completion status.
 * @param props.onMarkComplete - Callback to toggle completion.
 * @returns A styled header with title and action buttons.
 */
export function LectureHeader({
  title,
  weekTitle,
  duration,
  showUserActions = false,
  isCompleted = false,
  onMarkComplete,
}: LectureHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl min-[390px]:text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase tracking-wide text-white drop-shadow-md line-clamp-3 sm:line-clamp-2">{title}</h1>
        <p className="text-[11px] sm:text-sm font-mono text-white/80 uppercase tracking-wider sm:tracking-widest mt-1">
          {weekTitle} <span className="text-primary mx-2">{"//"}</span> {Math.floor(duration / 60)} min
        </p>
      </div>
      
      {showUserActions && (
        <div className="flex items-center gap-2 shrink-0">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <Button
              size="lg"
              onClick={onMarkComplete}
              className={cn(
                "gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider min-h-[44px] sm:min-h-[48px] w-full px-4 sm:w-auto sm:px-6 sm:min-w-[160px] transition-all",
                isCompleted 
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-2 border-green-500/40" 
                  : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/50"
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  layout
                  key={isCompleted ? "completed" : "incomplete"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={isCompleted 
                    ? { type: "spring", stiffness: 400, damping: 30 }
                    : { duration: 0.15 }
                  }
                >
                  <CheckCircle2 className={cn("h-4 w-4", isCompleted && "text-green-500")} />
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  layout
                  key={isCompleted ? "completed" : "incomplete"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  {isCompleted ? "Marked Done" : "Mark as Done"}
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
