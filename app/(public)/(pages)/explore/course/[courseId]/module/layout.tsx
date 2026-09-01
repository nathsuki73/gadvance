// app/explore/course/[courseId]/module/layout.tsx (or your module route layout)
"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { forceSignOut } from "@/app/lib/api-client";

export default function ModuleProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const checkAuthAndExpiry = useCallback(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    if (status === "authenticated") {
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
      } else {
        isLaravelTokenExpired = true;
      }

      if (
        session?.error === "RefreshAccessTokenError" ||
        !session?.laravelJwt ||
        isLaravelTokenExpired
      ) {
        forceSignOut();
      }
    }
  }, [status, session, router]);

  // Check 1: On mount & status changes
  useEffect(() => {
    checkAuthAndExpiry();
  }, [checkAuthAndExpiry]);

  // Check 2: On user interaction & tab focus
  useEffect(() => {
    const handleUserActivity = () => {
      checkAuthAndExpiry();
    };

    window.addEventListener("focus", handleUserActivity);
    document.addEventListener("visibilitychange", handleUserActivity);
    document.addEventListener("click", handleUserActivity, { capture: true });
    document.addEventListener("keydown", handleUserActivity, { capture: true });

    return () => {
      window.removeEventListener("focus", handleUserActivity);
      document.removeEventListener("visibilitychange", handleUserActivity);
      document.removeEventListener("click", handleUserActivity, {
        capture: true,
      });
      document.removeEventListener("keydown", handleUserActivity, {
        capture: true,
      });
    };
  }, [checkAuthAndExpiry]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
