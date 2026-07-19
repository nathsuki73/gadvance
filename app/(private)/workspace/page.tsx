"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { getUserProfile } from "./service";
import { UserProfile } from "./types";
import WorkspaceSkeleton from "./_components/WorkspaceSkeleton";

interface ActiveModule {
  id: string;
  title: string;
  description: string;
  progress: number;
  href: string;
}

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Start with null to prevent rendering half-baked session fallbacks
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Dynamic Metrics tracking states
  const [modulesInProgressCount, setModulesInProgressCount] =
    useState<number>(0);
  const [modulesCompletedCount, setModulesCompletedCount] = useState<number>(0);

  // Live module overview state
  const [activeModule, setActiveModule] = useState<ActiveModule | null>(null);

  useEffect(() => {
    // 1. Enforce Authentication Redirect
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }

    // 2. Only fetch once NextAuth has resolved the user session
    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadWorkspaceData() {
      const res = await getUserProfile();
      if (cancelled) return;

      if (res.success && res.data) {
        setProfile(res.data);

        // Sync dynamic analytics counters safely
        setModulesInProgressCount(res.data.in_progress_count ?? 0);
        setModulesCompletedCount(res.data.completed_count ?? 0);

        // Hydrate the active overview card using the latest live module payload
        if (res.data.active_module) {
          setActiveModule({
            id: res.data.active_module.id,
            title: res.data.active_module.title,
            description: res.data.active_module.description,
            progress: res.data.active_module.progress_percentage ?? 0,
            href: `/learn/${res.data.active_module.id}`,
          });
        } else {
          setActiveModule(null);
        }
      }
    }

    loadWorkspaceData();

    return () => {
      cancelled = true;
    };
  }, [status, router]);

  // Keep the user on the loading screen until NextAuth is ready AND our DB profile is loaded
  if (status === "loading" || (status === "authenticated" && !profile)) {
    return <WorkspaceSkeleton />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Derive first name purely from the freshly fetched profile, or fall back to NextAuth session
  const derivedFirstName =
    profile?.first_name || session?.user?.name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-x-hidden">
      <main className="relative z-10 mx-auto max-w-7xl px-8 py-16 lg:px-12 lg:py-24">
        {/* Full-width Responsive Header: Wraps beautifully on mobile, single line on desktop */}
        <header className="border-b border-zinc-200 pb-12 w-full">
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 sm:text-5xl lg:whitespace-nowrap leading-tight sm:leading-none">
            Welcome to GADvance,{" "}
            <span className="font-semibold italic font-serif text-primary inline-block">
              {derivedFirstName}.
            </span>
          </h1>
        </header>

        {/* Content Section: 2 Columns split where Analytics sits next to Recently Viewed */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Side: Recently Viewed (Takes 2 columns on wide screens) */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Recently Viewed
            </h2>

            {activeModule ? (
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50/30 p-8 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                <div className="space-y-4 w-full">
                  {/* Title */}
                  <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {activeModule.title}
                  </h3>

                  {/* Progress Track Section */}
                  <div className="py-1 max-w-md space-y-2">
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${activeModule.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center text-[11px] font-medium text-zinc-400">
                      <span>Course Progress:&nbsp;</span>
                      <span className="font-bold text-primary ">
                        {activeModule.progress}% Completed
                      </span>
                    </div>
                  </div>

                  {/* Description (Truncated cleanly at 3 lines) */}
                  <p className="text-xs text-zinc-400 font-light leading-relaxed pt-1 line-clamp-3">
                    {activeModule.description}
                  </p>
                </div>

                {/* Bottom Resume Trigger Row */}
                <div className="pt-6 mt-auto">
                  <button
                    onClick={() => router.push(activeModule.href)}
                    className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm shadow-violet-100"
                  >
                    <PlayCircle size={12} />
                    resume
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-zinc-200 p-8 text-center flex flex-col items-center justify-center min-h-[280px]">
                <p className="text-sm text-zinc-400 font-light">
                  No modules currently assigned to your account.
                </p>
              </div>
            )}
          </section>

          {/* Right Side: Analytics Grid Stacked Vertically */}
          <section className="lg:col-span-1 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Your Progress
            </h2>

            <div className="flex flex-col gap-4 w-full">
              {/* Stat Block 01: In Progress */}
              <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-5 transition-all duration-300 hover:border-zinc-300 flex flex-col justify-center min-h-[125px]">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
                  In Progress
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-light tracking-tight text-primary">
                    {modulesInProgressCount}
                  </span>
                  <span className="text-xs text-zinc-400 font-light lowercase">
                    {modulesInProgressCount === 1 ? "module" : "modules"}
                  </span>
                </div>
              </div>

              {/* Stat Block 02: Completed */}
              <div className="border border-zinc-200 bg-zinc-50/20 rounded-2xl p-5 transition-all duration-300 hover:border-zinc-300 flex flex-col justify-center min-h-[125px]">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
                  Completed
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-light tracking-tight text-primary">
                    {modulesCompletedCount}
                  </span>
                  <span className="text-xs text-zinc-400 font-light lowercase">
                    {modulesCompletedCount === 1 ? "module" : "modules"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-24 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] tracking-widest text-zinc-400 uppercase">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© 2026 protection active</span>
            <span className="hidden sm:inline text-zinc-200">|</span>
            <span className="text-zinc-300 font-medium">gadvance v3.0.4</span>
          </div>

          <div className="flex items-center gap-6 normal-case tracking-normal text-xs text-zinc-400">
            <a href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/support" className="hover:text-primary transition-colors">
              Help & Support
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
