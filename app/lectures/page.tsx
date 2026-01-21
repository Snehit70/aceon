"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Play, Clock, ArrowRight, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/shared/course-card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function LecturesPage() {
  const { user } = useUser();
  const courses = useQuery(api.courses.listWithStats);
  const continueWatching = useQuery(
    api.progress.getContinueWatching,
    user?.id ? { clerkId: user.id, limit: 10 } : "skip"
  );
  const coursesProgress = useQuery(
    api.progress.getAllCoursesProgress,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | "foundation" | "diploma" | "degree">("all");

  if (courses === undefined) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl space-y-8 animate-pulse">
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
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
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
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Your Courses</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Continue where you left off or start a new subject.
        </p>
      </div>

      {/* Continue Watching - Horizontal Scroll */}
      {user && continueWatching && continueWatching.length > 0 && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Play className="h-5 w-5 fill-current text-primary" /> Continue Watching
            </h2>
          </div>
          
          <div className="relative -mx-4 px-4 overflow-hidden">
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {continueWatching.map((item: NonNullable<typeof continueWatching>[number], index) => {
                if (!item.video || !item.course) return null;
                const progressPercent = Math.round(item.progress * 100);
                const remainingSecs = Math.max(0, item.video.duration - item.lastPosition);
                const remainingMins = Math.floor(remainingSecs / 60);
                
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link 
                      href={`/lectures/${item.courseId}`}
                      className="flex-none w-[280px] snap-start group relative rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                    >
                    {/* Thumbnail Area */}
                    <div className="relative h-36 bg-muted/30 overflow-hidden">
                      {item.video.youtubeId ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={`https://img.youtube.com/vi/${item.video.youtubeId}/mqdefault.jpg`} 
                          alt={item.video.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/10">
                           <Play className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                         <div className="bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="h-6 w-6 fill-current pl-1" />
                         </div>
                      </div>
                      
                      {/* Progress Bar at bottom of image */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="secondary" className="font-mono text-[10px] uppercase h-5 px-1.5 rounded-sm">
                          {item.course.code}
                        </Badge>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {remainingMins}m left
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                        {item.video.title}
                      </h3>
                      
                       <div className="pt-2 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                         Resume Lecture <ArrowRight className="ml-1 h-3 w-3" />
                       </div>
                     </div>
                   </Link>
                 </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-4 bg-background/80 backdrop-blur-xl border-y border-white/5 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between transition-all">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search courses..."
            className="pl-10 h-10 bg-background/50 border-border/60 focus:border-primary/50 transition-all rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search courses"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {(["all", "foundation", "diploma", "degree"] as const).map((filter) => (
            <Button
              key={filter}
              variant={levelFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setLevelFilter(filter)}
              className={cn(
                  "capitalize rounded-full px-4 shadow-none transition-all",
                  levelFilter === filter ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:border-primary/50 hover:text-primary"
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <CourseCard
              id={course._id}
              href={`/lectures/${course._id}`}
              code={course.code}
              term={course.term}
              title={course.title}
              level={course.level.charAt(0).toUpperCase() + course.level.slice(1) + " Level"}
              lectureCount={course.stats.lectureCount}
              totalDuration={course.stats.totalDurationFormatted}
              progress={coursesProgress?.[course._id] || 0}
            />
          </motion.div>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
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
