"use client";

import { CheckCircle2, PlayCircle, Circle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, cleanCourseTitle } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";

export interface SidebarProps {
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

export function LectureSidebar({ 
  courseTitle, 
  courseCode, 
  courseTerm, 
  content, 
  currentVideoId, 
  onVideoSelect, 
  progressData, 
  onMarkWeekComplete, 
  onMarkCourseComplete 
}: SidebarProps) {
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
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-foreground mb-3 -ml-2"
        >
          <Link href="/lectures">
            <ArrowLeft className="h-4 w-4" />
            Back to Missions
          </Link>
        </Button>
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
            <h2 className="font-semibold text-lg truncate">{cleanCourseTitle(courseTitle)}</h2>
            <p className="text-sm text-muted-foreground">{courseCode}</p>
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
                              "w-full justify-start text-left h-auto py-3 px-3",
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
