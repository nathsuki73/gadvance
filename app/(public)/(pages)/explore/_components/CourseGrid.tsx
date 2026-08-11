"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Building2,
  Globe2,
  X,
  RotateCcw,
  LayoutGrid,
} from "lucide-react";
import CourseCard from "./CourseCard";
import { searchContent } from "../service";
import type { LearningPlan } from "../types";

type FilterType = "all" | "public" | "organization";

const CourseGrid = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Automatically reset filter back to 'all' if user logs out while on 'organization' tab
  useEffect(() => {
    if (!isAuthenticated && filter === "organization") {
      setFilter("all");
    }
  }, [isAuthenticated, filter]);

  // Fetch courses with active search query
  const { data: rawCourses = [], isLoading } = useQuery({
    queryKey: ["courses", activeSearch],
    queryFn: () => searchContent(activeSearch),
  });

  // Client-side filtering logic based on course attributes
  const courses = React.useMemo(() => {
    if (filter === "public") {
      return rawCourses.filter(
        (c) => !c.organization_id && c.is_public !== false,
      );
    }
    if (filter === "organization") {
      return rawCourses.filter((c) => Boolean(c.organization_id));
    }
    return rawCourses;
  }, [rawCourses, filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(query.trim());
  };

  // Reset all search and filter controls to default state
  const handleReset = () => {
    setQuery("");
    setActiveSearch("");
    setFilter("all");
  };

  const isFiltered = activeSearch !== "" || filter !== "all";

  return (
    <>
      {/* Header Section */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
              Explore Courses
            </h1>
            <p className="mt-2 text-sm text-zinc-500 font-light max-w-xl">
              Discover new modules, sharpen your skills, and advance your
              knowledge at your own pace.
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
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
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
              <span>All Courses</span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("public")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === "public"
                  ? "bg-primary text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
              }`}
            >
              <Globe2 size={13} />
              <span>Public</span>
            </button>

            {/* Conditionally render Organization tab ONLY when signed in */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setFilter("organization")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === "organization"
                    ? "bg-primary text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80"
                }`}
              >
                <Building2 size={13} />
                <span>Organization</span>
              </button>
            )}
          </div>

          {/* Reset Button (Only visible when search or filter is active) */}
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
        <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
          <h3 className="text-base font-semibold text-zinc-800">
            {activeSearch
              ? `No results found for "${activeSearch}"`
              : "No courses available"}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 font-light">
            Try checking your spelling or reset filters to see all courses.
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
