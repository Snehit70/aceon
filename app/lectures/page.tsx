"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Loader2, ArrowRight } from "lucide-react";

export default function LecturesPage() {
  const courses = useQuery(api.courses.list);

  if (courses === undefined) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lectures</h1>
        <p className="text-muted-foreground">
          Access course lectures and video resources organized by course.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course._id} className="flex flex-col hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {course.code}
                </span>
                <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {course.term}
                </span>
              </div>
              <CardTitle className="line-clamp-1">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                {course.level} level course
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button asChild className="w-full">
                <Link href={`/lectures/${course._id}`}>
                  View Lectures <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20 border-dashed">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">No Courses Found</h3>
            <p className="text-muted-foreground">
              There are no courses available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
