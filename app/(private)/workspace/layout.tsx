// app/(workspace)/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthHeader from "./_components/header/AuthHeader";
import Footer from "@/app/components/Footer";
import { ToastProvider } from "@/app/components/context/ToastContext";
import { forceSignOut } from "@/app/lib/api-client";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const normalizedStatus = session?.user?.status?.trim().toLowerCase();

  useEffect(() => {
    const checkAuthAndTokenExpiry = () => {
      // 1. Unauthenticated users -> redirect to signin
      if (status === "unauthenticated") {
        router.replace("/auth/signin");
        return;
      }

      if (status === "authenticated") {
        // 2. ABSOLUTE ONBOARDING GUARD: If status is onboarding, block workspace access
        if (normalizedStatus === "onboarding") {
          router.replace("/onboarding");
          return;
        }

        // 3. Read the actual exp claim directly from the Laravel JWT
        let isLaravelTokenExpired = false;
        if (session?.laravelJwt) {
          try {
            const payload = JSON.parse(atob(session.laravelJwt.split(".")[1]));
            if (payload.exp && payload.exp * 1000 <= Date.now()) {
              isLaravelTokenExpired = true;
            }
          } catch {
            isLaravelTokenExpired = true;
          }
        }

        if (
          session?.error === "RefreshAccessTokenError" ||
          !session?.laravelJwt ||
          isLaravelTokenExpired
        ) {
          forceSignOut();
        }
      }
    };

    // Run immediately on mount
    checkAuthAndTokenExpiry();

    // Run whenever user switches back onto this browser tab
    const onFocus = () => {
      if (document.visibilityState === "visible") {
        checkAuthAndTokenExpiry();
      }
    };

    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [status, session, normalizedStatus, router]);

  // Block rendering workspace layout if unauthenticated, onboarding, or session invalid
  const isInvalid =
    status === "unauthenticated" ||
    normalizedStatus === "onboarding" ||
    (status === "authenticated" &&
      (session?.error === "RefreshAccessTokenError" || !session?.laravelJwt));

  if (isInvalid) return null;

  return (
    <ToastProvider>
      {status === "loading" ? (
        <div className="h-16 w-full bg-white border-b border-zinc-200 flex items-center justify-between px-8 lg:px-12 animate-pulse">
          <div className="h-6 w-24 bg-zinc-200 rounded" />
          <div className="flex items-center gap-6">
            <div className="hidden sm:block h-4 w-16 bg-zinc-200 rounded" />
            <div className="h-8 w-8 rounded-full bg-zinc-200" />
          </div>
        </div>
      ) : (
        <AuthHeader />
      )}

      {children}
      <Footer />
    </ToastProvider>
  );
}
