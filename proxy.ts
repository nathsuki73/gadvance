import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function isActiveStatus(value: unknown) {
  return typeof value === "string" && value.trim().toLowerCase() === "active";
}

function isOnboardingStatus(value: unknown) {
  return (
    typeof value === "string" && value.trim().toLowerCase() === "onboarding"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOnboardingRoute = pathname === "/onboarding";
  const isWorkspaceRoute = pathname.startsWith("/workspace");

  // Public pages that don't require authentication
  const publicWorkspacePages = [
    "/workspace/courses",
    "/workspace/about",
    "/workspace/community",
    "/workspace/support",
  ];

  // Check if the route is a public workspace page or a subpage of a public page
  const isPublicPage = publicWorkspacePages.some(
    (page) => pathname === page || pathname.startsWith(page + "/"),
  );

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Only require auth for protected workspace routes and onboarding
  if (!token && (isOnboardingRoute || (isWorkspaceRoute && !isPublicPage))) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth/signin";
    signInUrl.searchParams.set("callbackUrl", pathname || "/onboarding");
    return NextResponse.redirect(signInUrl);
  }

  if (isOnboardingRoute && isActiveStatus(token?.status)) {
    const workspaceUrl = request.nextUrl.clone();
    workspaceUrl.pathname = "/workspace";
    workspaceUrl.search = "";
    return NextResponse.redirect(workspaceUrl);
  }

  // if (isWorkspaceRoute && !isPublicPage && isOnboardingStatus(token?.status)) {
  //   const onboardingUrl = request.nextUrl.clone();
  //   onboardingUrl.pathname = "/onboarding";
  //   onboardingUrl.search = "";
  //   return NextResponse.redirect(onboardingUrl);
  // }

  let resolvedStatus = token?.status;

  if (isWorkspaceRoute && !isPublicPage && isOnboardingStatus(resolvedStatus) && token?.laravelJwt) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
        const res = await fetch(`${apiBaseUrl}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token.laravelJwt}`,
          },
        });

        if (res.ok) {
          const payload = await res.json();
          const dbData = payload?.data ?? payload;
          const dbStatus = dbData?.status?.trim().toLowerCase();

          if (dbStatus === "active") {
            resolvedStatus = "active"; // Override the stale token status dynamically!
          }
        }
      } catch (err) {
        console.error("Middleware live status check fallback failed:", err);
      }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding", "/workspace/:path*"],
};
