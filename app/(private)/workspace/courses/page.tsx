// app/(workspace)/courses/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Search,
  Building2,
  Globe2,
  X,
  RotateCcw,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import CourseCard from "./_components/CourseCard";
import { getEnrolledCourses } from "./service";
import type { Course } from "./type";

type FilterType = "all" | "public" | "organization";

const CoursesPage = () => {
  const { status, data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: enrolledCourses = [], isLoading } = useQuery({
    queryKey: ["enrolledCourses", session?.user?.email],
    queryFn: getEnrolledCourses,
    enabled: status === "authenticated" && !!session?.laravelJwt,
  });

  // Client-side filtering logic matching CourseGrid pattern
  const courses = React.useMemo(() => {
    let result = enrolledCourses;

    if (filter === "public") {
      result = result.filter(
        (course: any) => !course.organization_id && course.is_public !== false,
      );
    } else if (filter === "organization") {
      result = result.filter((course: any) => Boolean(course.organization_id));
    }

    const cleanQuery = activeSearch.trim().toLowerCase();
    if (cleanQuery) {
      result = result.filter((course: any) => {
        const title = (course.title || "").toLowerCase();
        const desc = (course.description || "").toLowerCase();
        return title.includes(cleanQuery) || desc.includes(cleanQuery);
      });
    }

    return result;
  }, [enrolledCourses, activeSearch, filter]);

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

  return (
    <main className="min-h-screen bg-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
                Enrolled Courses
              </h1>
              <p className="mt-2 text-sm text-zinc-500 font-light max-w-xl">
                Continue learning, explore new programs, and manage your
                enrolled courses.
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
                id="enrolled-search-input"
                name="search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search enrolled courses..."
                aria-label="Search enrolled courses"
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
                <span>All Enrolled</span>
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
            <Link
              href="/explore"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary-hover transition-all"
            >
              <span>Explore Courses</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course: Course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default CoursesPage;
