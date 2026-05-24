"use client";

import { useEffect, useState, type RefObject } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Clock3, Pencil, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VideoPlayerRef } from "@/components/shared/video-player";

interface VideoNotesPanelProps {
  userId?: string;
  videoId: string | null;
  playerRef: RefObject<VideoPlayerRef | null>;
  compact?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const MAX_NOTE_LENGTH = 1000;

function formatTimestamp(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hh = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (hh > 0) {
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function VideoNotesPanel({
  userId,
  videoId,
  playerRef,
  compact = false,
  collapsible = false,
  defaultOpen = true,
}: VideoNotesPanelProps) {
  const [noteInput, setNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<Id<"videoNotes"> | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [displayTimestamp, setDisplayTimestamp] = useState(0);

  const notes = useQuery(
    api.videoNotes.getNotesForVideo,
    userId && videoId ? { clerkId: userId, videoId: videoId as Id<"videos"> } : "skip"
  );

  const addNote = useMutation(api.videoNotes.addNote);
  const updateNote = useMutation(api.videoNotes.updateNote);
  const deleteNote = useMutation(api.videoNotes.deleteNote);

  const noteCount = notes?.length ?? 0;
  const canCreate = !!userId && !!videoId && noteInput.trim().length > 0 && noteInput.trim().length <= MAX_NOTE_LENGTH;

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = Math.floor(playerRef.current?.getCurrentTime() ?? 0);
      setDisplayTimestamp(current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playerRef]);

  const handleAddNote = async () => {
    const text = noteInput.trim();
    if (!canCreate || !videoId || !userId) return;

    const timestamp = Math.max(0, Math.floor(playerRef.current?.getCurrentTime() ?? 0));
    setIsSubmitting(true);
    try {
      await addNote({
        clerkId: userId,
        videoId: videoId as Id<"videos">,
        timestamp,
        content: text,
      });
      setNoteInput("");
      toast.success("Note added");
    } catch (error) {
      console.error("Failed to add note", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJump = (timestamp: number) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(timestamp);
  };

  const handleStartEdit = (noteId: Id<"videoNotes">, content: string) => {
    setEditingNoteId(noteId);
    setEditingText(content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText("");
  };

  const handleSaveEdit = async () => {
    const content = editingText.trim();
    if (!editingNoteId || content.length === 0 || content.length > MAX_NOTE_LENGTH) return;

    try {
      await updateNote({ noteId: editingNoteId, content });
      toast.success("Note updated");
      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update note", error);
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async (noteId: Id<"videoNotes">) => {
    try {
      await deleteNote({ noteId });
      toast.success("Note deleted");
      if (editingNoteId === noteId) {
        handleCancelEdit();
      }
    } catch (error) {
      console.error("Failed to delete note", error);
      toast.error("Failed to delete note");
    }
  };

  if (!userId) return null;

  return (
    <section className={cn("border border-white/10 bg-white/[0.03]", compact ? "p-3" : "p-4")}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className={cn("font-display font-black uppercase tracking-wide text-white", compact ? "text-base" : "text-lg")}>
            Notes
          </h2>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60">
            <Clock3 className="h-3 w-3" />
            Timestamp linked • {noteCount} total
          </p>
        </div>
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="min-h-[36px] border border-white/10 text-white/80 hover:text-white"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {(!collapsible || isOpen) && (
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            <Textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              maxLength={MAX_NOTE_LENGTH}
              placeholder={`Add note at ${formatTimestamp(displayTimestamp)}...`}
              className="min-h-[88px] border-white/15 bg-black/40 text-sm text-white placeholder:text-white/35"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                {noteInput.trim().length}/{MAX_NOTE_LENGTH}
              </p>
              <Button
                onClick={handleAddNote}
                disabled={!canCreate || isSubmitting}
                className={cn(
                  "min-h-[40px] gap-1.5 font-bold uppercase tracking-wider",
                  compact ? "text-[11px] px-3" : "text-xs"
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Add at {formatTimestamp(displayTimestamp)}
              </Button>
            </div>
          </div>

          {notes === undefined ? (
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="border border-dashed border-white/15 bg-black/30 p-3 font-mono text-[10px] uppercase tracking-wider text-white/50">
              No notes yet for this lecture.
            </p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => {
                const isEditing = editingNoteId === note._id;
                return (
                  <article key={note._id} className="border border-white/10 bg-black/35 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleJump(note.timestamp)}
                        className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary hover:text-primary/80"
                      >
                        {formatTimestamp(note.timestamp)}
                      </button>
                      <div className="flex items-center gap-1">
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleStartEdit(note._id, note.content)}
                            className="border border-white/10 text-white/70 hover:text-white"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(note._id)}
                          className="border border-white/10 text-white/70 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          maxLength={MAX_NOTE_LENGTH}
                          className="min-h-[72px] border-white/15 bg-black/40 text-sm text-white"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="border border-white/10">
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={editingText.trim().length === 0 || editingText.trim().length > MAX_NOTE_LENGTH}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{note.content}</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
