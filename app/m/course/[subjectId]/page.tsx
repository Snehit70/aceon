"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
    <div className="px-3 py-4">
      <Link href="/m/lectures?tab=enrolled" className="font-mono text-xs uppercase tracking-wider text-primary">
        Back
      </Link>

      <div className="mt-3 border border-white/10 bg-white/5 p-3">
        <p className="font-mono text-xs uppercase tracking-wider text-white/60">{course.code}</p>
        <h1 className="mt-1 font-display text-2xl font-black uppercase leading-tight">{course.title}</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-white/70">
          {completed} / {totalVideos} complete ({percent}%)
        </p>
      </div>

      <div className="mt-4 space-y-2">
        {content.map((week) => {
          const weekTotal = week.videos.length;
          const weekDone = week.videos.filter((v) => progressData?.find((p) => p.videoId === v._id)?.completed).length;

          return (
            <Link
              key={week._id}
              href={`/m/course/${subjectId}/week/${week._id}`}
              className="block border border-white/10 bg-black/60 p-3 hover:border-primary"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-bold uppercase">{week.title}</p>
                <span className="font-mono text-xs uppercase tracking-wide text-white/60">
                  {weekDone}/{weekTotal}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
