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
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, GraduationCap, BookOpen, Sprout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceOpen?: boolean;
}

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

export function ProfileSheet({ open, onOpenChange, forceOpen = false }: ProfileSheetProps) {
  const { user } = useUser();
  const profile = useQuery(api.studentProfile.getProfile, user ? { clerkId: user.id } : "skip");
  const courses = useQuery(api.courses.list);
  const updateProfile = useMutation(api.studentProfile.updateProfile);

  const [level, setLevel] = useState<"foundation" | "diploma" | "degree">("foundation");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    if (profile) {
      setLevel(profile.level as any);
      setSelectedCourses(profile.enrolledCourseIds);
    }
  }, [profile]);

  // Filter courses based on selected level
  const filteredCourses = courses?.filter(course => {
    if (showAllLevels) return true;
    return course.level === level;
  });

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        clerkId: user.id,
        level,
        enrolledCourseIds: selectedCourses as Id<"courses">[],
        currentTerm: "Jan 2024", // Hardcoded for now or fetch dynamically
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  return (
    <Sheet open={open} onOpenChange={forceOpen ? () => {} : onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 border-l border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="h-full flex flex-col">
          <SheetHeader className="px-6 py-6 border-b border-white/5 bg-white/5">
            <SheetTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              Student Profile
            </SheetTitle>
            <SheetDescription className="text-muted-foreground/80">
              Customize your academic experience to see relevant content.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 py-6">
            <div className="space-y-8 pb-10">
              {/* Level Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground/90">Academic Level</h3>
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase text-[10px] tracking-wider">
                    Required
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {levels.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setLevel(lvl.id)}
                      className={cn(
                        "group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden",
                        level === lvl.id 
                          ? `${lvl.activeBorder} bg-background` 
                          : "border-white/5 bg-white/5 hover:bg-white/10",
                        lvl.border
                      )}
                    >
                      {level === lvl.id && (
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", lvl.color)} />
                      )}
                      
                      <lvl.icon className={cn(
                        "w-8 h-8 mb-3 transition-transform duration-300 group-hover:scale-110",
                        level === lvl.id ? lvl.iconColor : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      
                      <span className={cn(
                        "text-sm font-medium transition-colors",
                        level === lvl.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {lvl.label}
                      </span>
                      
                      {level === lvl.id && (
                        <motion.div
                          layoutId="active-check"
                          className="absolute top-2 right-2 text-primary"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground/90">Enrolled Courses</h3>
                    <Badge variant="secondary" className="bg-white/10 hover:bg-white/20">
                      {selectedCourses.length} selected
                    </Badge>
                  </div>
                  
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        checked={showAllLevels}
                        onChange={(e) => setShowAllLevels(e.target.checked)}
                        className="peer appearance-none w-4 h-4 rounded border border-muted-foreground/50 checked:border-primary checked:bg-primary transition-all"
                      />
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Show courses from all levels
                    </span>
                  </label>
                </div>
                
                <div className="grid gap-2">
                  <AnimatePresence mode="popLayout">
                    {filteredCourses?.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-white/5 text-center"
                      >
                        <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No courses found for this level.</p>
                      </motion.div>
                    ) : (
                      filteredCourses?.map((course, i) => {
                        const isSelected = selectedCourses.includes(course._id);
                        return (
                          <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => toggleCourse(course._id)}
                            className={cn(
                              "relative flex items-start gap-4 p-3 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden group",
                              isSelected 
                                ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_-10px_rgba(var(--primary),0.3)]" 
                                : "bg-card/30 border-white/5 hover:bg-white/5 hover:border-white/10"
                            )}
                          >
                            <div className={cn(
                              "mt-1 rounded-full p-0.5 transition-colors",
                              isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {isSelected ? (
                                <CheckCircle2 className="w-5 h-5 fill-current" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className={cn(
                                  "font-medium text-sm transition-colors",
                                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                  {course.title}
                                </p>
                                {isSelected && (
                                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/20 text-[10px] h-5 px-1.5">
                                    Enrolled
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                                <span className="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                  {course.code}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{course.level}</span>
                              </div>
                            </div>
                            
                            {/* Interactive glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 pointer-events-none" />
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 border-t border-white/5 bg-white/5 mt-auto">
            <div className="flex w-full gap-3">
              {!forceOpen && (
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
