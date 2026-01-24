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
import { motion } from "framer-motion"

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
    <TooltipProvider delayDuration={0}>
      <div className={cn("relative w-full h-8 group flex items-center", className)}>
        {/* Track */}
        <div className="absolute inset-x-0 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm group-hover:h-1.5 transition-all duration-300">
          <div 
            className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Bookmarks */}
        {bookmarks?.map((bookmark) => {
          const position = (bookmark.timestamp / duration) * 100
          return (
            <Tooltip key={bookmark._id}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.5, rotate: 5 }}
                  onClick={() => onSeek(bookmark.timestamp)}
                  className="absolute z-20 -translate-x-1/2 p-1 focus:outline-none"
                  style={{ left: `${position}%` }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-500 rounded-full blur-sm opacity-50 animate-pulse" />
                    <div className="relative bg-amber-500 rounded-full p-1 shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-amber-300/50">
                      <Bookmark className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-black/80 backdrop-blur-xl border-amber-500/20 text-white p-3 rounded-xl shadow-2xl"
                sideOffset={10}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Bookmark className="w-3 h-3" />
                    Bookmark • {formatTimestamp(bookmark.timestamp)}
                  </div>
                  {bookmark.label && (
                    <p className="text-xs text-white/90 font-medium leading-relaxed max-w-[200px]">{bookmark.label}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {/* Notes */}
        {notes?.map((note) => {
          const position = (note.timestamp / duration) * 100
          return (
            <Tooltip key={note._id}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.5, rotate: -5 }}
                  onClick={() => onSeek(note.timestamp)}
                  className="absolute z-20 -translate-x-1/2 p-1 focus:outline-none"
                  style={{ left: `${position}%` }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-sm opacity-50 animate-pulse" />
                    <div className="relative bg-indigo-500 rounded-full p-1 shadow-[0_0_10px_rgba(99,102,241,0.5)] border border-indigo-300/50">
                      <StickyNote className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-black/80 backdrop-blur-xl border-indigo-500/20 text-white p-3 rounded-xl shadow-2xl"
                sideOffset={10}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    <StickyNote className="w-3 h-3" />
                    Note • {formatTimestamp(note.timestamp)}
                  </div>
                  <p className="text-xs text-white/90 font-medium leading-relaxed max-w-[200px] line-clamp-3">{note.content}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {/* Current Time Indicator */}
        <div 
          className="absolute -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-primary z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50" />
        </div>
      </div>
    </TooltipProvider>
  )
}
