"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useCallback, Suspense, useEffect } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VideoPlayer, { VideoPlayerRef } from "@/components/shared/video-player";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn, cleanCourseTitle } from "@/lib/utils";

import { useUser } from "@clerk/nextjs";

import { LectureSidebar } from "@/components/lectures/lecture-sidebar";
import { AutoplayOverlay } from "@/components/lectures/autoplay-overlay";
import { LectureHeader } from "@/components/lectures/lecture-header";

import { useVideoProgress } from "@/hooks/use-video-progress";
import { useAutoplay } from "@/hooks/use-autoplay";
import { useVideoNavigation } from "@/hooks/use-video-navigation";

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
 * - `theaterMode`: Toggles expanded video view.
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
  const [theaterMode, setTheaterMode] = useState(false);
  
  const playerRef = useRef<VideoPlayerRef>(null);
  const videoSelectRef = useRef<(id: string) => void>(() => {});
  const saveProgressRef = useRef<(() => void) | null>(null);
  
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
    return (
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-black">
        <aside className="hidden md:flex w-80 border-r bg-background flex-col shrink-0 relative">
          <div className="relative p-4 border-b border-white/10 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/bg-denji-power.jpg')] bg-cover bg-[center_top] opacity-60 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/50 animate-pulse" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * 0.7}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-4 w-8 bg-neutral-800/50 animate-pulse" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-5 w-32 bg-neutral-800/50 animate-pulse drop-shadow-lg" />
                  <div className="h-4 w-20 bg-neutral-800/30 animate-pulse drop-shadow-lg" />
                  <div className="h-3 w-28 bg-neutral-800/30 animate-pulse drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-10 w-full bg-white/5 hover:bg-white/10 animate-pulse flex items-center px-2">
                  <div className="h-4 w-24 bg-neutral-800/50" />
                </div>
              </div>
            ))}
          </div>
        </aside>
        
        <main className="flex-1 flex flex-col min-w-0 bg-black overflow-y-auto relative">
          <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
          <div 
            className="fixed inset-0 opacity-10 pointer-events-none z-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, #ffffff 4px, #ffffff 5px)`
            }}
          />
          <div className="fixed inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none z-0" />
          
          <div className="flex-1 p-4 md:p-6 w-full max-w-5xl mx-auto space-y-4 relative z-10">
            <div className="h-8 w-40 bg-white/5 border border-white/10 animate-pulse" />
            
            <div className="aspect-video bg-black border border-white/10 animate-pulse relative" />
            
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-8 w-3/4 bg-neutral-800/50 animate-pulse" />
                  <div className="h-4 w-32 bg-neutral-800/30 animate-pulse" />
                </div>
                <div className="h-12 w-40 bg-[#E62E2D]/20 border-2 border-[#E62E2D]/50 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
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
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-3 right-3 z-20 flex items-center h-8 w-8 justify-center bg-black/50 border border-white/10 hover:border-primary hover:bg-black/80 backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[2px_2px_0px_0px_#E62E2D] group transition-all duration-200"
            title="Close Sidebar"
          >
            <PanelLeftClose className="h-4 w-4 text-white/70 group-hover:text-primary transition-colors" />
          </button>
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
        </aside>
      )}

      {/* Sidebar Toggle Button (When Closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="hidden md:flex items-center gap-2 fixed left-4 top-20 z-50 h-10 px-3 bg-black/90 border border-white/10 hover:border-primary hover:bg-black backdrop-blur-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[3px_3px_0px_0px_#E62E2D] group transition-all duration-200"
          title="Open Course Navigation"
        >
          <PanelLeftOpen className="h-5 w-5 text-white/70 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Menu</span>
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-black overflow-y-auto relative transition-all duration-300 ease-in-out">
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
                content={content}
                currentVideoId={navigation.activeVideoId}
                onVideoSelect={navigation.handleVideoSelect}
                progressData={progressData}
                onMarkWeekComplete={user ? handleMarkWeekComplete : undefined}
                onMarkCourseComplete={user ? handleMarkCourseComplete : undefined}
              />
            </SheetContent>
          </Sheet>
          <span className="font-semibold truncate">{navigation.currentVideo?.title || cleanCourseTitle(course.title)}</span>
        </div>

        <div className={cn(
          "flex-1 p-4 md:p-6 w-full space-y-4 transition-all duration-300",
          isSidebarOpen ? "max-w-5xl mx-auto" : "max-w-7xl mx-auto"
        )}>
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 w-fit"
          >
            <Link href="/lectures">
              <ArrowLeft className="h-4 w-4" />
              Back to Missions
            </Link>
          </Button>

          {navigation.currentVideo ? (
            <div className="space-y-4">
              <div className="relative">
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
                  initialPosition={progressData?.find(p => p.videoId === navigation.activeVideoId)?.lastPosition ?? 0}
                  onProgressUpdate={progressWithVideo.handleProgressUpdate}
                  onPause={progressWithVideo.handlePause}
                  onEnded={handleVideoEnd}
                  theaterMode={theaterMode}
                  onTheaterModeChange={setTheaterMode}
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

export default function LecturePlayerPage() {
  return (
    <Suspense fallback={null}>
      <LecturePlayerPageContent />
    </Suspense>
  );
}
