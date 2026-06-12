"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { getUserProfile } from "./service";
import { UserProfile } from "./types";

export default function WorkspacePage() {
  const router = useRouter();
  const { status } = useSession();
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);

  // Dynamic Metrics tracking states
  const [modulesInProgressCount, setModulesInProgressCount] = useState<number>(0);
  const [modulesCompletedCount, setModulesCompletedCount] = useState<number>(0);

  // 🎯 LIVE DATABASE STATE: Safely holds the course module payload returned from the backend
  const [activeModule, setActiveModule] = useState<{
    id: string;
    title: string;
    description: string;
    progress: number;
    href: string;
  } | null>(null);

  const fetchProfileAndMetrics = useCallback(async () => {
    if (status !== "authenticated") return;

    const res = await getUserProfile();

    if (res.success && res.data) {
      setProfile(res.data);

      // Sync dynamic analytics counters safely
      const inProgress = res.data.in_progress_count ?? 0;
      const completed = res.data.completed_count ?? 0;
      setModulesInProgressCount(inProgress);
      setModulesCompletedCount(completed);

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
  }, [status]);

  useEffect(() => {
    fetchProfileAndMetrics();

    if (status !== "authenticated") {
      return;
    }

    const handleRefresh = () => {
      void fetchProfileAndMetrics();
    };

    const intervalId = window.setInterval(handleRefresh, 30000);

    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, [fetchProfileAndMetrics, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans overflow-hidden">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
            loading your environment
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-x-hidden">
      <main className="relative z-10 mx-auto max-w-7xl px-8 py-16 lg:px-12 lg:py-24">
        {/* Top Split Row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-zinc-100 pb-12">
          <header className="max-w-2xl">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] block mb-3">
              philippine advocacy terminal
            </span>
            <h1 className="text-4xl font-light tracking-tight text-zinc-900 sm:text-5xl leading-tight">
              Welcome back,
              <span className="font-semibold italic font-serif text-primary">
                {" "}
                {profile?.first_name || "User"}.
              </span>
            </h1>
          </header>

          {/* Analytics Grid Panels */}
          <section className="w-full sm:w-auto shrink-0 lg:ml-auto">
            <div className="flex gap-3 w-full sm:w-64 max-w-70">
              {/* Stat Block 01: In Progress */}
              <div className="flex-1 border border-zinc-100 bg-zinc-50/20 rounded-xl p-3.5 transition-all duration-300 hover:border-zinc-200">
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
                  In Progress
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light tracking-tight text-primary">
                    {modulesInProgressCount < 10 ? `0${modulesInProgressCount}` : modulesInProgressCount}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-light lowercase">
                    {modulesInProgressCount === 1 ? "module" : "modules"}
                  </span>
                </div>
              </div>

              {/* Stat Block 02: Completed */}
              <div className="flex-1 border border-zinc-100 bg-zinc-50/20 rounded-xl p-3.5 transition-all duration-300 hover:border-zinc-200">
                <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
                  completed
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-light tracking-tight text-primary">
                    {modulesCompletedCount < 10 ? `0${modulesCompletedCount}` : modulesCompletedCount}
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
              <div className="rounded-3xl border border-zinc-100 bg-zinc-50/30 p-8 relative overflow-hidden flex flex-col justify-between min-h-70">
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
                <p className="text-sm text-zinc-400 font-light">No modules currently assigned to your account.</p>
              </div>
            )}
          </section>

          {/* Right Column: Recent Timeline Block */}
          <section className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              recent timeline
            </h2>

            <div className="border border-zinc-100 rounded-3xl divide-y divide-zinc-100 bg-white overflow-hidden min-h-70">
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

        <footer className="mt-32 pt-8 border-t border-zinc-100 flex justify-between items-center text-[10px] tracking-widest text-zinc-300 uppercase">
          <span>gadvance dashboard environment v3.0</span>
          <span>© 2026 protection active</span>
        </footer>
      </main>
    </div>
  );
}