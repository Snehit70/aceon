import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clerkId, videoId, courseId, lastPosition } = body;

    if (!clerkId || !videoId || !courseId || typeof lastPosition !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await convex.mutation(api.progress.savePositionBeacon, {
      clerkId,
      videoId: videoId as Id<"videos">,
      courseId: courseId as Id<"courses">,
      lastPosition,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save progress:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
