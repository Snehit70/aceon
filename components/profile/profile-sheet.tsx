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
      const profileLevel = profile.level as "foundation" | "diploma" | "degree";
      setLevel(profileLevel);
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
      <SheetContent side="right" className="w-full max-w-[400px] sm:max-w-[540px] p-0 border-l border-white/10 bg-background/80 backdrop-blur-xl h-screen overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('/images/character-angel-devil.jpg')] bg-cover bg-center opacity-30 pointer-events-none"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40 pointer-events-none" aria-hidden="true" />
        <div className="h-full flex flex-col relative z-10">
          <SheetHeader className="px-6 py-6 border-b border-white/5 bg-white/5">
            <SheetTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              Student Profile
            </SheetTitle>
            <SheetDescription className="text-muted-foreground/80">
              Customize your academic experience to see relevant content.
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-6 border-b border-white/5 space-y-4">
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
                  <lvl.icon className={cn("w-6 h-6 mb-2 relative z-10", lvl.iconColor)} />
                  <span className="text-xs font-medium relative z-10">{lvl.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
              <h3 className="text-sm font-medium text-foreground/90">Enrolled Courses</h3>
              <button
                onClick={() => setShowAllLevels(!showAllLevels)}
                className="text-xs text-primary/70 hover:text-primary transition-colors"
              >
                {showAllLevels ? "Show Level Only" : "Show All"}
              </button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="px-6 py-4 pb-6 space-y-2">
                <AnimatePresence>
                  {filteredCourses?.map((course) => (
                    <motion.button
                      key={course._id}
                      onClick={() => toggleCourse(course._id)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left",
                        selectedCourses.includes(course._id)
                          ? "border-primary/50 bg-primary/5"
                          : "border-white/5 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {selectedCourses.includes(course._id) ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{course.title}</p>
                        <p className="text-xs text-muted-foreground/70 truncate">{course.code}</p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-white/5 bg-white/5">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
