"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trash2, Plus, Save } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

type Course = {
  id: string;
  name: string;
  credits: number;
  grade: string;
};

const GRADE_POINTS: Record<string, number> = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 4,
  U: 0,
};

export default function CalculatorPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Course 1", credits: 4, grade: "S" },
  ]);
  const [termName, setTermName] = useState("Term 1");
  const saveCalculation = useMutation(api.calculator.saveCalculation);
  const { user } = useUser();

  const addCourse = () => {
    setCourses([...courses, { id: crypto.randomUUID(), name: `Course ${courses.length + 1}`, credits: 4, grade: "S" }]);
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
      const points = GRADE_POINTS[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits === 0 ? "0" : (totalPoints / totalCredits).toFixed(2);
  };

  const handleSave = async () => {
    if (!user) {
        toast.error("Please sign in to save your calculation.");
        return;
    }
    try {
      await saveCalculation({
        term: termName,
        courses: courses.map(c => ({ code: c.name, grade: c.grade, credits: c.credits })),
        sgpa: parseFloat(calculateSGPA()),
      });
      toast.success("Calculation saved successfully!");
    } catch (error) {
      toast.error("Failed to save calculation.");
      console.error(error);
    }
  };

  return (
    <div className="container py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>GPA Calculator</CardTitle>
          <CardDescription>Calculate your SGPA for the current term.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
            <Label htmlFor="term">Term Name</Label>
            <Input
                id="term"
                placeholder="Jan 2024"
                value={termName}
                onChange={(e) => setTermName(e.target.value)}
            />
          </div>

          {courses.map((course) => (
            <div key={course.id} className="flex items-end gap-3 p-3 border rounded-lg bg-muted/20">
              <div className="grid gap-1.5 flex-1">
                <Label>Course Name</Label>
                <Input
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                  placeholder="Maths 1"
                />
              </div>
              <div className="grid gap-1.5 w-24">
                <Label>Credits</Label>
                <Select
                  value={course.credits.toString()}
                  onValueChange={(val) => updateCourse(course.id, "credits", parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 6, 8].map((cr) => (
                      <SelectItem key={cr} value={cr.toString()}>
                        {cr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5 w-24">
                <Label>Grade</Label>
                <Select
                  value={course.grade}
                  onValueChange={(val) => updateCourse(course.id, "grade", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(GRADE_POINTS).map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between border-t pt-6">
           <div className="flex gap-2">
              <Button variant="outline" onClick={addCourse}>
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
              <Button variant="secondary" onClick={handleSave} disabled={!user}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
           </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">SGPA</div>
            <div className="text-4xl font-bold">{calculateSGPA()}</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
