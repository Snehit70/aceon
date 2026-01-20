"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { BookOpen, Search, PlayCircle, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LecturesPage() {
  const { user } = useUser();
  const courses = useQuery(api.courses.list);
  const continueWatching = useQuery(
    api.progress.getContinueWatching,
    user?.id ? { clerkId: user.id, limit: 5 } : "skip"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "foundation" | "diploma" | "degree">("all");

  if (courses === undefined) {
    return (
      <div className="container py-12 max-w-6xl space-y-8">
         <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
         </div>
         <div className="flex flex-col md:flex-row gap-4 justify-between">
            <Skeleton className="h-10 w-full md:w-96" />
            <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
            </div>
         </div>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-48">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
         </div>
      </div>
    );
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="container py-12 max-w-6xl space-y-10 animate-in fade-in duration-500">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Lectures Library</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Access course lectures and video resources. Organized by course and term.
        </p>
      </div>

      {user && continueWatching && continueWatching.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Continue Watching</h2>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {continueWatching.map((item: NonNullable<typeof continueWatching>[number]) => {
              if (!item.video || !item.course) return null;
              return (
              <Card key={item._id} className="group overflow-hidden border-border/60 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {item.video.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {item.course.code} • {item.course.title}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.round(item.progress * 100)}% complete</span>
                      <span>{Math.floor(item.lastPosition / 60)}:{(item.lastPosition % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <Progress value={item.progress * 100} className="h-1.5" />
                  </div>
                  <Button asChild size="sm" className="w-full group-hover:bg-primary transition-all">
                    <Link href={`/lectures/${item.courseId}`}>
                      Resume <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between sticky top-16 z-40 bg-background/80 backdrop-blur-xl p-4 -mx-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by name or code..."
            className="pl-10 h-10 bg-background border-border/60 focus:border-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search courses"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {(["all", "foundation", "diploma", "degree"] as const).map((filter) => (
            <Button
              key={filter}
              variant={levelFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setLevelFilter(filter)}
              className="capitalize rounded-full px-4 shadow-none hover:shadow-md transition-all"
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course._id} className="group flex flex-col overflow-hidden border-border/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center rounded-md bg-background border border-border px-2.5 py-1 text-xs font-bold text-foreground shadow-sm">
                  {course.code}
                </span>
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {course.term}
                </span>
              </div>
              <CardTitle className="line-clamp-1 text-xl group-hover:text-primary transition-colors">{course.title}</CardTitle>
              <CardDescription className="line-clamp-1 text-sm">
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)} Level
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-6">
              <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                <Link href={`/lectures/${course._id}`}>
                  View Lectures <PlayCircle className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10">
            <div className="bg-muted p-4 rounded-full mb-4">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No Courses Found</h3>
            <p className="text-muted-foreground mt-2">
              We couldn&apos;t find any courses matching &quot;{searchQuery}&quot;
            </p>
            <Button variant="link" onClick={() => setSearchQuery("")} className="mt-4 text-primary">
                Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
