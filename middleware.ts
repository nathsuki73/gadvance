import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function isActiveStatus(value: unknown) {
  return typeof value === "string" && value.trim().toLowerCase() === "active";
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth/signin";
    signInUrl.searchParams.set("callbackUrl", "/onboarding");
    return NextResponse.redirect(signInUrl);
  }

  if (isActiveStatus(token.status)) {
    const workspaceUrl = request.nextUrl.clone();
    workspaceUrl.pathname = "/workspace/module";
    workspaceUrl.search = "";
    return NextResponse.redirect(workspaceUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding"],
};
