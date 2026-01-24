"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Bookmark, StickyNote } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TimelineMarkersProps {
  videoId: Id<"videos">
  clerkId: string
  duration: number
  currentTime: number
  onSeek: (timestamp: number) => void
  className?: string
}

const formatTimestamp = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function TimelineMarkers({
  videoId,
  clerkId,
  duration,
  currentTime,
  onSeek,
  className,
}: TimelineMarkersProps) {
  const bookmarks = useQuery(api.bookmarks.getBookmarksForVideo, {
    videoId,
    clerkId,
  })

  const notes = useQuery(api.videoNotes.getNotesForVideo, {
    videoId,
    clerkId,
  })

  if (!duration || duration === 0) return null

  const hasMarkers = (bookmarks && bookmarks.length > 0) || (notes && notes.length > 0)
  
  if (!hasMarkers) return null

  const progressPercent = (currentTime / duration) * 100

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("relative w-full h-6 group", className)}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary/30 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {bookmarks?.map((bookmark) => {
          const position = (bookmark.timestamp / duration) * 100
          return (
            <Tooltip key={bookmark._id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSeek(bookmark.timestamp)}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-1 rounded-full bg-amber-500/90 hover:bg-amber-400 hover:scale-125 transition-all shadow-sm"
                  style={{ left: `${position}%` }}
                >
                  <Bookmark className="w-2.5 h-2.5 text-white fill-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                    <Bookmark className="w-3 h-3" />
                    {formatTimestamp(bookmark.timestamp)}
                  </div>
                  {bookmark.label && (
                    <p className="text-xs line-clamp-2">{bookmark.label}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {notes?.map((note) => {
          const position = (note.timestamp / duration) * 100
          return (
            <Tooltip key={note._id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSeek(note.timestamp)}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-1 rounded-full bg-primary/90 hover:bg-primary hover:scale-125 transition-all shadow-sm"
                  style={{ left: `${position}%` }}
                >
                  <StickyNote className="w-2.5 h-2.5 text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-primary">
                    <StickyNote className="w-3 h-3" />
                    {formatTimestamp(note.timestamp)}
                  </div>
                  <p className="text-xs line-clamp-2">{note.content}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-primary z-20 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progressPercent}%` }}
        />
      </div>
    </TooltipProvider>
  )
}
