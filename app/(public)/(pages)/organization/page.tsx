// app/(workspace)/organization/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Building2,
  LayoutGrid,
  LogOut,
  Plus,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api-client";
import LeaveConfirmModal from "./leave-confirm-modal";

interface Organization {
  id: string;
  title: string;
  description: string;
  membersCount: number;
  isJoined?: boolean;
}

type FilterType = "all" | "joined";

async function fetchExploreOrganizations(): Promise<Organization[]> {
  const res = await apiFetch("/api/organizations/explore");
  if (!res || !res.ok) {
    throw new Error("Failed to fetch organizations");
  }
  return res.json();
}

export default function OrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedOrgToLeave, setSelectedOrgToLeave] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const isAuthenticated = !!session?.user;

  // 🎯 TanStack Query for fetching explore organizations with caching
  const { data: organizations = [], isLoading: isFetching } = useQuery({
    queryKey: ["exploreOrganizations", session?.user?.email],
    queryFn: fetchExploreOrganizations,
    enabled: status !== "loading",
    staleTime: 1000 * 60 * 2, // Cache data for 2 minutes to prevent reloading on navigation
    refetchOnWindowFocus: false, // Prevents refetching when switching browser tabs
  });

  // 🎯 Leave Organization Mutation
  const leaveOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const res = await apiFetch("/api/organizations/leave", {
        method: "POST",
        body: JSON.stringify({ organization_id: orgId }),
      });
      if (!res || !res.ok) {
        throw new Error("Failed to leave organization");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries so cache updates automatically across pages
      queryClient.invalidateQueries({ queryKey: ["exploreOrganizations"] });
      queryClient.invalidateQueries({ queryKey: ["userOrganization"] });
      queryClient.invalidateQueries({ queryKey: ["joinedOrganizations"] });
      setSelectedOrgToLeave(null);
    },
    onError: (err) => {
      console.error("Leave organization failed:", err);
    },
  });

  // Compute joined IDs from fetched organizations
  const joinedOrgIds = React.useMemo(() => {
    return new Set<string>(
      organizations.filter((org) => org.isJoined).map((org) => org.id),
    );
  }, [organizations]);

  // Reset filter back to 'all' if user logs out while on 'joined' tab
  useEffect(() => {
    if (!isAuthenticated && filter === "joined") {
      setFilter("all");
    }
  }, [isAuthenticated, filter]);

  const handleActionClick = (org: Organization, currentlyJoined: boolean) => {
    if (status === "loading") return;

    if (!isAuthenticated) {
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent("/organization")}`,
      );
      return;
    }

    if (currentlyJoined) {
      setSelectedOrgToLeave({ id: org.id, title: org.title });
    } else {
      router.push("/workspace/organization");
    }
  };

  const handleConfirmLeave = () => {
    if (!selectedOrgToLeave) return;
    leaveOrgMutation.mutate(selectedOrgToLeave.id);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(query.trim());
  };

  const handleReset = () => {
    setQuery("");
    setActiveSearch("");
    setFilter("all");
  };

  const isFiltered = activeSearch !== "" || filter !== "all";

  // Filter organizations by search query and active tab
  const filteredOrganizations = React.useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
        org.description.toLowerCase().includes(activeSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "joined") return joinedOrgIds.has(org.id);
      return true;
    });
  }, [organizations, activeSearch, filter, joinedOrgIds]);

  return (
    <main className="min-h-screen bg-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
                Explore Organizations
              </h1>
              <p className="mt-2 text-sm text-zinc-500 font-light max-w-xl">
                Connect with peer groups, join specialized learning hubs, and
                collaborate across teams.
              </p>
            </div>

            {/* Minimal Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center w-full md:w-80"
            >
              <Search
                size={16}
                className="absolute left-3.5 text-zinc-400 pointer-events-none"
              />
              <input
                id="org-search-input"
                name="search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search organizations..."
                aria-label="Search organizations"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-200 text-sm bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveSearch("");
                  }}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 transition-colors"
                  title="Clear input"
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>

          {/* Minimal Category Filter Tabs & Reset Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === "all"
                    ? "bg-primary text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
                }`}
              >
                <LayoutGrid size={13} />
                <span>All Organizations ({organizations.length})</span>
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setFilter("joined")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === "joined"
                      ? "bg-primary text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
                  }`}
                >
                  <Building2 size={13} />
                  <span>My Organizations ({joinedOrgIds.size})</span>
                </button>
              )}
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-primary-hover transition-colors font-medium px-2 py-1 rounded-md hover:bg-purple-50"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* 🔍 Search Results Indicator Banner */}
          {activeSearch && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-purple-50/60 border border-purple-100/80 text-xs">
              <span className="text-zinc-600 font-medium">
                Search results for:{" "}
                <span className="font-semibold text-primary">
                  &quot;{activeSearch}&quot;
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveSearch("");
                }}
                className="text-zinc-400 hover:text-primary-hover transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Grid Content */}
        {isFetching ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-64 w-full animate-pulse rounded-2xl bg-zinc-100/80 border border-zinc-100"
              />
            ))}
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
            <h3 className="text-base font-semibold text-zinc-800">
              {activeSearch
                ? `No results found for "${activeSearch}"`
                : "No organizations available"}
            </h3>
            <p className="mt-1 text-xs text-zinc-400 font-light">
              Try checking your spelling or reset filters to see all
              organizations.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-all"
              >
                <RotateCcw size={12} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredOrganizations.map((org) => {
                const isJoined = isAuthenticated && joinedOrgIds.has(org.id);
                const isBusy =
                  leaveOrgMutation.isPending &&
                  selectedOrgToLeave?.id === org.id;

                return (
                  <div
                    key={org.id}
                    className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-zinc-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-zinc-900 group-hover:text-primary transition-colors leading-tight">
                          {org.title}
                        </h3>
                      </div>

                      <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                        {org.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-medium">
                        {org.membersCount}{" "}
                        {org.membersCount === 1 ? "member" : "members"}
                      </span>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleActionClick(org, isJoined)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-50 ${
                          isJoined
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                            : "bg-primary text-white hover:bg-primary-hover shadow-xs"
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isJoined ? (
                          <>
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Leave</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            <span>Join</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Leave Confirmation Modal */}
        <LeaveConfirmModal
          isOpen={!!selectedOrgToLeave}
          orgName={selectedOrgToLeave?.title || ""}
          isPending={leaveOrgMutation.isPending}
          onClose={() => setSelectedOrgToLeave(null)}
          onConfirm={handleConfirmLeave}
        />
      </div>
    </main>
  );
}
