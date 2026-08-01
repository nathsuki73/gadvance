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
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getUserProfile } from "./service";
import WorkspaceSkeleton from "./_components/WorkspaceSkeleton";

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    data: profileResponse,
    isLoading: isProfileInitialLoading,
    isFetching: isProfileFetching,
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

  // 1. Initial Page Skeleton Loading State
  const isAuthenticating = status === "loading";
  if (
    isAuthenticating ||
    (status === "authenticated" && isProfileInitialLoading)
  ) {
    return <WorkspaceSkeleton />;
  }

  // 2. Data Mapping
  const profile = profileResponse ?? null;
  const firstName =
    profile?.first_name || session?.user?.name?.split(" ")[0] || "User";
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

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-x-hidden">
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16 space-y-10">
        {/* Header Section */}
        <header className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Workspace Overview
          </p>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Welcome to GADvance,{" "}
            <span className="font-semibold italic font-serif text-primary inline-block">
              {firstName}.
            </span>
          </h1>
        </header>

        {/* Emphasized Organization Hero Section */}
        <InstitutionBanner
          hasOrganization={hasOrganization}
          organizationName={organizationName}
          isFetching={isProfileFetching}
          onAction={() =>
            router.push(
              hasOrganization ? "/explore" : "/workspace/organization",
            )
          }
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column: Recently Viewed */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Recently Viewed Module
            </h2>
            <ActiveModuleCard
              module={activeModule}
              onNavigate={(href) => router.push(href)}
            />
          </section>

          {/* Side Column: Analytics Grid */}
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
              Your Learning Stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <StatCard
                icon={<Clock className="size-4 text-primary" />}
                label="In Progress"
                count={profile?.in_progress_count ?? 0}
              />
              <StatCard
                icon={<CheckCircle2 className="size-4 text-primary" />}
                label="Completed"
                count={profile?.completed_count ?? 0}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ============================================================================
   SUB-COMPONENTS (Clean Structure & Reusability)
   ============================================================================ */

interface OrganizationBannerProps {
  hasOrganization: boolean;
  organizationName: string;
  isFetching: boolean;
  onAction: () => void;
}

export function InstitutionBanner({
  hasOrganization,
  organizationName,
  onAction,
}: {
  hasOrganization: boolean;
  organizationName?: string;
  onAction: () => void;
}) {
  return (
    <div
      className={`relative w-full py-5 px-6 transition-colors duration-300 ${
        hasOrganization
          ? "bg-gradient-to-r from-primary/5 via-zinc-50/50 to-transparent border-l-4 border-l-primary"
          : "bg-gradient-to-r from-amber-500/10 via-amber-50/20 to-transparent border-l-4 border-l-amber-500"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Content Section */}
        <div className="flex items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2"></div>

            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
              {hasOrganization ? (
                <>
                  You are a member of{" "}
                  <span className="text-primary font-bold">
                    {organizationName}
                  </span>
                </>
              ) : (
                "Are you affiliated with an institution?"
              )}
            </h2>

            <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
              {hasOrganization
                ? "Access custom modules and learning tracks curated specifically for your team."
                : "Join your team using an invite code to unlock shared pathways and learning progress."}
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
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold tracking-wide text-white shadow-sm shadow-violet-100 transition-all active:scale-[0.98] hover:bg-primary-hover"
              >
                <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                  Join Organization
                </span>
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
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
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${module.progress}%` }}
            />
          </div>
          <div className="flex items-center text-[11px] font-medium text-zinc-400">
            <span>Course Progress:&nbsp;</span>
            <span className="font-bold text-primary">
              {module.progress}% Completed
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-3">
          {module.description}
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
                    {modulesInProgressCount === 1 || modulesInProgressCount === 0 ? "module" : "modules"}
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
                    {modulesCompletedCount === 1 || modulesCompletedCount === 0 ? "module" : "modules"}
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
