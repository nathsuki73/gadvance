"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  LogOut,
  Loader2,
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

  const handleLeaveOrganization = () => {
    if (confirm("Are you sure you want to leave this organization?")) {
      console.log("Leaving organization...");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-zinc-50/50 to-white text-zinc-900 font-sans relative overflow-x-hidden">
      {/* Background Ambient Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-purple-500/5 blur-3xl pointer-events-none -z-10" />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16 space-y-10">
        {/* Header Section */}
        <header className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-purple-600/70 uppercase">
            Workspace Overview
          </p>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
            Welcome to GADvance,{" "}
            <span className="font-semibold italic font-serif text-purple-700 inline-block">
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
          onLeave={handleLeaveOrganization}
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column: Recently Viewed */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-purple-600/70 uppercase">
              Recently Viewed Module
            </h2>
            <ActiveModuleCard
              module={activeModule}
              onNavigate={(href) => router.push(href)}
            />
          </section>

          {/* Side Column: Analytics Grid */}
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-purple-600/70 uppercase">
              Your Learning Stats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <StatCard
                icon={<Clock className="size-4 text-purple-600" />}
                label="In Progress"
                count={profile?.in_progress_count ?? 0}
              />
              <StatCard
                icon={<CheckCircle2 className="size-4 text-purple-600" />}
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
  organizationName?: string;
  isFetching?: boolean;
  onAction: () => void;
  onLeave?: () => void;
}

export function InstitutionBanner({
  hasOrganization,
  organizationName,
  isFetching,
  onAction,
  onLeave,
}: OrganizationBannerProps) {
  return (
    <div className="relative w-full py-8 px-6 bg-gradient-to-b from-purple-50/60 to-white border border-purple-200/60 rounded-2xl flex flex-col items-center text-center overflow-hidden transition-all duration-300">
      {/* Loading Skeleton Overlay for Institution Banner */}
      {isFetching ? (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-4 animate-pulse py-1">
          {/* Header Title Skeleton */}
          <div className="h-5 w-3/4 bg-purple-200/60 rounded-md" />

          {/* Subtitle Description Skeleton */}
          <div className="space-y-2 w-full flex flex-col items-center">
            <div className="h-3 w-5/6 bg-purple-100 rounded" />
            <div className="h-3 w-2/3 bg-purple-100 rounded" />
          </div>

          {/* Button Skeleton */}
          <div className="mt-4 h-9 w-36 bg-purple-200/80 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Header & Description */}
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
              {hasOrganization ? (
                <>
                  You are a member of{" "}
                  <span className="text-purple-700 font-bold">
                    {organizationName}
                  </span>
                </>
              ) : (
                "Are you affiliated with an institution?"
              )}
            </h2>

            <p className="text-xs text-zinc-500 leading-relaxed">
              {hasOrganization
                ? "Access custom modules and learning tracks curated specifically for your team."
                : "Join your team using an invite code to unlock shared pathways and learning progress."}
            </p>
          </div>

          {/* Primary Encouragement CTA (Bottom Middle) */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full">
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-purple-600 hover:bg-purple-700 text-white transition-all active:scale-[0.98] group"
            >
              <span>
                {hasOrganization ? "Explore Courses" : "Join Organization"}
              </span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            {/* Secondary Action: Leave Organization */}
            {hasOrganization && (
              <button
                onClick={onLeave}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-red-600 transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-50 mt-1"
                title="Leave Organization"
              >
                <LogOut size={12} />
                <span>Leave Organization</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface ActiveModuleProps {
  module: {
    id: string;
    title: string;
    description: string;
    progress: number;
    href: string;
  } | null;
  onNavigate: (href: string) => void;
}

function ActiveModuleCard({ module, onNavigate }: ActiveModuleProps) {
  if (!module) {
    return (
      <div className="rounded-2xl border border-dashed border-purple-200/60 bg-white/80 p-8 text-center flex flex-col items-center justify-center min-h-[260px]">
        <p className="text-sm text-zinc-400 font-light">
          No active modules assigned to your account yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-200/50 bg-white/90 p-8 relative overflow-hidden flex flex-col justify-between min-h-[260px]">
      <div className="space-y-4 w-full">
        <h3 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {module.title}
        </h3>

        <div className="py-1 max-w-md space-y-2">
          <div className="h-2 w-full bg-purple-100/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${module.progress}%` }}
            />
          </div>
          <div className="flex items-center text-[11px] font-medium text-zinc-400">
            <span>Course Progress:&nbsp;</span>
            <span className="font-bold text-purple-700">
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
          onClick={() => onNavigate(module.href)}
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
        >
          <PlayCircle size={14} />
          <span>Resume Module</span>
        </button>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}

function StatCard({ icon, label, count }: StatCardProps) {
  return (
    <div className="border border-purple-200/50 bg-white/90 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
          {label}
        </span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-4xl font-light tracking-tight text-purple-700">
          {count}
        </span>
        <span className="text-xs text-zinc-400 font-light lowercase">
          {count === 1 ? "module" : "modules"}
        </span>
      </div>
    </div>
  );
}
