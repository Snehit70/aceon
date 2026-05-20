"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ChainsawCard } from "@/components/shared/chainsaw-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function MobileLecturesPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "archives" ? "archives" : "enrolled";

  const courses = useQuery(api.courses.listWithStats);
  const profile = useQuery(api.users.getUser, user?.id ? { clerkId: user.id } : "skip");
  const coursesProgress = useQuery(
    api.progress.getAllCoursesProgress,
    user?.id ? { clerkId: user.id } : "skip",
  );

  const [searchQuery, setSearchQuery] = useState("");

  const enrolledIds = useMemo(() => profile?.enrolledCourseIds || [], [profile?.enrolledCourseIds]);

  const enrolledCourses = useMemo(
    () => (courses || []).filter((course) => enrolledIds.includes(course._id)),
    [courses, enrolledIds],
  );

  const archiveCourses = useMemo(() => {
    const all = (courses || []).filter((course) => !enrolledIds.includes(course._id));
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter((course) => course.title.toLowerCase().includes(q) || course.code.toLowerCase().includes(q));
  }, [courses, enrolledIds, searchQuery]);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-3 py-4 pb-24">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-black uppercase tracking-wide text-white">Missions</h1>
        <Link href="/lectures" className="text-xs font-mono uppercase tracking-widest text-primary">
          Desktop View
        </Link>
      </div>

      {tab === "archives" && (
        <div className="sticky top-14 z-20 mb-4 border border-white/15 bg-black/95 p-2 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH_ARCHIVES..."
              className="h-10 border-white/20 bg-black pl-9 font-mono text-xs uppercase tracking-wider"
            />
          </div>
        </div>
      )}

      {courses === undefined ? (
        <div className="py-16 text-center text-sm text-white/70">Loading missions...</div>
      ) : tab === "enrolled" ? (
        enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            {enrolledCourses.map((course) => (
              <div key={course._id} className="min-h-[212px]">
                <ChainsawCard
                  id={course._id}
                  href={`/m/course/${course._id}`}
                  code={course.code}
                  title={course.title}
                  level={course.level.charAt(0).toUpperCase() + course.level.slice(1) + " Level"}
                  lectureCount={course.stats.lectureCount}
                  totalDuration={course.stats.totalDurationFormatted}
                  progress={coursesProgress?.[course._id] || 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/20 p-6 text-center text-sm text-white/70">
            No enrolled courses. Open Archives and choose one.
          </div>
        )
      ) : (
        <div className="space-y-2.5">
          {archiveCourses.map((course) => (
            <Link
              key={course._id}
              href={`/m/course/${course._id}`}
              className={cn(
                "block border border-white/10 bg-white/5 p-3.5",
                "transition-colors hover:border-primary hover:bg-primary/10",
              )}
            >
              <div className="flex min-h-[64px] items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-base font-bold uppercase leading-tight text-white line-clamp-2">
                    {course.title}
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-white/60">{course.code}</p>
                </div>
                <span className="shrink-0 border border-primary/40 px-2 py-1 font-mono text-[10px] uppercase leading-none text-primary">
                  {course.level}
                </span>
              </div>
            </Link>
          ))}
          {archiveCourses.length === 0 && (
            <div className="py-10 text-center text-sm text-white/60">No courses match search.</div>
          )}
        </div>
      )}
    </div>
  );
}
