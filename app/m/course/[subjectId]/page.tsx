"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MobilePageHeader } from "@/components/mobile/mobile-page-header";

export default function MobileCoursePage() {
  const { user } = useUser();
  const params = useParams();
  const subjectId = params.subjectId as Id<"courses">;

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });
  const progressData = useQuery(
    api.progress.getCourseProgress,
    user?.id ? { clerkId: user.id, courseId: subjectId } : "skip",
  );

  if (course === undefined || content === undefined) {
    return <div className="p-4 text-sm text-white/70">Loading course...</div>;
  }

  if (!course) {
    return <div className="p-4 text-sm text-white/70">Course not found.</div>;
  }

  const totalVideos = content.reduce((acc, week) => acc + week.videos.length, 0);
  const completed = progressData?.filter((p) => p.completed).length || 0;
  const percent = totalVideos > 0 ? Math.round((completed / totalVideos) * 100) : 0;

  return (
    <div className="px-4 py-5 pb-28">
      <MobilePageHeader
        backHref="/m/lectures?tab=enrolled"
        backLabel="← Missions"
        title={course.title}
        subtitle={course.code}
      />

      <div className="mb-5 border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
          <span className="text-white/55">Progress</span>
          <span className="text-primary">{percent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden bg-white/8">
          <div
            className={`h-full ${percent >= 100 ? "bg-green-500" : "bg-primary"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/45">
          {completed} of {totalVideos} lectures complete
        </p>
      </div>

      <ul className="space-y-2.5">
        {content.map((week, idx) => {
          const weekTotal = week.videos.length;
          const weekDone = week.videos.filter((v) => progressData?.find((p) => p.videoId === v._id)?.completed).length;
          const done = weekTotal > 0 && weekDone === weekTotal;

          return (
            <li key={week._id}>
              <Link
                href={`/m/course/${subjectId}/week/${week._id}`}
                className="group flex items-center gap-3 border border-white/10 bg-black/40 p-4 transition-colors active:bg-primary/10"
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary/70">
                  W{String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-display text-[0.95rem] font-bold uppercase leading-tight text-white">
                    {week.title}
                  </p>
                  <p className={`mt-1 font-mono text-[10px] uppercase tracking-wider ${done ? "text-green-400" : "text-white/55"}`}>
                    {weekDone}/{weekTotal} {done ? "done" : "lectures"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/30 group-hover:text-primary" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
