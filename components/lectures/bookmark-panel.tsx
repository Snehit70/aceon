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
  className?: string;
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
  className,
}: BookmarkPanelProps) {
  const bookmarks = useQuery(api.bookmarks.getBookmarksForVideo, {
    videoId,
    clerkId,
  });

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
      "flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden transition-all duration-300",
      className
    )}>
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
            className="h-8 w-8 p-0 text-white/70 hover:text-indigo-300 hover:bg-white/5 rounded-full"
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Add bookmark</span>
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 bg-indigo-500/10 border-b border-indigo-500/20 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-1">
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
              className="bg-black/20 border-white/10 text-sm text-white placeholder:text-white/30 focus:border-indigo-400/50 focus:ring-indigo-400/20 h-8"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAdding(false)}
                className="h-7 text-xs text-white/50 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-900/20"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {bookmarks === undefined ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-full h-8 bg-white/5 rounded animate-pulse" />
              <div className="w-2/3 h-8 bg-white/5 rounded animate-pulse mx-auto" />
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-white/30">
              <Bookmark className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm font-medium">No bookmarks yet</p>
              <p className="text-xs mt-1 max-w-[150px]">
                Save important moments to return to them later.
              </p>
              <Button 
                variant="link" 
                onClick={() => setIsAdding(true)}
                className="mt-2 text-indigo-400 hover:text-indigo-300 h-auto p-0 text-xs"
              >
                Add one now
              </Button>
            </div>
          ) : (
            bookmarks.map((bookmark: Doc<"bookmarks">) => (
              <div
                key={bookmark._id}
                className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200 cursor-pointer border border-transparent hover:border-white/5"
                onClick={() => onSeek(bookmark.timestamp)}
              >
                <div className="shrink-0 flex items-center justify-center w-12 py-1 bg-black/20 rounded text-xs font-mono text-indigo-300 group-hover:text-indigo-200 border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                  {formatTimestamp(bookmark.timestamp)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm truncate transition-colors",
                    bookmark.label ? "text-white/90" : "text-white/40 italic"
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
                  className="shrink-0 h-7 w-7 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-full"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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