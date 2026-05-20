import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/lectures(.*)",
  "/m(.*)",
]);

const MOBILE_UA = /Mobi|Android|iPhone|iPad|iPod|Mobile|BlackBerry|webOS/i;

function mobileRedirect(req: NextRequest): NextResponse | null {
  const ua = req.headers.get("user-agent") || "";
  if (!MOBILE_UA.test(ua)) return null;

  const { pathname, search, searchParams } = req.nextUrl;

  // /lectures (?tab=enrolled|library) → /m/lectures?tab=enrolled|archives
  if (pathname === "/lectures") {
    const tab = searchParams.get("tab");
    const mobileTab = tab === "library" ? "archives" : "enrolled";
    return NextResponse.redirect(new URL(`/m/lectures?tab=${mobileTab}`, req.url));
  }

  // /lectures/[subjectId]?video=xxx → /m/course/[subjectId]/lecture/xxx
  // /lectures/[subjectId]              → /m/course/[subjectId]
  const subjectMatch = pathname.match(/^\/lectures\/([^/]+)\/?$/);
  if (subjectMatch) {
    const subjectId = subjectMatch[1];
    const video = searchParams.get("video");
    const target = video
      ? `/m/course/${subjectId}/lecture/${video}`
      : `/m/course/${subjectId}`;
    return NextResponse.redirect(new URL(target + (video ? "" : search), req.url));
  }

  return null;
}

export default clerkMiddleware(async (auth, req) => {
  const redirect = mobileRedirect(req);
  if (redirect) return redirect;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
