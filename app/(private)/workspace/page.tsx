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
        {/* Top Split Row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-zinc-200 pb-12">
          <header className="max-w-2xl">
            <h1 className="text-4xl font-light tracking-tight text-zinc-900 sm:text-5xl leading-tight">
              Welcome to GADvance,{" "}
              <span className="font-semibold italic font-serif text-primary">
                {derivedFirstName}.
              </span>
            </h1>
          </header>

          {/* Analytics Grid Panels */}
          <section className="w-full sm:w-auto shrink-0 lg:ml-auto">
            <div className="flex gap-3 w-full sm:w-64 max-w-70">
              {/* Stat Block 01: In Progress */}
              <div className="flex-1 border border-zinc-200 bg-zinc-50/20 rounded-xl p-3.5 transition-all duration-300 hover:border-zinc-200">
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
                  In Progress
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light tracking-tight text-primary">
                    {modulesInProgressCount}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-light lowercase">
                    {modulesInProgressCount === 1 ? "module" : "modules"}
                  </span>
                </div>
              </div>

              {/* Stat Block 02: Completed */}
              <div className="flex-1 border border-zinc-200 bg-zinc-50/20 rounded-xl p-3.5 transition-all duration-300 hover:border-zinc-200">
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
                  completed
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light tracking-tight text-primary">
                    {modulesCompletedCount}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-light lowercase">
                    {modulesCompletedCount === 1 ? "module" : "modules"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Columns */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Active Overview Container */}
          <section className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              active overview
            </h2>

            {activeModule ? (
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50/30 p-8 relative overflow-hidden flex flex-col justify-between min-h-70">
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

                  {/* Description */}
                  <p className="text-sm text-zinc-400 font-light leading-relaxed pt-1">
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
              <div className="rounded-3xl border border-dashed border-zinc-200 p-8 text-center flex flex-col items-center justify-center min-h-70">
                <p className="text-sm text-zinc-400 font-light">
                  No modules currently assigned to your account.
                </p>
              </div>
            )}
          </section>

          {/* Right Column: Recent Timeline Block */}
          <section className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              recent timeline
            </h2>

            <div className="border border-zinc-200 rounded-3xl divide-y divide-zinc-100 bg-white overflow-hidden min-h-70">
              <div className="p-6 flex items-center justify-between gap-4 group hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-zinc-900 line-clamp-1">
                      Safe Spaces Act Mandates (RA 11313)
                    </h4>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      completed May 12, 2026 • scored 95% on metric
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/workspace/modules/ra11313")}
                  className="text-zinc-300 group-hover:text-primary transition-colors shrink-0"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="p-6 flex items-center justify-between gap-4 group hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-zinc-900 line-clamp-1">
                      Foundations of GAD Frameworks
                    </h4>
                    <p className="text-xs text-zinc-400 font-light mt-0.5">
                      completed April 28, 2026 • scored 100% on metric
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/workspace/modules/foundations")}
                  className="text-zinc-300 group-hover:text-primary transition-colors shrink-0"
                >
                  <ArrowRight size={18} />
                </button>
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
