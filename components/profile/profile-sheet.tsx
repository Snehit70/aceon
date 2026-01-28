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
                  {filteredCourses?.map((course) => (
                    <motion.button
                      key={course._id}
                      onClick={() => toggleCourse(course._id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded border transition-all text-left group",
                        selectedCourses.includes(course._id)
                          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                          : "border-transparent hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors",
                        selectedCourses.includes(course._id)
                          ? "bg-primary border-primary text-black"
                          : "border-muted-foreground/50 group-hover:border-white/50"
                      )}>
                        {selectedCourses.includes(course._id) && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-sm font-bold uppercase tracking-tight truncate",
                            selectedCourses.includes(course._id) ? "text-white" : "text-muted-foreground group-hover:text-white"
                          )}>
                            {course.title}
                          </p>
                          <Badge variant="outline" className="ml-2 font-mono text-[9px] border-white/10 text-muted-foreground">
                            {course.code}
                          </Badge>
                        </div>
                      </div>
                    </motion.button>
                  ))}
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
