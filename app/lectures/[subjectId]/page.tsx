"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useSearchParams, notFound } from "next/navigation";
import { useState, useRef, useCallback, Suspense, useEffect } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu02Icon } from "@hugeicons/core-free-icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VideoPlayer, { VideoPlayerRef } from "@/components/shared/video-player";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn, cleanCourseTitle } from "@/lib/utils";
import { toast } from "sonner";

import { useUser } from "@clerk/nextjs";

import { LectureSidebar } from "@/components/lectures/lecture-sidebar";
import { AutoplayOverlay } from "@/components/lectures/autoplay-overlay";
import { LectureHeader } from "@/components/lectures/lecture-header";
import LecturePlayerSkeleton from "@/components/lectures/lecture-player-skeleton";
import { VideoNotesPanel } from "@/components/lectures/video-notes-panel";

import { useVideoProgress } from "@/hooks/use-video-progress";
import { useAutoplay } from "@/hooks/use-autoplay";
import { useVideoNavigation } from "@/hooks/use-video-navigation";
import { useVideoShortcuts } from "@/hooks/use-video-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/shared/keyboard-shortcuts-help";
import useMediaQuery from "@/hooks/use-media-query";

/**
 * LecturePlayerPage - The core learning experience view.
 * 
 * **Context**: Renders the video player for a specific course, surrounded by navigation controls.
 * It is a dynamic route `[subjectId]` where `subjectId` is the Convex course ID.
 * 
 * **Integrations**: 
 * - Convex: 
 *   - Fetches course details (`api.courses.get`).
 *   - Fetches course content tree (`api.courses.getCourseContent`).
 *   - Fetches and updates user progress (`api.progress.*`).
 * - YouTube: Wraps `VideoPlayer` for content delivery.
 * 
 * **State Management**:
 * - `useVideoNavigation`: Tracks which video is currently active, URL sync, navigation.
 * - `useVideoProgress`: Handles progress saving (throttled, immediate, beacon).
 * - `useAutoplay`: Handles countdown and auto-advance logic.
 * - Fullscreen: Handled by VideoPlayer's custom controls using browser Fullscreen API.
 * - `isSidebarOpen`: Toggles the navigation sidebar (desktop only).
 * 
 * **User Flow**:
 * 1. User enters route -> Page fetches course content.
 * 2. Page auto-selects the first unwatched video ("Smart Resume").
 * 3. User plays video -> Progress updates sent to Convex every 5s.
 * 4. Video ends -> Autoplay overlay appears -> Auto-advances to next video after 10s.
 * 5. User can manually navigate via Sidebar or "Mark Complete" header button.
 * 
 * @returns The main player layout with Sidebar and VideoPlayer.
 */
