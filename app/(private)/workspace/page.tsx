"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";
import { getUserProfile } from "./service";
import WorkspaceSkeleton from "./_components/WorkspaceSkeleton";
import Footer from "@/app/components/Footer";
import { forceSignOut } from "@/app/lib/api-client";

export default function WorkspacePage() {
  const router = useRouter();

  // 1. Get auth status from NextAuth
  const { data: session, status } = useSession();

  // 2. Query hooks only executes once authenticated
  const { data: profileResponse, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile", session?.user?.email],
    queryFn: async () => {
      const res = await getUserProfile();
      if (!res.success || !res.data) {
        throw new Error("Failed to fetch profile data");
      }
      return res.data;
    },
    // Only run query if session status is explicitly authenticated
    enabled: status === "authenticated",
    // Keep data fresh for 2 minutes before refetching in background
    staleTime: 1000 * 60 * 2,
  });

  // 3. Handle loading state (Combines auth checking and backend fetching)
  const isAuthenticating = status === "loading";
  const isFetchingData = status === "authenticated" && isProfileLoading;

  if (isAuthenticating || isFetchingData) {
    return <WorkspaceSkeleton />;
  }

  // Extract variables directly from data without maintaining sync state
  const profile = profileResponse ?? null;
  const modulesInProgressCount = profile?.in_progress_count ?? 0;
  const modulesCompletedCount = profile?.completed_count ?? 0;
  const activeModule = profile?.active_module
    ? {
        id: profile.active_module.id,
        title: profile.active_module.title,
        description: profile.active_module.description,
        progress: profile.active_module.progress_percentage ?? 0,
        href: `/learn/${profile.active_module.id}`,
      }
    : null;

  const derivedFirstName =
    profile?.first_name || session?.user?.name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-x-hidden">
      <main className="relative z-10 mx-auto max-w-7xl px-8 py-16 lg:px-12 lg:py-24">
        {/* Full-width Responsive Header */}
        <header className="border-b border-zinc-200 pb-12 w-full">
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 sm:text-5xl lg:whitespace-nowrap leading-tight sm:leading-none">
            Welcome to GADvance,{" "}
            <span className="font-semibold italic font-serif text-primary inline-block">
              {derivedFirstName}.
            </span>
          </h1>
        </header>

        {/* Content Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Side: Recently Viewed */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
              Recently Viewed
            </h2>

            {activeModule ? (
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50/30 p-8 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
                <div className="space-y-4 w-full">
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
                      <span className="font-bold text-primary">
                        {activeModule.progress}% Completed
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed pt-1 line-clamp-3">
                    {activeModule.description}
                  </p>
                </div>

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

          {/* Right Side: Analytics Grid */}
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
      </main>
    </div>
  );
}
