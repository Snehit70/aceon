"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, PlayCircle, Menu, PanelLeftClose, PanelLeftOpen, CheckCircle2, Circle, Bookmark, StickyNote, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer, { VideoPlayerRef } from "@/components/shared/video-player";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn, cleanCourseTitle } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUser } from "@clerk/nextjs";
import { BookmarkPanel } from "@/components/lectures/bookmark-panel";
import { NotesPanel } from "@/components/lectures/notes-panel";
import { TimelineMarkers } from "@/components/lectures/timeline-markers";
import { LectureSidebar } from "@/components/lectures/lecture-sidebar";
import { AutoplayOverlay } from "@/components/lectures/autoplay-overlay";
import { LectureHeader } from "@/components/lectures/lecture-header";

export default function LecturePlayerPage() {
  const { user } = useUser();
  const params = useParams();
  const subjectId = params.subjectId as Id<"courses">;

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });
  
  const progressData = useQuery(
    api.progress.getCourseProgress, 
    user ? { clerkId: user.id, courseId: subjectId } : "skip"
  );

  const updateProgress = useMutation(api.progress.updateProgress);
  
  const [videoDuration, setVideoDuration] = useState(0);

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);
  const [showAutoplayCountdown, setShowAutoplayCountdown] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState(10);
  
  const [bookmarksExpanded, setBookmarksExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteContent, setQuickNoteContent] = useState("");
  
  const playerRef = useRef<VideoPlayerRef>(null);
  const lastProgressUpdate = useRef<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const addBookmark = useMutation(api.bookmarks.addBookmark);
  const addNote = useMutation(api.videoNotes.addNote);
  const markComplete = useMutation(api.progress.markComplete);
  const markWeekComplete = useMutation(api.progress.markWeekComplete);
  const markCourseComplete = useMutation(api.progress.markCourseComplete);
  
  const formatTimestamp = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  
  const handleQuickAddBookmark = async () => {
    if (!user || !activeVideoId) return;
    try {
      await addBookmark({
        videoId: activeVideoId as Id<"videos">,
        clerkId: user.id,
        timestamp: currentTime,
      });
    } catch (error) {
      console.error("Failed to add bookmark", error);
    }
  };
  
  const handleQuickAddNote = async () => {
    if (!user || !activeVideoId || !quickNoteContent.trim()) return;
    try {
      await addNote({
        videoId: activeVideoId as Id<"videos">,
        clerkId: user.id,
        timestamp: Math.floor(currentTime),
        content: quickNoteContent.trim(),
      });
      setQuickNoteContent("");
      setShowQuickNote(false);
    } catch (error) {
      console.error("Failed to add note", error);
    }
  };
  
  const handleMarkComplete = async () => {
    if (!user || !activeVideoId) return;
    try {
      await markComplete({
        videoId: activeVideoId as Id<"videos">,
        clerkId: user.id,
        courseId: subjectId,
      });
    } catch (error) {
      console.error("Failed to mark complete", error);
    }
  };
  
  const handleMarkWeekComplete = async (weekId: string) => {
    if (!user) return;
    try {
      await markWeekComplete({
        clerkId: user.id,
        courseId: subjectId,
        weekId: weekId as Id<"weeks">,
      });
    } catch (error) {
      console.error("Failed to mark week complete", error);
    }
  };
  
  const handleMarkCourseComplete = async () => {
    if (!user) return;
    try {
      await markCourseComplete({
        clerkId: user.id,
        courseId: subjectId,
      });
    } catch (error) {
      console.error("Failed to mark course complete", error);
    }
  };

  // Determine which video to show (selected or first incomplete, or first video)
  let activeVideoId = selectedVideoId;
  if (!activeVideoId && content && content.length > 0) {
    // Find first incomplete video
    let firstIncompleteId: string | null = null;
    let firstVideoId: string | null = null;
    
    for (const week of content) {
      for (const video of week.videos) {
        if (!firstVideoId) {
          firstVideoId = video._id;
        }
        const progress = progressData?.find(p => p.videoId === video._id);
        if (!progress?.completed && !firstIncompleteId) {
          firstIncompleteId = video._id;
          break;
        }
      }
      if (firstIncompleteId) break;
    }
    
    activeVideoId = firstIncompleteId || firstVideoId;
  }
  
  const isCurrentVideoCompleted = progressData?.find(
    (p) => p.videoId === activeVideoId
  )?.completed;

  // Helper to find video in content structure
  const findVideo = (id: string | null) => {
    if (!content || !id) return null;
    for (const week of content) {
      const video = week.videos.find(v => v._id === id);
      if (video) return { ...video, weekTitle: week.title, weekOrder: week.order };
    }
    return null;
  };

  const currentVideo = findVideo(activeVideoId);

  const findNextVideo = useCallback(() => {
    if (!content || !activeVideoId) return null;
    
    let foundCurrent = false;
    for (const week of content) {
      for (let i = 0; i < week.videos.length; i++) {
        if (foundCurrent) {
          return week.videos[i]._id;
        }
        if (week.videos[i]._id === activeVideoId) {
          foundCurrent = true;
          if (i < week.videos.length - 1) {
            return week.videos[i + 1]._id;
          }
        }
      }
    }
    return null;
  }, [content, activeVideoId]);

  const handleVideoEnd = useCallback(() => {
    const nextVideoId = findNextVideo();
    if (nextVideoId) {
      setShowAutoplayCountdown(true);
      setAutoplayCountdown(10);
      
      countdownIntervalRef.current = setInterval(() => {
        setAutoplayCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            setShowAutoplayCountdown(false);
            setSelectedVideoId(nextVideoId);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [findNextVideo]);

  const cancelAutoplay = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowAutoplayCountdown(false);
    setAutoplayCountdown(10);
  }, []);

  const playNextNow = useCallback(() => {
    const nextVideoId = findNextVideo();
    if (nextVideoId) {
      cancelAutoplay();
      setSelectedVideoId(nextVideoId);
    }
  }, [findNextVideo, cancelAutoplay]);

  const handleSeek = (timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp);
      setCurrentTime(timestamp);
    }
  };

  const handleProgressUpdate = useCallback((progress: { played: number; playedSeconds: number }) => {
    const played = typeof progress.played === 'number' && !isNaN(progress.played) ? progress.played : 0;
    const playedSeconds = typeof progress.playedSeconds === 'number' && !isNaN(progress.playedSeconds) ? progress.playedSeconds : 0;

    setCurrentTime(playedSeconds);
    
    if (!user || !activeVideoId || !currentVideo) return;

    const now = Date.now();
    if (now - lastProgressUpdate.current >= 5000) { 
      lastProgressUpdate.current = now;
      
      updateProgress({
        clerkId: user.id,
        videoId: activeVideoId as Id<"videos">,
        courseId: subjectId,
        progress: played,
        watchedSeconds: Math.floor(playedSeconds),
        lastPosition: playedSeconds
      }).catch(console.error);
    }
  }, [user, activeVideoId, subjectId, updateProgress, currentVideo]);

  const handleVideoSelect = (id: string) => {
    cancelAutoplay();
    setSelectedVideoId(id);
    const savedProgress = progressData?.find((p: Doc<"videoProgress">) => p.videoId === id);
    if (savedProgress && savedProgress.lastPosition > 0) {
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(savedProgress.lastPosition);
        }
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  if (course === undefined || content === undefined) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (course === null) {
    return <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10">Course not found</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Desktop Sidebar */}
      {isSidebarOpen && (
        <aside className="hidden md:flex w-80 border-r bg-background flex-col shrink-0 relative transition-all">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-20 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsSidebarOpen(false)}
            title="Close Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          <LectureSidebar
            courseTitle={course.title}
            courseCode={course.code}
            courseTerm={course.term}
            content={content}
            currentVideoId={activeVideoId}
            onVideoSelect={handleVideoSelect}
            progressData={progressData}
            onMarkWeekComplete={user ? handleMarkWeekComplete : undefined}
            onMarkCourseComplete={user ? handleMarkCourseComplete : undefined}
          />
        </aside>
      )}

      {/* Sidebar Toggle Button (When Closed) */}
      {!isSidebarOpen && (
        <div className="hidden md:flex border-r bg-background items-start py-2 px-1">
           <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            title="Open Sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-y-auto relative">
        <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
        <div 
          className="fixed inset-0 opacity-10 pointer-events-none z-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 4px,
              #ffffff 4px,
              #ffffff 5px
            )`
          }}
        />
        <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b bg-background/80 backdrop-blur-sm relative z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[85vw] max-w-80">
              <LectureSidebar
                courseTitle={course.title}
                courseCode={course.code}
                courseTerm={course.term}
                content={content}
                currentVideoId={activeVideoId}
                onVideoSelect={handleVideoSelect}
                progressData={progressData}
                onMarkWeekComplete={user ? handleMarkWeekComplete : undefined}
                onMarkCourseComplete={user ? handleMarkCourseComplete : undefined}
              />
            </SheetContent>
          </Sheet>
          <span className="font-semibold truncate">{currentVideo?.title || cleanCourseTitle(course.title)}</span>
        </div>

        <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-4">
          {currentVideo ? (
            <div className="space-y-4">
              <div className="relative">
                <VideoPlayer 
                  ref={playerRef}
                  videoId={currentVideo.youtubeId}
                  title={currentVideo.title}
                  onProgressUpdate={handleProgressUpdate}
                  onEnded={handleVideoEnd}
                  theaterMode={theaterMode}
                  onTheaterModeChange={setTheaterMode}
                />

                {showAutoplayCountdown && findNextVideo() && (
                  <AutoplayOverlay 
                    secondsRemaining={autoplayCountdown}
                    nextVideoTitle={findVideo(findNextVideo())?.title}
                    onCancel={cancelAutoplay}
                    onPlayNow={playNextNow}
                  />
                )}
              </div>

              {user && currentVideo.duration > 0 && (
                <TimelineMarkers
                  videoId={currentVideo._id as Id<"videos">}
                  clerkId={user.id}
                  duration={currentVideo.duration}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              )}

              <LectureHeader 
                title={currentVideo.title}
                weekTitle={currentVideo.weekTitle}
                duration={currentVideo.duration}
                showUserActions={!!user}
                isCompleted={isCurrentVideoCompleted}
                onBookmark={() => handleQuickAddBookmark()}
                onToggleNote={() => setShowQuickNote(!showQuickNote)}
                onMarkComplete={handleMarkComplete}
              />

              {showQuickNote && user && (
                <div className="p-3 rounded-lg border bg-muted/30 space-y-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Note at {formatTimestamp(currentTime)}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowQuickNote(false)}>
                      Cancel
                    </Button>
                  </div>
                  <textarea
                    value={quickNoteContent}
                    onChange={(e) => setQuickNoteContent(e.target.value)}
                    placeholder="Type your note..."
                    className="w-full min-h-[60px] p-2 text-sm bg-background border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleQuickAddNote} disabled={!quickNoteContent.trim()}>
                      Save Note
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-background/50 backdrop-blur-sm overflow-hidden">
                  <button
                    onClick={() => setBookmarksExpanded(!bookmarksExpanded)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Bookmarks</span>
                      <span className="text-xs text-muted-foreground">({bookmarkCount})</span>
                    </div>
                    {bookmarksExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {bookmarksExpanded && (
                    <div className="border-t">
                      <BookmarkPanel
                        videoId={currentVideo._id as Id<"videos">}
                        clerkId={user?.id || ""}
                        currentTime={currentTime}
                        onSeek={handleSeek}
                        onCountChange={setBookmarkCount}
                        className="border-0 bg-transparent max-h-[300px]"
                        compact
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border bg-background/50 backdrop-blur-sm overflow-hidden">
                  <button
                    onClick={() => setNotesExpanded(!notesExpanded)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Notes</span>
                      <span className="text-xs text-muted-foreground">({notesCount})</span>
                    </div>
                    {notesExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {notesExpanded && (
                    <div className="border-t">
                      <NotesPanel
                        videoId={currentVideo._id as Id<"videos">}
                        clerkId={user?.id || ""}
                        currentTime={currentTime}
                        onSeek={handleSeek}
                        onCountChange={setNotesCount}
                        className="border-0 bg-transparent max-h-[300px] w-full"
                        compact
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10">
              <p>Select a lecture to start watching.</p>
              {content.length === 0 && <p className="mt-2 text-sm">No content available for this course yet.</p>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

