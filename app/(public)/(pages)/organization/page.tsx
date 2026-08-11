"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Building2,
  LayoutGrid,
  LogOut,
  Plus,
  Loader2,
} from "lucide-react";

// Module augmentation to inform TypeScript of custom session fields
declare module "next-auth" {
  interface Session {
    laravelJwt?: string;
    sessionToken?: string;
    error?: string;
  }
}

interface Organization {
  id: string;
  title: string;
  description: string;
  membersCount: number;
  isJoined?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
  : "";

export default function OrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [joinedOrgIds, setJoinedOrgIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "joined">("all");
  const [isFetching, setIsFetching] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const isAuthenticated = !!session?.user;
  const isLoading = status === "loading";
  const jwtToken = session?.laravelJwt;

  // Fetch all organizations with member counts
  const fetchOrganizations = useCallback(async () => {
    try {
      setIsFetching(true);

      const endpoint = `${API_BASE_URL}/api/organizations/explore`;
      const headers: HeadersInit = {
        Accept: "application/json",
      };

      if (jwtToken) {
        headers["Authorization"] = `Bearer ${jwtToken}`;
      }

      const res = await fetch(endpoint, { headers });

      if (!res.ok) {
        throw new Error(`Failed to fetch organizations (${res.status})`);
      }

      const data: Organization[] = await res.json();
      setOrganizations(data);

      const joined = new Set<string>(
        data.filter((org) => org.isJoined).map((org) => org.id),
      );
      setJoinedOrgIds(joined);
    } catch (err) {
      console.error("Error loading organizations:", err);
    } finally {
      setIsFetching(false);
    }
  }, [jwtToken]);

  useEffect(() => {
    if (!isLoading) {
      fetchOrganizations();
    }
  }, [fetchOrganizations, isLoading]);

  // Reset tab to "all" if user is logged out
  useEffect(() => {
    if (!isAuthenticated && activeTab === "joined") {
      setActiveTab("all");
    }
  }, [isAuthenticated, activeTab]);

  const handleActionClick = async (orgId: string, currentlyJoined: boolean) => {
    if (isLoading) return;

    if (!isAuthenticated || !jwtToken) {
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent("/organization")}`,
      );
      return;
    }

    try {
      setActionLoadingId(orgId);

      if (currentlyJoined) {
        // Leave Organization Request
        const res = await fetch(`${API_BASE_URL}/api/organizations/leave`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ organization_id: orgId }),
        });

        if (res.ok) {
          setJoinedOrgIds((prev) => {
            const next = new Set(prev);
            next.delete(orgId);
            return next;
          });

          setOrganizations((prev) =>
            prev.map((org) =>
              org.id === orgId
                ? {
                    ...org,
                    membersCount: Math.max(0, org.membersCount - 1),
                    isJoined: false,
                  }
                : org,
            ),
          );
        }
      } else {
        // Redirect to workspace organization dashboard upon joining
        router.push("/workspace/organization");
      }
    } catch (err) {
      console.error("Organization action failed:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter organizations by search and tab
  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "joined") return joinedOrgIds.has(org.id);
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-white">
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-12 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
              Explore Organizations
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base mt-1">
              Connect with peer groups, join specialized learning hubs, and
              collaborate across teams.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-zinc-200 text-sm bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#8b5cf6] text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100/80"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>All Organizations ({organizations.length})</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab("joined")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === "joined"
                  ? "bg-[#8b5cf6] text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100/80"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>My Organizations ({joinedOrgIds.size})</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6]" />
            <p className="text-sm text-zinc-500 font-medium">
              Loading organizations...
            </p>
          </div>
        ) : filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => {
              const isJoined = isAuthenticated && joinedOrgIds.has(org.id);
              const isBusy = actionLoadingId === org.id;

              return (
                <div
                  key={org.id}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-zinc-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#8b5cf6] transition-colors leading-tight">
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
                      disabled={isBusy}
                      onClick={() => handleActionClick(org.id, isJoined)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-50 ${
                        isJoined
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                          : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-sm"
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
        ) : (
          <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 py-20 px-4 text-center">
            <Building2 className="h-10 w-10 text-zinc-300 mb-3" />
            <h3 className="text-base font-semibold text-zinc-800">
              No organizations available
            </h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">
              Try checking your spelling or reset filters to see all
              organizations.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
