"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  getUserProfile,
  getJoinedOrganizations,
  leaveOrganization,
  JoinedOrganization,
} from "./service";
import WorkspaceSkeleton from "./_components/WorkspaceSkeleton";

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const userEmail = session?.user?.email;

  // 1. Fetch User Profile Query
  const { data: profileResponse, isLoading: isProfileInitialLoading } =
    useQuery({
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

  // 2. Fetch Joined Organizations Query
  const {
    data: joinedOrgsResponse,
    isLoading: isOrgsLoading,
    isFetching: isOrgsFetching,
  } = useQuery({
    queryKey: ["joinedOrganizations", userEmail],
    queryFn: async () => {
      const res = await getJoinedOrganizations();
      if (!res.success || !res.data) {
        return [];
      }
      return res.data;
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 2,
  });

  // 3. Mutation for Leaving Organization
  const leaveOrgMutation = useMutation({
    mutationFn: (orgId: string) => leaveOrganization(orgId),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["userProfile", userEmail] });
        queryClient.invalidateQueries({
          queryKey: ["joinedOrganizations", userEmail],
        });
      } else {
        alert(res.error || "Could not leave organization. Please try again.");
      }
    },
    onError: () => {
      alert("An unexpected error occurred. Please try again.");
    },
  });

  // Initial Skeleton State
  const isAuthenticating = status === "loading";
  if (
    isAuthenticating ||
    (status === "authenticated" && (isProfileInitialLoading || isOrgsLoading))
  ) {
    return <WorkspaceSkeleton />;
  }

  // Data Mapping
  const profile = profileResponse ?? null;
  const firstName =
    profile?.first_name || session?.user?.name?.split(" ")[0] || "User";

  const joinedOrganizations = joinedOrgsResponse ?? [];
  const hasOrganizations = joinedOrganizations.length > 0;

  const activeModule = profile?.active_module
    ? {
        id: profile.active_module.id,
        title: profile.active_module.title,
        description: profile.active_module.description,
        progress: profile.active_module.progress_percentage ?? 0,
        href: `/learn/${profile.active_module.id}`,
      }
    : null;

  const handleLeaveOrganization = (orgId: string, orgName: string) => {
    if (confirm(`Are you sure you want to leave ${orgName}?`)) {
      leaveOrgMutation.mutate(orgId);
    }
  };

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

        {/* Dynamic Organization Banner / Slider */}
        <InstitutionSection
          hasOrganizations={hasOrganizations}
          organizations={joinedOrganizations}
          isFetching={isOrgsFetching || leaveOrgMutation.isPending}
          onExploreOrgs={() => router.push("/organization")}
          onGoToOrgPage={(orgId) => router.push(`/organization`)}
          onLeaveOrg={handleLeaveOrganization}
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

/* ========================================================================
   INSTITUTION SECTION (SWITCHES BETWEEN DISCOVER BANNER AND SLIDER)
   ======================================================================== */

interface InstitutionSectionProps {
  hasOrganizations: boolean;
  organizations: JoinedOrganization[];
  isFetching?: boolean;
  onExploreOrgs: () => void;
  onGoToOrgPage: (orgId: string) => void;
  onLeaveOrg: (orgId: string, orgName: string) => void;
}

function InstitutionSection({
  hasOrganizations,
  organizations,
  isFetching,
  onExploreOrgs,
  onGoToOrgPage,
  onLeaveOrg,
}: InstitutionSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If user has not joined any organizations, display the original empty banner state
  if (!hasOrganizations) {
    return (
      <div className="relative w-full py-8 px-6 bg-gradient-to-b from-purple-50/60 to-white border border-purple-200/60 rounded-2xl flex flex-col items-center text-center overflow-hidden transition-all duration-300">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
            Discover Organizations
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Connect with your school, company, or study group to access certain
            learning content.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 w-full">
          <button
            onClick={onExploreOrgs}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-primary hover:bg-primary-hover text-white transition-all active:scale-[0.98] group cursor-pointer shadow-sm"
          >
            <span>View Organizations</span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    );
  }

  // Controls for organization slider
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % organizations.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + organizations.length) % organizations.length,
    );
  };

  const currentOrg = organizations[currentIndex] || organizations[0];
  const orgTitle = currentOrg.name || currentOrg.title || "Organization";
  const memberCount = currentOrg.members_count ?? currentOrg.membersCount;

  return (
    <div className="relative w-full bg-gradient-to-b from-purple-50/80 via-white to-purple-50/30 border border-purple-200/70 rounded-2xl p-6 md:p-8 shadow-sm transition-all duration-300">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-purple-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
            Your Joined Organizations ({organizations.length})
          </span>
        </div>

        {/* Explore More Button */}
        <button
          onClick={onExploreOrgs}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>Find More</span>
        </button>
      </div>

      {/* Main Slider Content Card */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Organization Info */}
        <div className="space-y-3 w-full max-w-2xl text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">
              {orgTitle}
            </h2>
            {currentOrg.role_name && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-primary border border-purple-200">
                {currentOrg.role_name}
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm text-zinc-600 leading-relaxed line-clamp-2">
            {currentOrg.description ||
              "No description available for this organization."}
          </p>

          {typeof memberCount === "number" && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium pt-1">
              <Users size={13} className="text-zinc-400" />
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls Column */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          <button
            onClick={() => onGoToOrgPage(currentOrg.id)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-primary hover:bg-primary-hover text-white transition-all shadow-sm active:scale-[0.98] cursor-pointer group"
          >
            <span>Go to Organization Page</span>
            <ExternalLink
              size={13}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>

          <button
            disabled={isFetching}
            onClick={() => onLeaveOrg(currentOrg.id, orgTitle)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut size={12} />
            <span>Leave Organization</span>
          </button>
        </div>
      </div>

      {/* Slider Controls (Only shown if user has joined 2 or more organizations) */}
      {organizations.length > 1 && (
        <div className="mt-6 pt-4 border-t border-purple-100/60 flex items-center justify-between">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {organizations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-purple-200 hover:bg-purple-300"
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous organization"
              className="p-1.5 rounded-lg border border-purple-200 bg-white text-zinc-600 hover:bg-purple-50 hover:text-primary transition-colors cursor-pointer shadow-xs"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next organization"
              className="p-1.5 rounded-lg border border-purple-200 bg-white text-zinc-600 hover:bg-purple-50 hover:text-primary transition-colors cursor-pointer shadow-xs"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================
   SUB-COMPONENTS: ACTIVE MODULE & STAT CARDS
   ======================================================================== */

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
