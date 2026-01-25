"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Play, Clock, ArrowRight, BookOpen, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChainsawCard } from "@/components/shared/chainsaw-card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfileSheet = dynamic(
  () => import("@/components/profile/profile-sheet").then((mod) => mod.ProfileSheet),
  { ssr: false }
);

export default function LecturesPage() {
  const { user } = useUser();
  const courses = useQuery(api.courses.listWithStats);
  const profile = useQuery(api.studentProfile.getProfile, user?.id ? { clerkId: user.id } : "skip");
  
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
  const [showProfileSheet, setShowProfileSheet] = useState(false);

  // Split courses into Enrolled and Others
  const enrolledCourseIds = useMemo(() => profile?.enrolledCourseIds || [], [profile]);
  
  const { enrolledCourses, otherCourses } = useMemo(() => {
    if (!courses) return { enrolledCourses: [], otherCourses: [] };
    const enrolled = courses.filter(c => enrolledCourseIds.includes(c._id));
    const other = courses.filter(c => !enrolledCourseIds.includes(c._id));
    return { enrolledCourses: enrolled, otherCourses: other };
  }, [courses, enrolledCourseIds]);

  // Filter function for "Other Courses" (Course Library)
  const filteredLibraryCourses = useMemo(() => {
    return otherCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [otherCourses, searchQuery, levelFilter]);

  // Force open profile sheet if no profile exists
  // Force open profile sheet if no profile exists
  useEffect(() => {
    if (user && profile === null) {
      const timer = setTimeout(() => {
        setShowProfileSheet(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, profile]);






  if (courses === undefined) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <Skeleton className="h-10 w-full md:w-96" />
            <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="h-[260px] border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between border-t border-border/50">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="h-9 border-t border-border/50 flex items-center justify-center">
                    <Skeleton className="h-4 w-28" />
                  </div>
                </motion.div>
            ))}
          </div>
      </div>
    );
  }

  const getLevelOrder = (lvl: string) => {
    if (lvl === "foundation") return 1;
    if (lvl === "diploma") return 2;
    if (lvl === "degree") return 3;
    return 0;
  };

  const userLevelOrder = profile?.level ? getLevelOrder(profile.level) : 0;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl space-y-10 animate-in fade-in duration-500">
      
      <ProfileSheet 
        open={showProfileSheet} 
        onOpenChange={setShowProfileSheet} 
        forceOpen={!!(user && profile === null)} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white uppercase font-display drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
            Active <span className="text-accent">Missions</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl font-mono uppercase tracking-widest border-l-4 border-accent pl-4 mt-4">
            {profile?.level ? (
              <span className="flex items-center gap-2">
                <span className="text-accent">///</span> 
                {profile.level} Threat Level 
                <span className="text-accent">///</span>
                Status: Active Duty
              </span>
            ) : (
              "Resume patrol or accept a new contract."
            )}
          </p>
        </div>
        {user && (
          <Button variant="outline" onClick={() => setShowProfileSheet(true)} className="gap-2">
            <Settings2 className="h-4 w-4" />
            Customize Profile
          </Button>
        )}
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="enrolled" className="space-y-8">
        <TabsList className="bg-transparent border-b-2 border-border p-0 w-full justify-start rounded-none h-auto gap-8">
          <TabsTrigger 
            value="enrolled" 
            className="gap-2 font-display uppercase tracking-widest text-xl data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-accent rounded-none px-0 py-4 transition-all hover:text-white"
          >
            <BookOpen className="h-5 w-5" />
            Assigned_Missions
          </TabsTrigger>
          <TabsTrigger 
            value="library" 
            className="gap-2 font-display uppercase tracking-widest text-xl data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-primary rounded-none px-0 py-4 transition-all hover:text-white"
          >
            <Search className="h-5 w-5" />
            Mission_Archives
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-10 focus-visible:outline-none focus-visible:ring-0">
          {/* Enrolled Courses Section */}
          {user && enrolledCourses.length > 0 ? (
            <section className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ChainsawCard
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
              </div>
            </section>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 bg-muted/5 rounded-lg">
               <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
               <h3 className="text-xl font-bold">No Enrolled Courses</h3>
               <p className="text-muted-foreground mt-2 max-w-sm">
                 You haven&apos;t enrolled in any courses yet. Visit the Course Library to get started.
               </p>
            </div>
          )}

          {/* Continue Watching - Horizontal Scroll */}
          {user && continueWatching && continueWatching.length > 0 && (
            <motion.div 
              className="space-y-4 pt-4 border-t border-border/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2 font-display uppercase">
                  <Play className="h-5 w-5 fill-current text-primary" /> Resume Patrol
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
                          className="flex-none w-[280px] snap-start group relative overflow-hidden border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
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
                             <div className="bg-primary/90 text-primary-foreground p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
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
                            <Badge variant="secondary" className="font-mono text-[10px] uppercase h-5 px-1.5">
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
        </TabsContent>

        <TabsContent value="library" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          {/* Course Library Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-9 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {(["all", "foundation", "diploma", "degree"] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={levelFilter === filter ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setLevelFilter(filter)}
                      className="capitalize whitespace-nowrap"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLibraryCourses.map((course, index) => {
                const courseLevelOrder = getLevelOrder(course.level);
                const isPriorLevel = userLevelOrder > courseLevelOrder;
                
                return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ChainsawCard
                    id={course._id}
                    href={`/lectures/${course._id}`}
                    code={course.code}
                    term={course.term}
                    title={course.title}
                    level={course.level.charAt(0).toUpperCase() + course.level.slice(1) + " Level"}
                    lectureCount={course.stats.lectureCount}
                    totalDuration={course.stats.totalDurationFormatted}
                    progress={isPriorLevel ? 100 : (coursesProgress?.[course._id] || 0)}
                    className={cn(
                      "hover:opacity-100 transition-opacity",
                      isPriorLevel ? "opacity-60 grayscale-[0.5]" : "opacity-80"
                    )}
                  />
                </motion.div>
              )})}

              {filteredLibraryCourses.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 bg-muted/5 rounded-lg">
                  <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold">No Courses Found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your search or filters.
                  </p>
                  <Button variant="link" onClick={() => { setSearchQuery(""); setLevelFilter("all"); }} className="mt-4 text-primary">
                      Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
