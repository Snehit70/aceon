"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, GraduationCap, BookOpen, Sprout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceOpen?: boolean;
}

/**
 * ProfileSheet - User profile configuration drawer.
 * 
 * **Context**: A slide-out drawer (Sheet) that allows users to configure their academic level
 * (Foundation/Diploma/Degree) and manage their enrolled courses.
 * 
 * **Integrations**:
 * - Convex: Fetches user profile, course list, and progress data.
 * - Mutations: Updates user profile and marks courses as complete/incomplete.
 * 
 * **State Management**:
 * - `level`: Current academic level selection.
 * - `studyingCourseIds`: Courses marked as "currently studying".
 * - `completedCourseIds`: Courses marked as "done" (auto-calculated from progress).
 * - `showAllLevels`: Toggle to show courses from all levels vs. current level only.
 * 
 * **User Flow**:
 * 1. User opens profile (or auto-opens on first login if `forceOpen`).
 * 2. User selects their academic level (affects course filtering).
 * 3. User marks courses as "Studying" or "Done".
 * 4. On save, profile is updated and course completions are synced.
 * 
 * @param props - Component props.
 * @param props.open - Whether the sheet is visible.
 * @param props.onOpenChange - Callback when open state changes.
 * @param props.forceOpen - If true, prevents closing (used for mandatory setup).
 * @returns A slide-out profile configuration panel.
 */
const levels = [
  { 
    id: "foundation", 
    label: "Foundation", 
    icon: Sprout, 
    color: "from-emerald-500/20 to-green-500/20", 
    border: "group-hover:border-emerald-500/50",
    activeBorder: "border-emerald-500",
    iconColor: "text-emerald-400"
  },
  { 
    id: "diploma", 
    label: "Diploma", 
    icon: BookOpen, 
    color: "from-blue-500/20 to-indigo-500/20", 
    border: "group-hover:border-blue-500/50",
    activeBorder: "border-blue-500",
    iconColor: "text-blue-400"
  },
  { 
    id: "degree", 
    label: "Degree", 
    icon: GraduationCap, 
    color: "from-purple-500/20 to-pink-500/20", 
    border: "group-hover:border-purple-500/50",
    activeBorder: "border-purple-500",
    iconColor: "text-purple-400"
  },
] as const;

const getLevelOrder = (lvl: string) => {
  if (lvl === "foundation") return 1;
  if (lvl === "diploma") return 2;
  if (lvl === "degree") return 3;
  return 0;
};

