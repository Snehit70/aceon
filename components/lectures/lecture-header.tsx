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
        <h1 className="text-xl font-bold truncate">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {weekTitle} • {Math.floor(duration / 60)} min
        </p>
      </div>
      
      {showUserActions && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onBookmark}
            className="gap-1.5 text-xs min-h-[44px]"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Bookmark
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleNote}
            className="gap-1.5 text-xs min-h-[44px]"
          >
            <StickyNote className="h-3.5 w-3.5" />
            Note
          </Button>
          <Button
            size="sm"
            variant={isCompleted ? "secondary" : "outline"}
            onClick={onMarkComplete}
            disabled={isCompleted}
            className="gap-1.5 text-xs min-h-[44px]"
          >
            <CheckCircle2 className={cn("h-3.5 w-3.5", isCompleted && "text-green-500")} />
            {isCompleted ? "Completed" : "Mark Done"}
          </Button>
        </div>
      )}
    </div>
  );
}
