"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Play, Clock, ArrowRight, BookOpen, Settings2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  const profile = useQuery(api.users.getUser, user?.id ? { clerkId: user.id } : "skip");
  
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
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "not-completed">("all");
  const [showProfileSheet, setShowProfileSheet] = useState(false);

  const enrolledCourseIds = useMemo(() => profile?.enrolledCourseIds || [], [profile]);
  
  const { enrolledCourses, otherCourses } = useMemo(() => {
    if (!courses) return { enrolledCourses: [], otherCourses: [] };
    const enrolled = courses.filter(c => enrolledCourseIds.includes(c._id));
    const other = courses.filter(c => !enrolledCourseIds.includes(c._id));
    return { enrolledCourses: enrolled, otherCourses: other };
  }, [courses, enrolledCourseIds]);

  const getLevelOrder = (lvl: string) => {
    if (lvl === "foundation") return 1;
    if (lvl === "diploma") return 2;
    if (lvl === "degree") return 3;
    return 0;
  };

  const userLevelOrder = profile?.level ? getLevelOrder(profile.level) : 0;

  const filteredLibraryCourses = useMemo(() => {
    return otherCourses
      .filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === "all" || course.level === levelFilter;
        
        const courseLevel = getLevelOrder(course.level);
        const isPrior = userLevelOrder > courseLevel;
        const progress = isPrior ? 100 : (coursesProgress?.[course._id] || 0);
        const isCompleted = progress === 100;
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "completed" && isCompleted) ||
          (statusFilter === "not-completed" && !isCompleted);
        
        return matchesSearch && matchesLevel && matchesStatus;
      })
      .sort((a, b) => {
        const levelA = getLevelOrder(a.level);
        const levelB = getLevelOrder(b.level);
        const isPriorA = userLevelOrder > levelA;
        const isPriorB = userLevelOrder > levelB;
        const progressA = isPriorA ? 100 : (coursesProgress?.[a._id] || 0);
        const progressB = isPriorB ? 100 : (coursesProgress?.[b._id] || 0);
        return progressA - progressB;
      });
  }, [otherCourses, searchQuery, levelFilter, statusFilter, coursesProgress, userLevelOrder]);

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
      <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/character-aki-kon.jpg')] bg-cover bg-center opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black pointer-events-none" aria-hidden="true" />
          <div className="space-y-8 container mx-auto max-w-7xl relative z-10">
            <div className="space-y-4">
              <Skeleton className="h-20 w-96 bg-neutral-900" />
              <Skeleton className="h-6 w-[500px] bg-neutral-900" />
            </div>
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-[300px] border-4 border-neutral-800 bg-neutral-900/50" />
              ))}
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#E62E2D] selection:text-white overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[url('/images/halftone.svg')] opacity-5 pointer-events-none mix-blend-screen z-0" />
      <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            #ffffff 4px,
            #ffffff 5px
          )`
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 max-w-7xl space-y-16 relative z-10 animate-in fade-in duration-500">
        
        <ProfileSheet 
          open={showProfileSheet} 
          onOpenChange={setShowProfileSheet} 
          forceOpen={!!(user && profile === null)} 
        />

        {/* Header */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-neutral-400 hover:text-[#E62E2D] hover:bg-transparent transition-colors uppercase font-bold tracking-widest"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to HQ
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-white uppercase font-display drop-shadow-[4px_4px_0_#E62E2D] -rotate-1 skew-x-[-5deg] leading-none">
                Active <span className="text-white bg-[#E62E2D] px-2 transform skew-x-[10deg] inline-block border-2 border-black">Missions</span>
              </h1>
              <div className="bg-white/10 backdrop-blur-sm border-l-4 border-[#E62E2D] p-4 transform rotate-1">
                <p className="text-base sm:text-lg text-neutral-200 font-mono uppercase tracking-widest">
                  {profile?.level ? (
                    <span className="flex items-center gap-2">
                      <span className="text-[#E62E2D]">///</span> 
                      {profile.level} Threat Level 
                      <span className="text-[#E62E2D]">///</span>
                      Status: Active Duty
                    </span>
                  ) : (
                    "Resume patrol or accept a new contract."
                  )}
                </p>
              </div>
            </div>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => setShowProfileSheet(true)} 
                className="gap-2 border-4 border-white bg-black text-white hover:bg-[#E62E2D] hover:text-white hover:border-[#E62E2D] shadow-[4px_4px_0px_0px_#333] hover:shadow-[6px_6px_0px_0px_#E62E2D] hover:-translate-y-1 transition-all rounded-none font-bold uppercase tracking-widest h-12 px-6"
              >
                <Settings2 className="h-4 w-4" />
                Customize Profile
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Layout */}
        <Tabs defaultValue="enrolled" className="space-y-12">
          <TabsList className="bg-transparent border-b-4 border-neutral-800 p-0 w-full justify-start rounded-none h-auto gap-8">
            <TabsTrigger 
              value="enrolled" 
              className="group gap-2 font-display font-black uppercase tracking-widest text-2xl data-[state=active]:bg-transparent data-[state=active]:text-[#E62E2D] data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-[#E62E2D] rounded-none px-0 py-4 transition-all hover:text-white text-neutral-500 -mb-[4px]"
            >
              Enrolled_Missions
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="gap-2 font-display font-black uppercase tracking-widest text-2xl data-[state=active]:bg-transparent data-[state=active]:text-[#E62E2D] data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-[#E62E2D] rounded-none px-0 py-4 transition-all hover:text-white text-neutral-500 -mb-[4px]"
            >
              Mission_Archives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="space-y-16 focus-visible:outline-none focus-visible:ring-0">
            {/* Enrolled Courses Section */}
            {user && enrolledCourses.length > 0 ? (
              <section className="space-y-6">
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              <div className="relative flex flex-col items-center justify-center py-24 text-center border-4 border-dashed border-neutral-800 bg-neutral-900/20 clip-corner overflow-hidden">
                 <div className="absolute inset-0 bg-[url('/images/character-angel-devil.jpg')] bg-cover bg-center opacity-40 pointer-events-none" aria-hidden="true" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" aria-hidden="true" />
                 <BookOpen className="h-16 w-16 text-neutral-700 mb-6 relative z-10" />
                 <h3 className="text-3xl font-display font-black uppercase text-white mb-2 relative z-10">No Enrolled Courses</h3>
                 <p className="text-neutral-400 font-mono uppercase tracking-wide max-w-sm relative z-10">
                   You haven&apos;t enrolled in any courses yet. Visit the Archives to get started.
                 </p>
              </div>
            )}

            {/* Continue Watching - Horizontal Scroll */}
            {user && continueWatching && continueWatching.length > 0 && (
              <motion.div 
                className="space-y-6 pt-12 border-t-4 border-neutral-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3 font-display uppercase drop-shadow-[2px_2px_0_#E62E2D] -rotate-1">
                    <Play className="h-6 w-6 fill-current text-[#E62E2D]" /> Resume Patrol
                  </h2>
                </div>
                
                <div className="relative -mx-4 px-4 overflow-hidden">
                  <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                            className="flex-none w-[320px] snap-start group relative block"
                          >
                            <div className="border-4 border-white bg-black hover:border-[#E62E2D] transition-colors duration-200 shadow-[8px_8px_0px_0px_#333] hover:shadow-[12px_12px_0px_0px_#E62E2D] hover:-translate-y-2 clip-corner overflow-hidden">
                              {/* Thumbnail Area */}
                              <div className="relative h-44 bg-neutral-900 overflow-hidden border-b-4 border-white group-hover:border-[#E62E2D] transition-colors">
                                {item.video.youtubeId ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img 
                                    src={`https://img.youtube.com/vi/${item.video.youtubeId}/mqdefault.jpg`} 
                                    alt={item.video.title}
                                    className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                                     <Play className="h-12 w-12 text-neutral-700" />
                                  </div>
                                )}
                                
                                {/* Play Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                                   <div className="bg-[#E62E2D] text-white p-3 border-2 border-black shadow-[4px_4px_0_0_black] transform rotate-3">
                                      <Play className="h-6 w-6 fill-current" />
                                   </div>
                                </div>
                                
                                {/* Progress Bar at bottom of image */}
                                <div className="absolute bottom-0 left-0 right-0 h-2 bg-black">
                                  <div 
                                    className="h-full bg-[#E62E2D]" 
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>

                              <div className="p-4 space-y-3 bg-black">
                                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                                  <span className="bg-white text-black px-2 py-0.5 font-bold transform -skew-x-12">
                                    {item.course.code}
                                  </span>
                                  <span className="flex items-center gap-1 text-[#E62E2D]">
                                      <Clock className="w-3 h-3" /> {remainingMins}m
                                  </span>
                                </div>
                                
                                <h3 className="font-display font-bold text-lg leading-tight line-clamp-2 text-white group-hover:text-[#E62E2D] transition-colors">
                                  {item.video.title}
                                </h3>
                                
                                 <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-widest text-[#E62E2D] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                   Resume_Mission <ArrowRight className="ml-1 h-3 w-3" />
                                 </div>
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

          <TabsContent value="library" className="space-y-8 focus-visible:outline-none focus-visible:ring-0">
            {/* Course Library Section */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-[#E62E2D] transition-colors" />
                    <Input
                      placeholder="SEARCH_ARCHIVES..."
                      className="pl-12 h-14 bg-black border-4 border-white rounded-none text-lg font-mono placeholder:text-neutral-600 focus-visible:ring-0 focus-visible:border-[#E62E2D] uppercase tracking-wider text-white transition-colors shadow-[4px_4px_0_0_#333]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar items-center">
                    <Button
                      variant="ghost"
                      onClick={() => { setLevelFilter("all"); setStatusFilter("all"); }}
                      className={cn(
                        "capitalize whitespace-nowrap rounded-none border-2 px-4 h-10 font-bold tracking-wider transition-all",
                        levelFilter === "all" && statusFilter === "all"
                          ? "bg-[#E62E2D] border-[#E62E2D] text-white shadow-[4px_4px_0_0_black]" 
                          : "bg-black border-white text-white hover:bg-white hover:text-black hover:border-white"
                      )}
                    >
                      All
                    </Button>
                    <div className="w-px h-6 bg-neutral-700" />
                    {(["foundation", "diploma", "degree"] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant="ghost"
                        onClick={() => setLevelFilter(levelFilter === filter ? "all" : filter)}
                        className={cn(
                          "capitalize whitespace-nowrap rounded-none border-2 px-4 h-10 font-bold tracking-wider transition-all",
                          levelFilter === filter 
                            ? "bg-[#E62E2D] border-[#E62E2D] text-white shadow-[4px_4px_0_0_black]" 
                            : "bg-black border-white text-white hover:bg-white hover:text-black hover:border-white"
                        )}
                      >
                        {filter}
                      </Button>
                    ))}
                    <div className="w-px h-6 bg-neutral-700" />
                    {(["completed", "not-completed"] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant="ghost"
                        onClick={() => setStatusFilter(statusFilter === filter ? "all" : filter)}
                        className={cn(
                          "capitalize whitespace-nowrap rounded-none border-2 px-4 h-10 font-bold tracking-wider transition-all",
                          statusFilter === filter 
                            ? "bg-[#E62E2D] border-[#E62E2D] text-white shadow-[4px_4px_0_0_black]" 
                            : "bg-black border-white text-white hover:bg-white hover:text-black hover:border-white"
                        )}
                      >
                        {filter === "not-completed" ? "In Progress" : filter}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      title={course.title}
                      level={course.level.charAt(0).toUpperCase() + course.level.slice(1) + " Level"}
                      lectureCount={course.stats.lectureCount}
                      totalDuration={course.stats.totalDurationFormatted}
                      progress={isPriorLevel ? 100 : (coursesProgress?.[course._id] || 0)}
                      className={cn(
                        "hover:opacity-100 transition-opacity",
                        isPriorLevel ? "opacity-60 grayscale" : "opacity-100"
                      )}
                    />
                  </motion.div>
                )})}

                {filteredLibraryCourses.length === 0 && (
                  <div className="col-span-full relative flex flex-col items-center justify-center py-24 text-center border-4 border-dashed border-neutral-800 bg-neutral-900/20 clip-corner overflow-hidden">
<div className="absolute inset-0 bg-[url('/images/character-angel-devil.jpg')] bg-cover bg-center opacity-40 pointer-events-none" aria-hidden="true" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" aria-hidden="true" />
                    <Search className="h-16 w-16 text-neutral-700 mb-6 relative z-10" />
                    <h3 className="text-3xl font-display font-black uppercase text-white mb-2 relative z-10">No Archives Found</h3>
                    <p className="text-neutral-400 font-mono uppercase tracking-wide max-w-sm relative z-10">
                      Try adjusting your search or filters.
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => { setSearchQuery(""); setLevelFilter("all"); }} 
                      className="mt-6 text-[#E62E2D] font-bold text-lg uppercase tracking-widest hover:text-white relative z-10"
                    >
                        Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
