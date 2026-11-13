"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Building2,
  Globe2,
  X,
  RotateCcw,
  LayoutGrid,
  Check,
  Loader2,
} from "lucide-react";
import CourseCard from "./CourseCard";
import {
  fetchExploreOrganizations,
  searchContent,
  type PlanFilter,
} from "../service";
import type { LearningPlan } from "../types";

const FILTERS: PlanFilter[] = ["all", "public", "organization"];
const SEARCH_DEBOUNCE_MS = 350;

/**
 * The URL is the single source of truth for what is shown:
 *   /explore?search=gender&filter=organization&org=<organization id>
 * so a filtered view can be shared, bookmarked, reloaded, or reached with the
 * browser's back and forward buttons.
 */
function readParams(searchParams: URLSearchParams) {
  const rawFilter = searchParams.get("filter") as PlanFilter | null;
  const filter: PlanFilter =
    rawFilter && FILTERS.includes(rawFilter) ? rawFilter : "all";
  const org = filter === "organization" ? searchParams.get("org") || "" : "";

  return { search: (searchParams.get("search") || "").trim(), filter, org };
}

const CourseGrid = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { search, filter, org } = readParams(searchParams);

  // What the learner is typing; it reaches the URL after a short pause.
  const [query, setQuery] = useState(search);
  const lastWrittenSearch = useRef(search);

  const writeParams = (next: {
    search?: string;
    filter?: PlanFilter;
    org?: string;
  }) => {
    const nextSearch = (next.search ?? search).trim();
    const nextFilter = next.filter ?? filter;
    const nextOrg = nextFilter === "organization" ? (next.org ?? org) : "";

    const params = new URLSearchParams();
    if (nextSearch) params.set("search", nextSearch);
    if (nextFilter !== "all") params.set("filter", nextFilter);
    if (nextOrg) params.set("org", nextOrg);

    lastWrittenSearch.current = nextSearch;
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  // Dynamic search: update the results shortly after typing stops.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === search) return;

    const timer = setTimeout(
      () => writeParams({ search: trimmed }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // writeParams reads the latest URL values each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, search]);

  // Back/forward or a pasted link changed the search: show it in the box.
  // Skipped for values this page wrote itself, so typing is never overwritten.
  useEffect(() => {
    if (search !== lastWrittenSearch.current) {
      lastWrittenSearch.current = search;
      setQuery(search);
    }
  }, [search]);

  const { data: organizations = [], isLoading: organizationsLoading } =
    useQuery({
      queryKey: ["exploreOrganizations"],
      queryFn: fetchExploreOrganizations,
      staleTime: 1000 * 60 * 5,
    });

  const selectedOrganization = useMemo(
    () => organizations.find((o) => o.id === org),
    [organizations, org],
  );

  const {
    data: courses = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["explorePlans", search, filter, org],
    queryFn: () => searchContent({ search, filter, organizationId: org }),
    // Keep the current results on screen while the next ones load.
    placeholderData: (previous) => previous,
  });

  const handleFilterChange = (selectedFilter: PlanFilter) => {
    writeParams({ filter: selectedFilter, org: "" });
  };

  const handleOrganizationChange = (organizationId: string) => {
    writeParams({ filter: "organization", org: organizationId });
  };

  const clearSearch = () => {
    setQuery("");
    writeParams({ search: "" });
  };

  const handleReset = () => {
    setQuery("");
    lastWrittenSearch.current = "";
    router.replace(pathname, { scroll: false });
  };

  const isFiltered = search !== "" || filter !== "all";

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? "bg-primary text-white shadow-xs"
        : "text-zinc-500 hover:text-[#7d49f5] hover:bg-zinc-100/80"
    }`;

  const chipClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? "border-primary bg-primary/10 text-[#5b21b6]"
        : "border-zinc-200 bg-white text-zinc-600 hover:border-primary/40 hover:text-[#5b21b6]"
    }`;

  const emptyTitle = search
    ? `No results found for "${search}"`
    : selectedOrganization
      ? `No learning plans from ${selectedOrganization.title} yet`
      : "No plans available";

  return (
    <>
      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
              Explore Learning Plans
            </h1>
            <p className="mt-2 text-sm text-zinc-500 font-light max-w-xl">
              Discover new modules, sharpen your skills, and advance your
              knowledge at your own pace.
            </p>
          </div>

          {/* Search: results update as you type */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              writeParams({ search: query });
            }}
            className="relative flex items-center w-full md:w-80"
          >
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3.5 text-zinc-500 pointer-events-none"
            />
            <label htmlFor="course-search-input" className="sr-only">
              Search learning plans
            </label>
            <input
              id="course-search-input"
              name="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search learning plans..."
              autoComplete="off"
              className="w-full pl-10 pr-9 py-2 rounded-full border border-zinc-200 text-sm bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#7d49f5] focus:border-transparent transition-all [&::-webkit-search-cancel-button]:hidden"
            />
            {isFetching && !isLoading ? (
              <Loader2
                size={14}
                aria-label="Updating results"
                className="absolute right-3 animate-spin text-zinc-500"
              />
            ) : (
              query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 text-zinc-500 hover:text-zinc-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )
            )}
          </form>
        </div>

        {/* Category Filter Tabs & Reset Controls */}
        <div className="space-y-3 border-b border-zinc-100 pb-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="group" aria-label="Filter learning plans">
              <button
                type="button"
                aria-pressed={filter === "all"}
                onClick={() => handleFilterChange("all")}
                className={tabClass(filter === "all")}
              >
                <LayoutGrid size={13} aria-hidden="true" />
                <span>All</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "public"}
                onClick={() => handleFilterChange("public")}
                className={tabClass(filter === "public")}
              >
                <Globe2 size={13} aria-hidden="true" />
                <span>Public</span>
              </button>

              <button
                type="button"
                aria-pressed={filter === "organization"}
                onClick={() => handleFilterChange("organization")}
                className={tabClass(filter === "organization")}
              >
                <Building2 size={13} aria-hidden="true" />
                <span>Organization</span>
              </button>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-primary-hover transition-colors font-medium px-2 py-1 rounded-md hover:bg-purple-50"
              >
                <RotateCcw size={12} aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Organization tags */}
          {filter === "organization" && (
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Choose an organization"
            >
              <button
                type="button"
                aria-pressed={!org}
                onClick={() => handleOrganizationChange("")}
                className={chipClass(!org)}
              >
                All organizations
              </button>

              {organizationsLoading &&
                [...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className="h-7 w-28 animate-pulse rounded-full bg-zinc-100"
                  />
                ))}

              {organizations.map((organization) => (
                <button
                  key={organization.id}
                  type="button"
                  aria-pressed={org === organization.id}
                  onClick={() => handleOrganizationChange(organization.id)}
                  className={chipClass(org === organization.id)}
                  title={
                    organization.isJoined
                      ? "You are a member of this organization"
                      : undefined
                  }
                >
                  {organization.isJoined && (
                    <Check size={12} aria-label="Joined" />
                  )}
                  {organization.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {search && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-purple-50/60 border border-purple-100/80 text-xs">
            <span className="text-zinc-600 font-medium" aria-live="polite">
              Search results for:{" "}
              <span className="font-semibold text-[#5b21b6]">
                &quot;{search}&quot;
              </span>
            </span>
            <button
              type="button"
              onClick={clearSearch}
              className="text-zinc-500 hover:text-primary-hover transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-64 w-full animate-pulse rounded-2xl bg-zinc-100/80 border border-zinc-100"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-16 px-6 text-center">
          <h2 className="text-base font-semibold text-zinc-800">
            {emptyTitle}
          </h2>
          <p className="mt-1 text-xs text-zinc-500 font-light">
            {selectedOrganization && !selectedOrganization.isJoined
              ? "Some organizations share plans only with their members."
              : "Try checking your spelling or reset filters to see all plans."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {selectedOrganization && !selectedOrganization.isJoined && (
              <Link
                href="/organization"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 transition-all"
              >
                <Building2 size={12} aria-hidden="true" />
                <span>Join an organization</span>
              </Link>
            )}
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-all"
              >
                <RotateCcw size={12} aria-hidden="true" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <section
          aria-label="Learning plans"
          className={isFetching ? "opacity-70 transition-opacity" : undefined}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((module: LearningPlan) => (
              <CourseCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default CourseGrid;