function LecturePlayerPageContent() {
  const { user } = useUser();
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as Id<"courses">;
  const videoFromUrl = searchParams.get("v");

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });
  
  const progressData = useQuery(
    api.progress.getCourseProgress, 
    user ? { clerkId: user.id, courseId: subjectId } : "skip"
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  const playerRef = useRef<VideoPlayerRef>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoSelectRef = useRef<(id: string) => void>(() => {});
  const saveProgressRef = useRef<(() => void) | null>(null);

  // Keyboard shortcuts for play/pause and seek
  useVideoShortcuts({ playerRef, containerRef: videoContainerRef, enabled: !showShortcutsHelp });

  // Toggle shortcuts help with ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcutsHelp((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  
  const markComplete = useMutation(api.progress.markComplete);
  const markWeekComplete = useMutation(api.progress.markWeekComplete);
  const markCourseComplete = useMutation(api.progress.markCourseComplete);

  const handleAutoplay = useCallback((nextVideoId: string) => {
    videoSelectRef.current(nextVideoId);
  }, []);

  const autoplay = useAutoplay({
    onAutoplay: handleAutoplay,
  });

  const navigation = useVideoNavigation({
    content,
    progressData,
    videoFromUrl,
    courseId: subjectId,
    playerRef,
    onSaveProgressRef: saveProgressRef,
    onCancelAutoplay: autoplay.cancelAutoplay,
  });

  useEffect(() => {
    videoSelectRef.current = navigation.handleVideoSelect;
  }, [navigation.handleVideoSelect]);

  const progressWithVideo = useVideoProgress({
    userId: user?.id,
    videoId: navigation.activeVideoId,
    courseId: subjectId,
    videoDuration: navigation.currentVideo?.duration ?? 0,
    playerRef,
  });

  useEffect(() => {
    saveProgressRef.current = progressWithVideo.saveCurrentPosition;
  }, [progressWithVideo.saveCurrentPosition]);
  
  const handleMarkComplete = async () => {
    if (!user || !navigation.activeVideoId) return;
    try {
      await markComplete({
        videoId: navigation.activeVideoId as Id<"videos">,
        clerkId: user.id,
        courseId: subjectId,
      });
    } catch (error) {
      console.error("Failed to mark complete", error);
      toast.error("Failed to mark video complete", {
        description: "Please try again",
      });
    }
  };
  
  const handleMarkWeekComplete = async (weekId: string) => {
    if (!user) return;
    try {
      const result = await markWeekComplete({
        clerkId: user.id,
        courseId: subjectId,
        weekId: weekId as Id<"weeks">,
      });
      toast.success(result.completed ? "Week marked complete" : "Week marked incomplete");
    } catch (error) {
      console.error("Failed to mark week complete", error);
      toast.error("Failed to mark week complete", {
        description: "Please try again",
      });
    }
  };
  
  const handleMarkCourseComplete = async () => {
    if (!user) return;
    try {
      const result = await markCourseComplete({
        clerkId: user.id,
        courseId: subjectId,
      });
      toast.success(result.completed ? "Course marked complete" : "Course marked incomplete");
    } catch (error) {
      console.error("Failed to mark course complete", error);
      toast.error("Failed to mark course complete", {
        description: "Please try again",
      });
    }
  };

  const handleVideoEnd = useCallback(() => {
    const nextVideoId = navigation.findNextVideo();
    if (nextVideoId) {
      autoplay.startCountdown(nextVideoId);
    }
  }, [navigation, autoplay]);

  const handlePlayNextNow = useCallback(() => {
    const nextVideoId = navigation.findNextVideo();
    if (nextVideoId) {
      autoplay.playNextNow(nextVideoId);
    }
  }, [navigation, autoplay]);

  const findVideo = useCallback((id: string | null) => {
    if (!content || !id) return null;
    for (const week of content) {
      const video = week.videos.find(v => v._id === id);
      if (video) return { ...video, weekTitle: week.title, weekOrder: week.order };
    }
    return null;
  }, [content]);

  if (course === undefined || content === undefined) {
    return <LecturePlayerSkeleton />;
  }

  if (course === null) {
    notFound();
  }

  if (isMobile) {
    return <LecturePlayerSkeleton />;
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden md:gap-3">
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-x-hidden overflow-y-auto relative transition-all duration-300 ease-in-out">
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
        <div className="fixed inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none z-0" />
        
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 flex min-h-[56px] items-center gap-2 px-3 py-2 border-b bg-background/90 backdrop-blur-sm relative z-20">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-full max-w-none h-[100dvh] md:w-[85vw] md:max-w-80">
              <SheetTitle className="sr-only">
                Lecture navigation
              </SheetTitle>
              <LectureSidebar
                courseTitle={course.title}
                courseCode={course.code}
                content={content}
                currentVideoId={navigation.activeVideoId}
                onVideoSelect={navigation.handleVideoSelect}
                progressData={progressData}
                onMarkWeekComplete={user ? handleMarkWeekComplete : undefined}
                onMarkCourseComplete={user ? handleMarkCourseComplete : undefined}
              />
            </SheetContent>
          </Sheet>
          <span className="min-w-0 flex-1 font-semibold leading-tight line-clamp-2">{navigation.currentVideo?.title || cleanCourseTitle(course.title)}</span>
        </div>

        <div className={cn(
          "flex-1 px-4 py-3 sm:p-4 md:p-6 w-full space-y-3 md:space-y-4 transition-all duration-300",
          isSidebarOpen ? "max-w-none md:ml-4 lg:ml-6 xl:ml-8 mr-0 md:pr-4" : "max-w-7xl mx-auto"
        )}>
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 w-fit min-h-[44px]"
          >
            <Link href="/lectures">
              <ArrowLeft className="h-4 w-4" />
              Back to Missions
            </Link>
          </Button>

          {navigation.currentVideo ? (
            <div className="space-y-3 md:space-y-4">
              <div className="relative" ref={videoContainerRef}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20 z-30 rounded-t-lg overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${navigation.currentVideo.duration > 0 ? (progressWithVideo.currentTime / navigation.currentVideo.duration) * 100 : 0}%` }}
                  />
                </div>
                
                <VideoPlayer 
                  ref={playerRef}
                  videoId={navigation.currentVideo.youtubeId}
                  title={navigation.currentVideo.title}
                  transcriptUrl={navigation.currentVideo.transcriptUrl}
                  initialPosition={progressData?.find(p => p.videoId === navigation.activeVideoId)?.lastPosition ?? 0}
                  onProgressUpdate={progressWithVideo.handleProgressUpdate}
                  onPause={progressWithVideo.handlePause}
                  onEnded={handleVideoEnd}
                />

                {autoplay.showCountdown && navigation.findNextVideo() && (
                  <AutoplayOverlay 
                    secondsRemaining={autoplay.countdown}
                    nextVideoTitle={findVideo(navigation.findNextVideo())?.title}
                    onCancel={autoplay.cancelAutoplay}
                    onPlayNow={handlePlayNextNow}
                  />
                )}
              </div>



              <LectureHeader 
                title={navigation.currentVideo.title}
                weekTitle={navigation.currentVideo.weekTitle}
                duration={navigation.currentVideo.duration}
                showUserActions={!!user}
                isCompleted={navigation.isCurrentVideoCompleted}
                onMarkComplete={handleMarkComplete}
              />

              <VideoNotesPanel
                userId={user?.id}
                videoId={navigation.activeVideoId}
                playerRef={playerRef}
              />

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10">
              <p>Select a lecture to start watching.</p>
              {content.length === 0 && <p className="mt-2 text-sm">No content available for this course yet.</p>}
            </div>
          )}
        </div>

        <KeyboardShortcutsHelp 
          isOpen={showShortcutsHelp} 
          onClose={() => setShowShortcutsHelp(false)} 
        />
      </main>

      {/* Sidebar Toggle Button (When Closed) */}
      <AnimatePresence initial={false}>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.05 } }}
            onClick={() => setIsSidebarOpen(true)}
            className="hidden md:flex items-center gap-2 fixed right-4 top-20 z-50 h-10 px-3 bg-black/90 border border-white/10 hover:border-primary hover:bg-black backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[3px_3px_0px_0px_#E62E2D] group transition-all duration-200"
            title="Open Course Navigation"
          >
            <HugeiconsIcon icon={Menu02Icon} className="h-5 w-5 text-white/70 group-hover:text-primary transition-colors" strokeWidth={2} />
            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Menu</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 352, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="hidden md:flex border-l bg-background flex-col shrink-0 relative overflow-hidden"
          >
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-3 right-3 z-20 flex items-center h-8 w-8 justify-center bg-black/50 border border-white/10 hover:border-primary hover:bg-black/80 backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[2px_2px_0px_0px_#E62E2D] group transition-all duration-200"
              title="Close Sidebar"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 text-white/70 group-hover:text-primary transition-colors" strokeWidth={2} />
            </button>
            <div className="w-88 h-full">
              <LectureSidebar
                courseTitle={course.title}
                courseCode={course.code}
                content={content}
                currentVideoId={navigation.activeVideoId}
                onVideoSelect={navigation.handleVideoSelect}
                progressData={progressData}
                onMarkWeekComplete={user ? handleMarkWeekComplete : undefined}
                onMarkCourseComplete={user ? handleMarkCourseComplete : undefined}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LecturePlayerPage() {
  return (
    <Suspense fallback={<LecturePlayerSkeleton />}>
      <LecturePlayerPageContent />
    </Suspense>
  );
}
