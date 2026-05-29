"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, cleanCourseTitle } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Doc } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface SidebarProps {
  courseTitle: string;
  courseCode: string;
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

type ConfirmAction =
  | { type: "week"; weekId: string; weekTitle: string; markAsComplete: boolean }
  | { type: "course"; markAsComplete: boolean };

/**
 * LectureSidebar - Navigation sidebar for the lecture viewing experience.
 * 
 * **Context**: Sits on the left side (or bottom sheet on mobile) of the lecture viewer.
 * It displays the course structure (Weeks -> Videos) and tracks completion progress.
 * 
 * **Integrations**: 
 * - Convex: Receives `progressData` to show read-only status (does not mutate directly).
 * - Callbacks: `onVideoSelect`, `onMarkWeekComplete`, `onMarkCourseComplete` trigger mutations up the tree.
 * 
 * **State Management**:
 * - Calculates `overallProgress`, `completedVideos`, and `totalVideos` derived from props.
 * - Determines `activeWeekId` based on `currentVideoId` to auto-expand the correct accordion.
 * 
 * **User Flow**:
 * 1. User sees course progress circle at top.
 * 2. User expands a Week accordion.
 * 3. User clicks a video to play -> `onVideoSelect`.
 * 4. User can mark an entire Week or Course as complete via helper buttons.
 * 
 * @param props - Component props.
 * @param props.courseTitle - Full title of the course.
 * @param props.courseCode - Course code (e.g., "CS1001").
 * @param props.content - Nested structure of Weeks and Videos.
 * @param props.currentVideoId - Currently playing video ID (for highlighting).
 * @param props.onVideoSelect - Callback when a video is clicked.
 * @param props.progressData - Array of progress records from Convex.
 * @param props.onMarkWeekComplete - Optional callback to bulk-complete a week.
 * @param props.onMarkCourseComplete - Optional callback to bulk-complete the course.
 * @returns A responsive sidebar with accordion navigation.
 */
export function LectureSidebar({ 
  courseTitle, 
  courseCode, 
  content, 
  currentVideoId, 
  onVideoSelect, 
  progressData, 
  onMarkWeekComplete, 
  onMarkCourseComplete 
}: SidebarProps) {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
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
  const confirmTitle = useMemo(() => {
    if (!confirmAction) return "";
    if (confirmAction.type === "week") {
      return confirmAction.markAsComplete
        ? `Mark ${confirmAction.weekTitle} as complete?`
        : `Mark ${confirmAction.weekTitle} as incomplete?`;
    }
    return confirmAction.markAsComplete
      ? "Mark full course as complete?"
      : "Mark full course as incomplete?";
  }, [confirmAction]);
  const confirmDescription = useMemo(() => {
    if (!confirmAction) return "";
    if (confirmAction.type === "week") {
      return confirmAction.markAsComplete
        ? "This will mark every lecture in this week as done."
        : "This will unmark every lecture in this week.";
    }
    return confirmAction.markAsComplete
      ? "This will mark every lecture in this course as done."
      : "This will unmark every lecture in this course.";
  }, [confirmAction]);

  return (
    <>
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="border border-white/15 bg-black text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-wide text-white">{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-white/20 bg-transparent text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.type === "week") {
                  onMarkWeekComplete?.(confirmAction.weekId);
                } else {
                  onMarkCourseComplete?.();
                }
                setConfirmAction(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex flex-col h-full relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
      <div className="relative p-3 sm:p-5 min-h-[84px] sm:min-h-[110px] border-b border-white/10 sticky top-0 z-10 overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('/images/bg-denji-power.jpg')] bg-cover bg-[center_top] opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black pointer-events-none" />
        
        <div className="relative z-10">
        <div className="flex items-center gap-3 sm:gap-5 pl-1 sm:pl-2">
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-16 sm:h-16 shrink-0">
            <svg className="w-11 h-11 sm:w-16 sm:h-16 -rotate-90" viewBox="0 0 64 64">
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
              <span className="text-[10px] sm:text-sm font-bold text-foreground">{overallProgress}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-[13px] sm:text-lg truncate drop-shadow-lg">{cleanCourseTitle(courseTitle)}</h2>
            <p className="text-[10px] sm:text-sm text-muted-foreground drop-shadow-lg">{courseCode}</p>
            <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 drop-shadow-lg">
              {completedVideos} of {totalVideos} completed
            </p>
            {onMarkCourseComplete && totalVideos > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmAction({ type: "course", markAsComplete: !isCourseComplete })}
                className="h-6 px-1.5 text-[9px] sm:text-xs mt-1 text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {isCourseComplete ? "Mark Course Incomplete" : "Mark All Done"}
              </Button>
            )}
          </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 sm:p-4">
          <Accordion type="single" collapsible defaultValue={activeWeekId} className="space-y-1.5 sm:space-y-2">
            {content.map((week, index) => {
              const weekComplete = isWeekComplete(week);
              return (
              <AccordionItem
                key={week._id}
                value={week._id}
                className={cn(
                  "border-none",
                  index > 0 && "mt-2 pt-2 border-t border-white/10",
                )}
              >
                <div className="flex items-center gap-1">
                  <AccordionTrigger className="flex-1 px-1.5 py-2.5 sm:py-3 hover:no-underline hover:bg-white/5 rounded-none transition-colors group min-h-[40px] sm:min-h-[46px]">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {weekComplete && <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />}
                      <span className="text-left font-display font-bold uppercase tracking-wide text-foreground text-[12px] sm:text-[15px] leading-none">{week.title}</span>
                    </div>
                  </AccordionTrigger>
                  {onMarkWeekComplete && week.videos.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmAction({
                          type: "week",
                          weekId: week._id,
                          weekTitle: week.title,
                          markAsComplete: !weekComplete,
                        });
                      }}
                      className="h-6 px-1.5 text-[9px] text-muted-foreground hover:text-foreground shrink-0"
                      title={weekComplete ? "Mark week as incomplete" : "Mark week as done"}
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
                        
                        return (
                          <Button
                            key={video._id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-left h-auto py-2 px-2 sm:py-3 sm:px-3 border-l-2 transition-all rounded-none",
                              currentVideoId === video._id 
                                ? "bg-primary/10 border-primary text-white" 
                                : "border-transparent text-muted-foreground hover:bg-primary/5 hover:text-white"
                            )}
                            onClick={() => onVideoSelect(video._id)}
                          >
                            <div className="flex items-start gap-2 sm:gap-3 w-full min-w-0">
{isCompleted ? (
                                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                              ) : (
                                <PlayCircle className={cn(
                                  "h-3 w-3 sm:h-4 sm:w-4 shrink-0",
                                  currentVideoId === video._id ? "text-primary" : "text-muted-foreground"
                                )} />
                              )}
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-[11px] sm:text-sm font-medium line-clamp-2 leading-snug">{video.title}</p>
                                <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5">
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
      </div>
    </>
  );
}
