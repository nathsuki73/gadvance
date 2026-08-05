"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Building2, LayoutGrid, LogOut, Plus } from "lucide-react";

interface Organization {
  id: string;
  title: string;
  description: string;
  membersCount: number;
}

const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: "org-1",
    title: "Computer Science Society",
    description:
      "A student-led community dedicated to collaborative coding, competitive programming, and tech workshops.",
    membersCount: 128,
  },
  {
    id: "org-2",
    title: "Data Science & AI Lab",
    description:
      "Explore machine learning algorithms, big data analysis, and real-world neural network applications.",
    membersCount: 84,
  },
  {
    id: "org-3",
    title: "Cyber Security Guild",
    description:
      "Focusing on ethical hacking, network defense, penetration testing, and CTF competitions.",
    membersCount: 45,
  },
  {
    id: "org-4",
    title: "UI/UX & Product Design Hub",
    description:
      "Learn design systems, wireframing, prototyping in Figma, and human-centered design principles.",
    membersCount: 96,
  },
];

export default function OrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "joined">("all");
  
  /* 
    ========================================================================
    STATE CHANGE:
    Set initial state to empty Set() so all cards start in "Join" state.
    Original: new Set(["org-1"])
    ========================================================================
  */
  const [joinedOrgIds, setJoinedOrgIds] = useState<Set<string>>(new Set());

  const isAuthenticated = !!session?.user;
  const isLoading = status === "loading";

  // Reset tab to "all" if the user is unauthenticated
  useEffect(() => {
    if (!isAuthenticated && activeTab === "joined") {
      setActiveTab("all");
    }
  }, [isAuthenticated, activeTab]);

  const handleJoinClick = (orgId: string) => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Unauthenticated users are sent to Sign In with return callback
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/organization")}`);
      return;
    }

    // Authenticated users are redirected to workspace organization page
    router.push("/workspace/organization");
  };

  // Filter logic for search & tab categories
  const filteredOrganizations = MOCK_ORGANIZATIONS.filter((org) => {
    const matchesSearch =
      org.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "joined") return joinedOrgIds.has(org.id);
    return true; // "all" tab
  });

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Container aligned with the rest of the application layout */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-12 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">
              Explore Organizations
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base mt-1">
              Connect with peer groups, join specialized learning hubs, and collaborate across teams.
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

        {/* Filter Tabs matching UI design */}
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
            <span>All Organizations</span>
          </button>

          {/* Conditionally render "My Organizations" only for authenticated users */}
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

        {/* Main Content Area */}
        {filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => {
              const isJoined = isAuthenticated && joinedOrgIds.has(org.id);

              return (
                <div
                  key={org.id}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all hover:border-zinc-300"
                >
                  <div className="space-y-3">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#8b5cf6] transition-colors leading-tight">
                        {org.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
                      {org.description}
                    </p>
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">
                      {org.membersCount + (isJoined ? 1 : 0)} members
                    </span>

                    <button
                      onClick={() => handleJoinClick(org.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        isJoined
                          ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                          : "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-sm"
                      }`}
                    >
                      {isJoined ? (
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
          /* Empty State */
          <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/40 py-20 px-4 text-center">
            <Building2 className="h-10 w-10 text-zinc-300 mb-3" />
            <h3 className="text-base font-semibold text-zinc-800">
              No organizations available
            </h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">
              Try checking your spelling or reset filters to see all organizations.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}