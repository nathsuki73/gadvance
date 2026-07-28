// app/onboarding/layout.tsx
"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";
import { forceSignOut } from "@/app/lib/api-client";

const STEP_CONTENT: Record<
  string,
  { title: React.ReactNode; description: string }
> = {
  "/onboarding": {
    title: (
      <>
        Tell us about <br />
        <span className="font-semibold italic font-serif">who you are.</span>
      </>
    ),
    description:
      "Your identity is the foundation of your journey here. We use this to personalize your curriculum and verify your certifications.",
  },
  "/onboarding/contact-location": {
    title: (
      <>
        Connecting you to <br />
        <span className="font-semibold italic font-serif">the network.</span>
      </>
    ),
    description:
      "Providing your location helps us connect you with local partners and nearby community events in your region.",
  },
  "/onboarding/summary": {
    title: (
      <>
        Ready to <br />
        <span className="font-semibold italic font-serif">get started?</span>
      </>
    ),
    description:
      "Once you finish, you will have full access to our workspace and learning modules.",
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const normalizedStatus = session?.user?.status?.trim().toLowerCase();

  const checkAuthAndTokenExpiry = useCallback(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      // 1. If user is already active, bounce to workspace
      if (normalizedStatus === "active") {
        router.replace("/workspace");
        return;
      }

      // 2. Decode & check JWT expiration directly inside handler
      let expired = false;
      if (session?.laravelJwt) {
        try {
          const payload = JSON.parse(atob(session.laravelJwt.split(".")[1]));
          if (payload.exp && payload.exp * 1000 <= Date.now()) {
            expired = true;
          }
        } catch {
          expired = true;
        }
      } else {
        expired = true;
      }

      if (
        session?.error === "RefreshAccessTokenError" ||
        !session?.laravelJwt ||
        expired
      ) {
        forceSignOut();
      }
    }
  }, [status, session, normalizedStatus, router]);

  // Check 1: On mount & step transition
  useEffect(() => {
    checkAuthAndTokenExpiry();
  }, [pathname, checkAuthAndTokenExpiry]);

  // Check 2: On user interactions (click, keydown) & tab focus
  useEffect(() => {
    const handleUserActivity = () => {
      checkAuthAndTokenExpiry();
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
  }, [checkAuthAndTokenExpiry]);

  // Pure validation check for initial render shield
  const isInvalid =
    status === "loading" ||
    status === "unauthenticated" ||
    normalizedStatus === "active" ||
    session?.error === "RefreshAccessTokenError" ||
    !session?.laravelJwt;

  if (isInvalid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
            verifying session...
          </p>
        </div>
      </div>
    );
  }

  const currentStepInfo = STEP_CONTENT[pathname] || STEP_CONTENT["/onboarding"];

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Left Side: Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <Image
              src={logoIcon.src}
              alt="GADvance Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">{children}</div>
      </div>

      {/* Right Side: Decorative Branding Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{ clipPath: "ellipse(100% 100% at 100% 50%)" }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            {currentStepInfo.title}
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            {currentStepInfo.description}
          </p>
        </div>

        <div className="absolute bottom-12 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
