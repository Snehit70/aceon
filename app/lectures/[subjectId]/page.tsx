"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Loader2, PlayCircle, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import VideoPlayer from "@/components/shared/video-player";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Define types for props
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
}

// Extracted Sidebar Component
function LectureSidebar({ courseTitle, courseCode, courseTerm, content, currentVideoId, onVideoSelect }: SidebarProps) {
  // Find the week containing the current video to open it by default
  const activeWeekId = content.find(w => w.videos.some(v => v._id === currentVideoId))?._id;
  const defaultOpen = activeWeekId ? [activeWeekId] : [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <h2 className="font-semibold text-lg">{courseTitle}</h2>
        <p className="text-sm text-muted-foreground">{courseCode} • {courseTerm}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Accordion type="single" collapsible defaultValue={activeWeekId} className="space-y-2">
            {content.map((week) => (
              <AccordionItem key={week._id} value={week._id} className="border-none">
                <AccordionTrigger className="px-2 py-2 hover:no-underline hover:bg-muted/50 rounded-md text-sm font-medium">
                  <span className="text-left">{week.title}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-2">
                  <div className="space-y-1 ml-1 pl-2 border-l">
                    {week.videos.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-2 py-1">No videos</p>
                    ) : (
                      week.videos.map((video) => (
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
                            <PlayCircle className={cn(
                              "h-4 w-4 mt-1 shrink-0",
                              currentVideoId === video._id ? "text-primary" : "text-muted-foreground"
                            )} />
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default function LecturePlayerPage() {
  const params = useParams();
  const subjectId = params.subjectId as Id<"courses">;

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Determine which video to show (selected or default)
  let activeVideoId = selectedVideoId;
  if (!activeVideoId && content && content.length > 0) {
    const firstWeekWithVideos = content.find(w => w.videos.length > 0);
    if (firstWeekWithVideos && firstWeekWithVideos.videos.length > 0) {
      activeVideoId = firstWeekWithVideos.videos[0]._id;
    }
  }

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

  if (course === undefined || content === undefined) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (course === null) {
    return <div className="container py-10">Course not found</div>;
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Desktop Sidebar */}
      {isSidebarOpen && (
        <aside className="hidden md:flex w-80 border-r bg-background flex-col shrink-0 relative">
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
            onVideoSelect={setSelectedVideoId}
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
                onVideoSelect={setSelectedVideoId}
              />
            </SheetContent>
          </Sheet>
          <span className="font-semibold truncate">{currentVideo?.title || course.title}</span>
        </div>

        <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">
          {currentVideo ? (
            <>
              <VideoPlayer 
                videoId={currentVideo.youtubeId}
                title={currentVideo.title}
              />

              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold">{currentVideo.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    {currentVideo.weekTitle}
                  </p>
                </div>

                <Separator />

                <div className="prose dark:prose-invert max-w-none">
                  <h3 className="text-lg font-semibold">About this lecture</h3>
                  <p className="text-muted-foreground">
                    Video ID: {currentVideo.youtubeId}
                  </p>
                </div>
              </div>
            </>
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
