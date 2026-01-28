"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id, Doc } from "@/convex/_generated/dataModel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StickyNote, Plus, Pencil, Trash2, Clock, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotesPanelProps {
  videoId: Id<"videos">
  clerkId: string
  currentTime: number
  onSeek: (timestamp: number) => void
  onCountChange?: (count: number) => void
  className?: string
  compact?: boolean
}

export function NotesPanel({
  videoId,
  clerkId,
  currentTime,
  onSeek,
  onCountChange,
  className,
  compact = false
}: NotesPanelProps) {
  const [newNoteContent, setNewNoteContent] = useState("")
  const [editingId, setEditingId] = useState<Id<"videoNotes"> | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const notes = useQuery(api.videoNotes.getNotesForVideo, { clerkId, videoId })
  
  useEffect(() => {
    if (notes && onCountChange) {
      onCountChange(notes.length)
    }
  }, [notes, onCountChange])
  const addNote = useMutation(api.videoNotes.addNote)
  const updateNote = useMutation(api.videoNotes.updateNote)
  const deleteNote = useMutation(api.videoNotes.deleteNote)

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, "0")
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`
    }
    return `${mm}:${ss}`
  }

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return
    setIsSubmitting(true)
    try {
      await addNote({
        clerkId,
        videoId,
        timestamp: Math.floor(currentTime),
        content: newNoteContent
      })
      setNewNoteContent("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartEdit = (note: Doc<"videoNotes">) => {
    setEditingId(note._id)
    setEditContent(note.content)
  }

  const handleSaveEdit = async (noteId: Id<"videoNotes">) => {
    if (!editContent.trim()) return
    try {
      await updateNote({
        noteId,
        content: editContent
      })
      setEditingId(null)
    } catch (error) {
      console.error("Failed to update note", error)
    }
  }

  const handleDelete = async (noteId: Id<"videoNotes">) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNote({ noteId })
    }
  }

  return (
    <div className={cn(
      "flex flex-col overflow-hidden transition-all duration-300",
      !compact && "h-full bg-white/5 backdrop-blur-xl border-l border-white/10 w-full md:w-80 lg:w-96",
      className
    )}>
      {!compact && (
        <>
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">My Notes</h2>
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {notes ? notes.length : 0} notes
            </span>
          </div>

          <div className="p-4 border-b border-white/10 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                @ {formatTime(currentTime)}
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 text-xs"
                onClick={() => setNewNoteContent("")}
              >
                Clear
              </Button>
            </div>
            <Textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Type a note at current time..."
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAddNote()
                }
              }}
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!newNoteContent.trim() || isSubmitting}
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </>
      )}

      <ScrollArea className={cn("flex-1", compact && "max-h-[250px]")}>
        <div className={cn("space-y-2", compact ? "p-2" : "p-4")}>
          {!notes ? (
            <div className={cn(
              "flex flex-col items-center justify-center space-y-2 text-muted-foreground animate-pulse",
              compact ? "h-20" : "h-40"
            )}>
              <div className="w-4 h-4 bg-muted/20 rounded" />
              <p className="text-sm">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className={cn(
              "flex flex-col items-center justify-center text-center text-muted-foreground relative overflow-hidden",
              compact ? "py-6" : "h-48"
            )}>
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0.05)_100%)] bg-[length:10px_10px] opacity-20" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="p-3 bg-white/5 rounded-full mb-3 border border-white/10">
                  <StickyNote className={cn("text-muted-foreground", compact ? "w-4 h-4" : "w-6 h-6")} />
                </div>
                <p className="text-sm font-medium text-foreground">No notes yet</p>
                {!compact && <p className="text-xs mt-1">Add a note to remember key points</p>}
              </div>
            </div>
          ) : (
            notes.map((note: Doc<"videoNotes">) => (
              <div 
                key={note._id} 
                className="group relative flex flex-col gap-2 rounded-md border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSeek(note.timestamp)}
                    className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded text-xs font-mono font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <Clock className="w-3 h-3" />
                    {formatTime(note.timestamp)}
                  </button>

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {editingId === note._id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-green-500 hover:text-green-400"
                          onClick={() => handleSaveEdit(note._id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleStartEdit(note)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(note._id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === note._id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] text-sm"
                    autoFocus
                  />
                ) : (
                  <p className={cn(
                    "text-sm whitespace-pre-wrap leading-relaxed",
                    compact ? "line-clamp-2" : ""
                  )}>
                    {note.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
