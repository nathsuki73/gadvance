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

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token && (isOnboardingRoute || isWorkspaceRoute)) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth/signin";
    signInUrl.searchParams.set("callbackUrl", pathname || "/onboarding");
    return NextResponse.redirect(signInUrl);
  }

  if (isOnboardingRoute && isActiveStatus(token?.status)) {
    const workspaceUrl = request.nextUrl.clone();
    workspaceUrl.pathname = "/workspace/module";
    workspaceUrl.search = "";
    return NextResponse.redirect(workspaceUrl);
  }

  if (isWorkspaceRoute && isOnboardingStatus(token?.status)) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    onboardingUrl.search = "";
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding", "/workspace/:path*"],
};
