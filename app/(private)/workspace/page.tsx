"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  PlayCircle,
  Building2,
  ArrowRight,
  BookOpen,
  Loader2,
} from "lucide-react";
import { getUserProfile } from "./service";
import WorkspaceSkeleton from "./_components/WorkspaceSkeleton";
import Footer from "@/app/components/Footer";

export default function WorkspacePage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const {
    data: profileResponse,
    isLoading: isProfileInitialLoading, // True ONLY on first query load without cached data
    isFetching: isProfileFetching, // True whenever refetching/invalidating
  } = useQuery({
    queryKey: ["userProfile", session?.user?.email],
    queryFn: async () => {
      const res = await getUserProfile();
      if (!res.success || !res.data) {
        throw new Error("Failed to fetch profile data");
      }
      return res.data;
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });

  // 1. Only show full-page skeleton on INITIAL load when there's no cached data yet
  const isAuthenticating = status === "loading";
  if (
    isAuthenticating ||
    (status === "authenticated" && isProfileInitialLoading)
  ) {
    return <WorkspaceSkeleton />;
  }

  // Extract variables
  const profile = profileResponse ?? null;
  const modulesInProgressCount = profile?.in_progress_count ?? 0;
  const modulesCompletedCount = profile?.completed_count ?? 0;

  const hasOrganization = Boolean(
    profile?.organization_id || profile?.organization,
  );
  const organizationName = profile?.organization?.name || "Your Organization";

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

        {/* Dynamic Organization Banner Section */}
        <div className="mt-8 w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 transition-all duration-300">
          {isProfileFetching ? (
            /* LOCAL LOADING STATE: Displays only inside the banner during refetch/invalidation */
            <div className="flex items-center justify-between min-h-[64px]">
              <div className="flex items-center gap-4 animate-pulse">
                <div className="p-3 rounded-xl bg-zinc-200 shrink-0 h-11 w-11" />
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-zinc-200 rounded" />
                  <div className="h-3 w-64 bg-zinc-200 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Updating organization...</span>
              </div>
            </div>
          ) : hasOrganization ? (
            /* STATE A: User IS in an Organization */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                    Member of{" "}
                    <span className="text-primary font-bold">
                      {organizationName}
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-normal leading-relaxed mt-1">
                    Access modules and learning tracks curated specifically for
                    your institution.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/explore")}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98] shrink-0 shadow-sm shadow-violet-100 group"
              >
                <span>Explore Courses</span>
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          ) : (
            /* STATE B: User is NOT in an Organization */
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                    Are you part of an institution?
                  </h2>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed mt-0.5">
                    Join your organization using an invite code to access team
                    modules and shared learning progress.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/workspace/organization")}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all active:scale-[0.98] shrink-0 shadow-sm shadow-violet-100 group"
              >
                <span>Join Organization</span>
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
          )}
        </div>

        {/* Content Section (Remains visible and interactive) */}
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
