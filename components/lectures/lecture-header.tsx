"use client";

import { Bookmark, StickyNote, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LectureHeaderProps {
  title: string;
  weekTitle: string;
  duration: number; // in seconds
  showUserActions?: boolean;
  isCompleted?: boolean;
  onBookmark?: () => void;
  onToggleNote?: () => void;
  onMarkComplete?: () => void;
}

export function LectureHeader({
  title,
  weekTitle,
  duration,
  showUserActions = false,
  isCompleted = false,
  onBookmark,
  onToggleNote,
  onMarkComplete
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
            variant={isCompleted ? "secondary" : "default"}
            onClick={onMarkComplete}
            disabled={isCompleted}
            className={cn(
              "gap-2 text-sm font-bold uppercase tracking-wider min-h-[48px] px-6 transition-all",
              isCompleted 
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-2 border-green-500/40" 
                : "!bg-[#ff1744] text-white hover:!bg-[#f01440] shadow-xl shadow-red-500/60 border-2 border-red-400"
            )}
          >
            <CheckCircle2 className={cn("h-4 w-4", isCompleted && "text-green-500")} />
            {isCompleted ? "Mission Complete" : "Mark Complete"}
          </Button>
        </div>
      )}
    </div>
  );
}
