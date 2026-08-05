"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  LogOut,
  Loader2,
} from "lucide-react";
import { getUserProfile, leaveOrganization } from "./service";
import WorkspaceSkeleton from "./_components/WorkspaceSkeleton";

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const userEmail = session?.user?.email;

  // 1. Fetch User Profile Query
  const {
    data: profileResponse,
    isLoading: isProfileInitialLoading,
    isFetching: isProfileFetching,
  } = useQuery({
    queryKey: ["userProfile", userEmail],
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

  // 2. Mutation for Leaving Organization
  const leaveOrgMutation = useMutation({
    mutationFn: leaveOrganization,
    onSuccess: (res) => {
      if (res.success) {
        // Force refetch profile query to trigger local state and banner transition
        queryClient.invalidateQueries({ queryKey: ["userProfile", userEmail] });
      } else {
        alert(res.error || "Could not leave organization. Please try again.");
      }
    },
    onError: () => {
      alert("An unexpected error occurred. Please try again.");
    },
  });

  // 3. Initial Page Skeleton Loading State
  const isAuthenticating = status === "loading";
  if (
    isAuthenticating ||
    (status === "authenticated" && isProfileInitialLoading)
  ) {
    return <WorkspaceSkeleton />;
  }

  // 4. Data Mapping
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
      leaveOrgMutation.mutate();
    }
  };

  // Combine background profile refetching and active leave mutation for local loading state
  const isBannerLoading = isProfileFetching || leaveOrgMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-zinc-50/50 to-white text-zinc-900 font-sans relative overflow-x-hidden">
      {/* Background Ambient Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-purple-500/5 blur-3xl pointer-events-none -z-10" />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16 space-y-10">
        {/* Header Section */}
        <header className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
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
          isFetching={isBannerLoading}
          /* 
            ========================================================================
            REDIRECTION LOGIC CHANGE:
            Original:
            onAction={() =>
              router.push(
                hasOrganization ? "/explore" : "/workspace/organization",
              )
            }
            ========================================================================
          */
          onAction={() => router.push("/organization")} // Update path to match your folder structure (e.g., "/workspace/organization" or "/organization")
          onLeave={handleLeaveOrganization}
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column: Recently Viewed */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-primary uppercase">
              Recently Viewed Module
            </h2>
            <ActiveModuleCard
              module={activeModule}
              onNavigate={(href) => router.push(href)}
            />
          </section>

          {/* Side Column: Analytics Grid */}
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-primary uppercase">
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
                  <span className="text-primary font-bold">
                    {organizationName}
                  </span>
                </>
              ) : (
                "Discover Organizations"
              )}
            </h2>

            <p className="text-xs text-zinc-500 leading-relaxed">
              {hasOrganization
                ? "Access custom modules and learning tracks curated specifically for your team."
                : "Connect with your school, company, or study group to access certain learning content."}
            </p>
          </div>

          {/* Primary Encouragement CTA (Bottom Middle) */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full">
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-primary hover:bg-primary-hover text-white transition-all active:scale-[0.98] group cursor-pointer"
            >
              <span>
                {/* 
                  ========================================================================
                  BUTTON TEXT LOGIC CHANGE:
                  Original:
                  {hasOrganization ? "Explore Courses" : "View Organization"}
                  ========================================================================
                */}
                View Organizations
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
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-red-600 transition-colors duration-200 px-3 py-1 rounded-md hover:bg-red-50 mt-1 cursor-pointer"
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
          onClick={() => onNavigate(module.href)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
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
          {count === 1 || count === 0 ? "module" : "modules"}
        </span>
      </div>
    </div>
  );
}