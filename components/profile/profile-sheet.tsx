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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forceOpen?: boolean;
}

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
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Student Profile</SheetTitle>
          <SheetDescription>
            Customize your academic experience.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-8">
          {/* Level Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Current Academic Level
            </h3>
            <RadioGroup
              value={level}
              onValueChange={(val) => setLevel(val as any)}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="foundation" id="foundation" className="peer sr-only" />
                <Label
                  htmlFor="foundation"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="mb-2 text-xl">🌱</span>
                  Foundation
                </Label>
              </div>
              <div>
                <RadioGroupItem value="diploma" id="diploma" className="peer sr-only" />
                <Label
                  htmlFor="diploma"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="mb-2 text-xl">📜</span>
                  Diploma
                </Label>
              </div>
              <div>
                <RadioGroupItem value="degree" id="degree" className="peer sr-only" />
                <Label
                  htmlFor="degree"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="mb-2 text-xl">🎓</span>
                  Degree
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Enrolled Courses (This Term)</h3>
                <Badge variant="outline" className="text-xs">
                  {selectedCourses.length} selected
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showAll"
                  checked={showAllLevels}
                  onChange={(e) => setShowAllLevels(e.target.checked)}
                  className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                />
                <label
                  htmlFor="showAll"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Show courses from all levels
                </label>
              </div>
            </div>
            
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="space-y-4">
                {filteredCourses?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No courses found for this level.
                  </div>
                ) : (
                  filteredCourses?.map((course) => (
                  <div
                    key={course._id}
                    className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer border ${
                      selectedCourses.includes(course._id)
                        ? "bg-primary/10 border-primary/50"
                        : "hover:bg-muted border-transparent"
                    }`}
                    onClick={() => toggleCourse(course._id)}
                  >
                    <div className="mt-1">
                      {selectedCourses.includes(course._id) ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{course.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="uppercase">{course.code}</span>
                        <span>•</span>
                        <span className="capitalize">{course.level}</span>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <SheetFooter>
          {!forceOpen && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
