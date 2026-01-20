"use client"

import { useState } from "react"
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
  className?: string
}

export function NotesPanel({
  videoId,
  clerkId,
  currentTime,
  onSeek,
  className
}: NotesPanelProps) {
  const [newNoteContent, setNewNoteContent] = useState("")
  const [editingId, setEditingId] = useState<Id<"videoNotes"> | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const notes = useQuery(api.videoNotes.getNotesForVideo, { clerkId, videoId })
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
      "flex flex-col h-full bg-white/5 backdrop-blur-xl border-l border-white/10 w-full md:w-80 lg:w-96",
      className
    )}>
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <StickyNote className="w-5 h-5 text-indigo-400" />
        <h2 className="font-semibold text-white">My Notes</h2>
        <span className="ml-auto text-xs text-white/50 font-mono">
          {notes ? notes.length : 0} notes
        </span>
      </div>

      <div className="p-4 border-b border-white/10 space-y-3 bg-black/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
            @ {formatTime(currentTime)}
          </span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 text-xs text-white/70 hover:text-white"
            onClick={() => setNewNoteContent("")}
          >
            Clear
          </Button>
        </div>
        <Textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Type a note at current time..."
          className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none focus:ring-indigo-500/50"
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {!notes ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-2 text-white/30 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-white/10" />
            <p className="text-sm">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3 text-white/30 text-center">
            <StickyNote className="w-10 h-10 opacity-20" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-xs">Add a note to remember key points</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note: Doc<"videoNotes">) => (
              <div 
                key={note._id} 
                className="group relative flex flex-col gap-2 rounded-lg border border-white/5 bg-white/5 p-3 transition-colors hover:bg-white/10 hover:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSeek(note.timestamp)}
                    className="flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-mono font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20"
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
                          className="h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                          onClick={() => handleSaveEdit(note._id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
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
                          className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
                          onClick={() => handleStartEdit(note)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-400/10"
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
                    className="min-h-[60px] bg-black/20 border-white/10 text-sm text-white focus:ring-indigo-500/50"
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
