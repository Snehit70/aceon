"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MobilePageHeader } from "@/components/mobile/mobile-page-header";

export default function MobileWeekPage() {
  const { user } = useUser();
  const params = useParams();
  const subjectId = params.subjectId as Id<"courses">;
  const weekId = params.weekId as Id<"weeks">;

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });
  const progressData = useQuery(
    api.progress.getCourseProgress,
    user?.id ? { clerkId: user.id, courseId: subjectId } : "skip",
  );

  if (course === undefined || content === undefined) {
    return <div className="p-4 text-sm text-white/70">Loading week...</div>;
  }

  const week = content.find((item) => item._id === weekId);
  if (!course || !week) {
    return <div className="p-4 text-sm text-white/70">Week not found.</div>;
  }

  return (
    <div className="px-3 py-4 pb-24">
      <MobilePageHeader
        backHref={`/m/course/${subjectId}`}
        backLabel="Back to course"
        title={week.title}
        subtitle={course.code}
      />

      <div className="space-y-2.5">
        {week.videos.map((video) => {
          const done = progressData?.find((p) => p.videoId === video._id)?.completed;
          return (
            <Link
              key={video._id}
              href={`/m/course/${subjectId}/lecture/${video._id}`}
              className="block border border-white/10 bg-black/60 p-3.5 hover:border-primary"
            >
              <p className="font-display text-lg font-bold uppercase leading-tight line-clamp-2">{video.title}</p>
              <div className="mt-2 flex items-center justify-between font-mono text-xs uppercase tracking-wider text-white/60">
                <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}</span>
                <span className={done ? "text-green-400" : "text-white/60"}>{done ? "Done" : "Pending"}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
