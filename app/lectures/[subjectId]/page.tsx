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
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUser } from "@clerk/nextjs";
import { BookmarkPanel } from "@/components/lectures/bookmark-panel";
import { NotesPanel } from "@/components/lectures/notes-panel";
import { TimelineMarkers } from "@/components/lectures/timeline-markers";

interface SidebarProps {
  courseTitle: string;
  courseCode: string;
  courseTerm: string;
  content: Array<{
    _id: string;
    title: string;
    videos: Array<{
      _id: string;
      title: string;
      duration: number;
    }>;
  }>;
  currentVideoId: string | null;
  onVideoSelect: (id: string) => void;
  progressData?: Doc<"videoProgress">[];
  onMarkWeekComplete?: (weekId: string) => void;
  onMarkCourseComplete?: () => void;
}

function LectureSidebar({ courseTitle, courseCode, courseTerm, content, currentVideoId, onVideoSelect, progressData, onMarkWeekComplete, onMarkCourseComplete }: SidebarProps) {
  const activeWeekId = content.find(w => w.videos.some(v => v._id === currentVideoId))?._id;
  
  const getProgress = (videoId: string) => {
    return progressData?.find(p => p.videoId === videoId);
  };
  
  const isWeekComplete = (week: { videos: Array<{ _id: string }> }) => {
    if (week.videos.length === 0) return true;
    return week.videos.every(v => progressData?.find(p => p.videoId === v._id)?.completed);
  };

  const totalVideos = content.reduce((sum, week) => sum + week.videos.length, 0);
  const completedVideos = progressData?.filter(p => p.completed).length || 0;
  const overallProgress = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const isCourseComplete = totalVideos > 0 && completedVideos === totalVideos;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-muted/20"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-primary transition-all duration-700"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - overallProgress / 100)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground">{overallProgress}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-lg truncate">{courseTitle}</h2>
            <p className="text-sm text-muted-foreground">{courseCode} • {courseTerm}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedVideos} of {totalVideos} completed
            </p>
            {onMarkCourseComplete && !isCourseComplete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onMarkCourseComplete}
                className="h-6 px-2 text-xs mt-1 text-muted-foreground hover:text-foreground"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Mark All Done
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Accordion type="single" collapsible defaultValue={activeWeekId} className="space-y-2">
            {content.map((week) => {
              const weekComplete = isWeekComplete(week);
              return (
              <AccordionItem key={week._id} value={week._id} className="border-none">
                <div className="flex items-center gap-1">
                  <AccordionTrigger className="flex-1 px-2 py-2 hover:no-underline hover:bg-muted/50 rounded-md text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {weekComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                      <span className="text-left">{week.title}</span>
                    </div>
                  </AccordionTrigger>
                  {onMarkWeekComplete && !weekComplete && week.videos.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkWeekComplete(week._id);
                      }}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                      title="Mark week as done"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <AccordionContent className="pt-1 pb-2">
                  <div className="space-y-1 ml-1 pl-2 border-l">
                    {week.videos.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-2 py-1">No videos</p>
                    ) : (
                      week.videos.map((video) => {
                        const progress = getProgress(video._id);
                        const isCompleted = progress?.completed;
                        const isInProgress = progress && !progress.completed && (progress.progress > 0 || progress.watchedSeconds > 0);
                        
                        return (
                          <Button
                            key={video._id}
                            variant={currentVideoId === video._id ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start text-left h-auto py-2 px-3",
                              currentVideoId === video._id && "bg-secondary"
                            )}
                            onClick={() => onVideoSelect(video._id)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 mt-1 shrink-0 text-green-500" />
                              ) : isInProgress ? (
                                <Circle className="h-4 w-4 mt-1 shrink-0 text-yellow-500 fill-yellow-500/20" />
                              ) : (
                                <PlayCircle className={cn(
                                  "h-4 w-4 mt-1 shrink-0",
                                  currentVideoId === video._id ? "text-primary" : "text-muted-foreground"
                                )} />
                              )}
                              <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                </p>
                              </div>
                            </div>
                          </Button>
                        );
                      })
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

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
      <main className="flex-1 flex flex-col min-w-0 bg-muted/10 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b bg-background">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
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
          <span className="font-semibold truncate">{currentVideo?.title || course.title}</span>
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
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
                    <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                      <div className="text-center space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white">Next Lecture</h3>
                          <p className="text-white/60 text-sm">Playing in {autoplayCountdown} seconds</p>
                        </div>

                        <div className="relative w-24 h-24 mx-auto">
                          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                            <circle
                              cx="48"
                              cy="48"
                              r="42"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="text-white/20"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="42"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              className="text-primary transition-all duration-1000"
                              strokeDasharray={`${2 * Math.PI * 42}`}
                              strokeDashoffset={`${2 * Math.PI * 42 * (1 - autoplayCountdown / 10)}`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">{autoplayCountdown}</span>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-white/80 text-sm font-medium line-clamp-2">
                            {findVideo(findNextVideo())?.title}
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={cancelAutoplay}
                            variant="outline"
                            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={playNextNow}
                            className="flex-1 bg-primary hover:bg-primary/90"
                          >
                            Play Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
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

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold truncate">{currentVideo.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentVideo.weekTitle} • {Math.floor(currentVideo.duration / 60)} min
                  </p>
                </div>
                
                {user && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAddBookmark()}
                      className="gap-1.5 text-xs"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      Bookmark
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowQuickNote(!showQuickNote)}
                      className="gap-1.5 text-xs"
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                      Note
                    </Button>
                    <Button
                      size="sm"
                      variant={isCurrentVideoCompleted ? "secondary" : "outline"}
                      onClick={handleMarkComplete}
                      disabled={isCurrentVideoCompleted}
                      className="gap-1.5 text-xs"
                    >
                      <CheckCircle2 className={cn("h-3.5 w-3.5", isCurrentVideoCompleted && "text-green-500")} />
                      {isCurrentVideoCompleted ? "Completed" : "Mark Done"}
                    </Button>
                  </div>
                )}
              </div>

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

