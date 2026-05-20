"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Check, Play } from "lucide-react";
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
    <div className="px-4 py-5 pb-28">
      <MobilePageHeader
        backHref={`/m/course/${subjectId}`}
        backLabel="← Course"
        title={week.title}
        subtitle={course.code}
      />

      <ul className="space-y-2.5">
        {week.videos.map((video, idx) => {
          const done = progressData?.find((p) => p.videoId === video._id)?.completed;
          const mins = Math.floor(video.duration / 60);
          const secs = (video.duration % 60).toString().padStart(2, "0");
          return (
            <li key={video._id}>
              <Link
                href={`/m/course/${subjectId}/lecture/${video._id}`}
                className="group flex items-center gap-3 border border-white/10 bg-black/40 p-3.5 transition-colors active:bg-primary/10"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center border ${done ? "border-green-500/50 bg-green-500/10 text-green-400" : "border-white/15 bg-white/[0.04] text-white/70"}`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Play className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-display text-[0.95rem] font-bold uppercase leading-tight text-white">
                    <span className="text-white/40">{String(idx + 1).padStart(2, "0")}.</span> {video.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
                    {mins}:{secs} · {done ? "Done" : "Pending"}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
