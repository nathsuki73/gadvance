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
  const { pathname, search } = request.nextUrl;
  const isHomeRoute = pathname === "/";
  const isOnboardingRoute = pathname === "/onboarding";
  const isWorkspaceRoute = pathname.startsWith("/workspace");

  // Public pages that don't require authentication
  const publicWorkspacePages = [
    "/workspace/courses",
    "/workspace/about",
    "/workspace/community",
    "/workspace/support",
  ];

  const isPublicPage = publicWorkspacePages.some(
    (page) => pathname === page || pathname.startsWith(page + "/"),
  );

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect authenticated users landing on "/" to "/workspace"
  if (token && isHomeRoute) {
    const workspaceUrl = request.nextUrl.clone();
    workspaceUrl.pathname = "/workspace";
    workspaceUrl.search = "";
    return NextResponse.redirect(workspaceUrl);
  }

  // Allow unauthenticated guests on "/"
  if (isHomeRoute) {
    return NextResponse.next();
  }

  // Require auth for protected workspace routes and onboarding
  if (!token && (isOnboardingRoute || (isWorkspaceRoute && !isPublicPage))) {
    const signInUrl = request.nextUrl.clone();
    
    // Ensure this matches your login page route
    signInUrl.pathname = "/auth/signin";

    // 🎯 PRESERVE FULL URL (Pathname + Query string ?code=...)
    const fullCallbackUrl = `${pathname}${search || ""}`;
    signInUrl.searchParams.set("callbackUrl", fullCallbackUrl || "/onboarding");

    return NextResponse.redirect(signInUrl);
  }

  if (isOnboardingRoute && isActiveStatus(token?.status)) {
    const workspaceUrl = request.nextUrl.clone();
    workspaceUrl.pathname = "/workspace";
    workspaceUrl.search = "";
    return NextResponse.redirect(workspaceUrl);
  }

  return NextResponse.next();
}

export { proxy as middleware };

export const config = {
  matcher: ["/", "/onboarding", "/workspace/:path*"],
};