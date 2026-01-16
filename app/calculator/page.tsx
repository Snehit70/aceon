"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trash2, Plus, Save, Loader2, Calculator as CalculatorIcon, Info } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser, SignInButton } from "@clerk/nextjs";
import { IITM_COURSES, GRADING_SYSTEM, type Grade } from "./data";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

type Course = {
  id: string;
  name: string; // This stores the course code (e.g., "BSCS2001")
  title: string; // This stores the full title (e.g., "Database Management Systems")
  credits: number;
  grade: Grade;
};

// Sub-component to manage individual row state (specifically the combobox search query)
const CourseRow = ({
  course,
  onUpdate,
  onRemove,
}: {
  course: Course;
  onUpdate: (id: string, field: keyof Course, value: string | number) => void;
  onRemove: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter courses based on query
  const filteredCourses = useMemo(() => {
    if (!query) return IITM_COURSES;
    const lowerQuery = query.toLowerCase();
    return IITM_COURSES.filter(
      (c) =>
        c.code.toLowerCase().includes(lowerQuery) ||
        c.title.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleCourseSelect = (code: string) => {
    const selectedCourse = IITM_COURSES.find((c) => c.code === code);
    if (selectedCourse) {
      onUpdate(course.id, "name", selectedCourse.code);
      onUpdate(course.id, "title", selectedCourse.title);
      onUpdate(course.id, "credits", selectedCourse.credits);
      setIsOpen(false);
      setQuery(""); // Reset query after selection
    }
  };

  return (
    <div className="group flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 border rounded-xl bg-card hover:bg-muted/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 shadow-sm hover:shadow-md border-border/60">
      <div className="grid gap-2 flex-1 w-full">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Course</Label>
        <Combobox
          value={course.name}
          onValueChange={(val) => {
             if (val) handleCourseSelect(val as string);
          }}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <ComboboxInput
            placeholder="Search course (e.g. DBMS)"
            value={isOpen ? query : (course.name ? `${course.name} - ${course.title}` : "")}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full h-10 bg-background border-input focus:border-primary/50"
          />
          <ComboboxContent align="start" className="w-[var(--radix-combobox-trigger-width)] min-w-[300px] max-h-[300px] overflow-y-auto">
            <ComboboxList>
              {filteredCourses.length === 0 && (
                <ComboboxEmpty className="py-4 text-center text-sm text-muted-foreground">No courses found</ComboboxEmpty>
              )}
              {filteredCourses.map((c) => (
                <ComboboxItem key={c.code} value={c.code} className="cursor-pointer py-2 px-3 data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary rounded-md my-1">
                  <div className="flex flex-col">
                    <span className="font-medium">{c.code}</span>
                    <span className="text-xs text-muted-foreground">{c.title}</span>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex gap-3 w-full sm:w-auto">
        <div className="grid gap-2 w-24">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Credits</Label>
          <Select
            value={course.credits.toString()}
            onValueChange={(val) => onUpdate(course.id, "credits", parseInt(val))}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 4].map((cr) => (
                <SelectItem key={cr} value={cr.toString()}>
                  {cr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 w-24">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grade</Label>
          <Select
            value={course.grade}
            onValueChange={(val) => onUpdate(course.id, "grade", val)}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(GRADING_SYSTEM).map((g) => (
                <SelectItem key={g} value={g}>
                  {g} ({GRADING_SYSTEM[g as Grade]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(course.id)}
          className="mb-0.5 h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function CalculatorPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "", title: "", credits: 4, grade: "S" },
  ]);
  const [termName, setTermName] = useState("Term 1");
  const saveCalculation = useMutation(api.calculator.saveCalculation);
  const { user } = useUser();

  const addCourse = () => {
    setCourses([
      ...courses,
      { id: crypto.randomUUID(), name: "", title: "", credits: 4, grade: "S" },
    ]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const calculateSGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      // Only count courses that have a name selected, or treat empty as valid if manually filled?
      // Let's count everything that has credits.
      const points = GRADING_SYSTEM[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits === 0 ? "0.00" : (totalPoints / totalCredits).toFixed(2);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save your calculation.");
      return;
    }

    if (!termName.trim()) {
      toast.error("Please enter a term name.");
      return;
    }

    const validCourses = courses.filter((c) => c.name.trim());
    if (validCourses.length === 0) {
      toast.error("Please add at least one course.");
      return;
    }

    setIsSaving(true);
    try {
      await saveCalculation({
        term: termName.trim(),
        courses: validCourses.map((c) => ({ code: c.name, grade: c.grade, credits: c.credits })),
        sgpa: parseFloat(calculateSGPA()),
      });
      toast.success("Calculation saved successfully!");
    } catch (error) {
      toast.error("Failed to save calculation.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8 animate-in fade-in zoom-in-95 duration-500">
      <Card className="w-full max-w-4xl border-border/60 shadow-2xl bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 via-muted/20 to-transparent pb-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalculatorIcon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        GPA Calculator
                    </CardTitle>
                </div>
                <CardDescription className="text-base max-w-md">
                    Estimate your SGPA using the official IITM grading system. Add courses below.
                </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="text-right bg-background p-4 rounded-2xl border border-border/60 shadow-sm w-full md:w-auto min-w-[180px]">
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                        Estimated SGPA <Info className="h-3 w-3" />
                    </div>
                    <div className="text-5xl font-black text-primary tabular-nums tracking-tighter">
                        {calculateSGPA()}
                    </div>
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6 md:p-8">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="term" className="text-sm font-semibold text-foreground">Term Name</Label>
            <Input
              id="term"
              placeholder="e.g. May 2024 Term"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              className="font-medium h-11 text-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
                 <h3 className="font-semibold text-lg">Course List</h3>
                 <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{courses.length} courses</span>
            </div>
            
            {courses.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onUpdate={updateCourse}
                onRemove={removeCourse}
              />
            ))}
            
            <Button 
                variant="outline" 
                onClick={addCourse} 
                className="w-full h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Course
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t p-6 md:p-8 bg-muted/20">
            {!user ? (
             <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                <span>Want to save this calculation?</span>
                <SignInButton mode="modal">
                    <button className="font-bold text-primary hover:underline focus:outline-none">
                        Sign in to save your history
                    </button>
                </SignInButton>
             </div>
          ) : (
            <Button 
                variant="default" 
                onClick={handleSave} 
                disabled={isSaving} 
                size="lg"
                className="w-full sm:w-auto ml-auto rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-5 w-5" /> Save to History</>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
