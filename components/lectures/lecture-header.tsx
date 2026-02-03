"use client";

import { CheckCircle2 } from "lucide-react";
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
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-wide text-white drop-shadow-md truncate">{title}</h1>
        <p className="text-sm font-mono text-white/80 uppercase tracking-widest mt-1">
          {weekTitle} <span className="text-primary mx-2">//</span> {Math.floor(duration / 60)} min
        </p>
      </div>
      
      {showUserActions && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="lg"
            onClick={onMarkComplete}
            className={cn(
              "gap-2 text-sm font-bold uppercase tracking-wider min-h-[48px] px-6 transition-all",
              isCompleted 
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-2 border-green-500/40" 
                : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/50"
            )}
          >
            <CheckCircle2 className={cn("h-4 w-4", isCompleted && "text-green-500")} />
            {isCompleted ? "Completed" : "Mark Complete"}
          </Button>
        </div>
      )}
    </div>
  );
}