export function ProfileSheet({ open, onOpenChange, forceOpen = false }: ProfileSheetProps) {
  const { user } = useUser();
  const profile = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const courses = useQuery(api.courses.list);
  const allProgress = useQuery(api.progress.getAllCoursesProgress, user ? { clerkId: user.id } : "skip");
  const updateProfile = useMutation(api.users.updateUser);
  const markCourseComplete = useMutation(api.progress.markCourseComplete);

  const [level, setLevel] = useState<"foundation" | "diploma" | "degree">("foundation");
  const [studyingCourseIds, setStudyingCourseIds] = useState<Id<"courses">[]>([]);
  const [completedCourseIds, setCompletedCourseIds] = useState<Id<"courses">[]>([]);
  const [initialCompletedIds, setInitialCompletedIds] = useState<Id<"courses">[]>([]);
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    if (profile) {
      const profileLevel = profile.level as "foundation" | "diploma" | "degree";
      setLevel(profileLevel);
      setStudyingCourseIds(profile.enrolledCourseIds || []);
    }
  }, [profile]);

  useEffect(() => {
    if (allProgress && profile?.level && courses) {
      const userLevelOrder = getLevelOrder(profile.level);
      
      const doneIds: Id<"courses">[] = [];
      
      for (const course of courses) {
        const courseLevelOrder = getLevelOrder(course.level);
        const isPriorLevel = userLevelOrder > courseLevelOrder;
        const progressPercent = allProgress[course._id] || 0;
        
        if (isPriorLevel || progressPercent === 100) {
          doneIds.push(course._id);
        }
      }
      
      setCompletedCourseIds(doneIds);
      setInitialCompletedIds(doneIds);
    }
  }, [allProgress, profile, courses]);

  // Filter courses based on selected level
  const filteredCourses = courses?.filter(course => {
    if (showAllLevels) return true;
    return course.level === level;
  });

  const getCourseStatus = (courseId: Id<"courses">) => {
    if (studyingCourseIds.includes(courseId)) return 'studying';
    if (completedCourseIds.includes(courseId)) return 'done';
    return null;
  };

  const handleCourseStatusChange = (courseId: Id<"courses">, status: 'studying' | 'done' | null) => {
    setStudyingCourseIds(prev => prev.filter(id => id !== courseId));
    setCompletedCourseIds(prev => prev.filter(id => id !== courseId));

    if (status === 'studying') {
      setStudyingCourseIds(prev => [...prev, courseId]);
    } else if (status === 'done') {
      setCompletedCourseIds(prev => [...prev, courseId]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        clerkId: user.id,
        level,
        enrolledCourseIds: studyingCourseIds,
      });

      // Mark newly completed courses (wasn't 100% before, now marked DONE)
      const toComplete = completedCourseIds.filter(courseId => {
        const currentProgress = allProgress?.[courseId] || 0;
        return currentProgress < 100;
      });

      // Un-complete courses that were DONE before but now changed to STUDYING or unselected
      const toUncomplete = initialCompletedIds.filter(courseId => 
        !completedCourseIds.includes(courseId)
      );

      // Process completions (fault-tolerant - continue even if some fail)
      const results = await Promise.allSettled([
        ...toComplete.map(courseId => 
          markCourseComplete({ clerkId: user.id, courseId })
        ),
        ...toUncomplete.map(courseId => 
          markCourseComplete({ clerkId: user.id, courseId })
        ),
      ]);

      // Log any failures but don't block save
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`${failures.length} course status updates failed:`, failures);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={forceOpen ? () => {} : onOpenChange}>
<SheetContent side="right" className="w-full max-w-[400px] sm:max-w-[540px] p-0 border-l border-white/10 bg-black h-screen overflow-hidden flex flex-col">
        <div className="relative h-64 shrink-0 w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-[url('/images/character-angel-devil.jpg')] bg-cover bg-[center_55%] opacity-100"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <SheetTitle className="text-3xl font-display font-black tracking-tighter text-white uppercase drop-shadow-lg">
              Student <span className="text-primary">Profile</span>
            </SheetTitle>
            <SheetDescription className="text-white/80 font-medium mt-1 text-sm">
              Configure your academic identity.
            </SheetDescription>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-black">
          <div className="px-6 py-4 border-b border-white/10 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Threat Level</h3>
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-[10px] tracking-wider">
                REQUIRED
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 px-1 rounded-md border transition-all duration-200",
                    level === lvl.id 
                      ? "border-primary bg-primary/10 text-white" 
                      : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="text-xs font-bold uppercase tracking-wide">{lvl.label}</span>
                  {level === lvl.id && (
                    <motion.div
                      layoutId="activeLevel"
                      className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-3 flex items-center justify-between border-b border-white/10 bg-white/5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Enrolled Missions</h3>
              <button
                onClick={() => setShowAllLevels(!showAllLevels)}
                className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
              >
                {showAllLevels ? "[ Show Level Only ]" : "[ Show All ]"}
              </button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 pb-6 space-y-1">
                <AnimatePresence>
                  {filteredCourses?.map((course) => {
                    const status = getCourseStatus(course._id);
                    return (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={cn(
                          "w-full p-4 rounded border transition-all space-y-3",
                          status !== null
                            ? "border-white/10 bg-white/5"
                            : "border-transparent hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm font-bold uppercase tracking-tight",
                            status !== null ? "text-white" : "text-muted-foreground"
                          )}>
                            {course.title}
                          </p>
                          <Badge variant="outline" className="shrink-0 font-mono text-[9px] border-white/10 text-muted-foreground">
                            {course.code}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleCourseStatusChange(course._id, status === 'studying' ? null : 'studying')}
                            className={cn(
                              "flex items-center justify-center gap-2 py-1.5 px-3 rounded text-[10px] font-bold uppercase tracking-wider border transition-all",
                              status === 'studying'
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <BookOpen className="w-3 h-3" />
                            Studying
                          </button>
                          
                          <button
                            onClick={() => handleCourseStatusChange(course._id, status === 'done' ? null : 'done')}
                            className={cn(
                              "flex items-center justify-center gap-2 py-1.5 px-3 rounded text-[10px] font-bold uppercase tracking-wider border transition-all",
                              status === 'done'
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                : "bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Done
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-white/10 bg-black shrink-0">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-12 text-sm shadow-[0_0_20px_rgba(230,46,45,0.3)] hover:shadow-[0_0_30px_rgba(230,46,45,0.5)] transition-all"
            >
              {isSaving ? "Saving Config..." : "Confirm & Save Profile"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
