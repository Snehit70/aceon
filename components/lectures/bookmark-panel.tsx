"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, Plus, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkPanelProps {
  videoId: Id<"videos">;
  clerkId: string;
  currentTime: number;
  onSeek: (timestamp: number) => void;
  onCountChange?: (count: number) => void;
  className?: string;
  compact?: boolean;
}

const formatTimestamp = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export function BookmarkPanel({
  videoId,
  clerkId,
  currentTime,
  onSeek,
  onCountChange,
  className,
  compact = false,
}: BookmarkPanelProps) {
  const bookmarks = useQuery(api.bookmarks.getBookmarksForVideo, {
    videoId,
    clerkId,
  });
  
  useEffect(() => {
    if (bookmarks && onCountChange) {
      onCountChange(bookmarks.length);
    }
  }, [bookmarks, onCountChange]);

  const addBookmark = useMutation(api.bookmarks.addBookmark);
  const removeBookmark = useMutation(api.bookmarks.removeBookmark);

  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus();
    }
  }, [isAdding]);

  const handleAdd = async () => {
    try {
      await addBookmark({
        videoId,
        clerkId,
        timestamp: currentTime,
        label: label.trim() || undefined,
      });
      setIsAdding(false);
      setLabel("");
    } catch (error) {
      console.error("Failed to add bookmark", error);
    }
  };

  const handleRemove = async (bookmarkId: Id<"bookmarks">) => {
    try {
      await removeBookmark({ bookmarkId });
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setLabel("");
    }
  };

  return (
    <div className={cn(
      "flex flex-col overflow-hidden transition-all duration-300",
      !compact && "h-full bg-white/5 backdrop-blur-xl border border-white/10",
      className
    )}>
      {!compact && (
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-indigo-100">
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <h3 className="font-serif font-medium tracking-tight">Bookmarks</h3>
          </div>
          {!isAdding && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAdding(true)}
              className="h-8 w-8 p-0 text-white/70 hover:text-indigo-300 hover:bg-white/5"
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">Add bookmark</span>
            </Button>
          )}
        </div>
      )}

      {isAdding && (
        <div className={cn(
          "p-3 bg-primary/5 border-b border-primary/20 animate-in slide-in-from-top-2 duration-200",
          compact && "p-2"
        )}>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(currentTime)}
              </span>
              <span>New Bookmark</span>
            </div>
            <Input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Note (optional)..."
              className="h-8 text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAdding(false)}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                className="h-7 text-xs"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className={cn("flex-1", compact && "max-h-[250px]")}>
        <div className="p-2 space-y-1">
          {bookmarks === undefined ? (
            <div className={cn("text-center space-y-2", compact ? "p-4" : "p-8")}>
              <div className="w-full h-8 bg-muted/20 animate-pulse rounded" />
              <div className="w-2/3 h-8 bg-muted/20 animate-pulse mx-auto rounded" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className={cn(
              "flex flex-col items-center justify-center text-center text-muted-foreground relative overflow-hidden",
              compact ? "py-6 px-3" : "py-12 px-4"
            )}>
              <div className="absolute inset-0 bg-[url('/images/character-pochita.jpg')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-luminosity" />
              <div className="absolute inset-0 bg-black/60 pointer-events-none" />
              
              <div className="relative z-10">
                <Bookmark className={cn("mb-2 opacity-30 mx-auto", compact ? "w-6 h-6" : "w-8 h-8")} />
                <p className="text-sm font-medium">No bookmarks yet</p>
                {!compact && (
                  <p className="text-xs mt-1 max-w-[150px] mx-auto">
                    Save important moments to return to them later.
                  </p>
                )}
                <Button 
                  variant="link" 
                  onClick={() => setIsAdding(true)}
                  className="mt-2 text-primary h-auto p-0 text-xs"
                >
                  Add one now
                </Button>
              </div>
            </div>
          ) : (
            bookmarks.map((bookmark: Doc<"bookmarks">) => (
              <div
                key={bookmark._id}
                className="group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSeek(bookmark.timestamp)}
              >
                <div className="shrink-0 flex items-center justify-center px-2 py-0.5 bg-primary/10 rounded text-xs font-mono text-primary">
                  {formatTimestamp(bookmark.timestamp)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm truncate",
                    bookmark.label ? "text-foreground" : "text-muted-foreground italic"
                  )}>
                    {bookmark.label || "No description"}
                  </p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(bookmark._id);
                  }}
                  className="shrink-0 h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}