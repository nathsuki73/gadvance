"use client";

import React from "react";

export default function CoursePageSkeleton() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-x-hidden animate-pulse">
      {/* Sticky Navigation Header Skeleton */}
      <nav className="sticky top-0 z-50 border-b border-zinc-50 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <div className="h-4 w-32 bg-zinc-200 rounded" />
        </div>
      </nav>

      {/* Mocking CourseOverviewHeader Hero Skeleton */}
      <div className="bg-zinc-50/50 border-b border-zinc-100 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Hero Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-3 w-24 bg-zinc-200 rounded" />{" "}
            {/* Category / Tag */}
            <div className="space-y-3">
              <div className="h-9 w-5/6 bg-zinc-200 rounded" />{" "}
              {/* Main Title Line 1 */}
              <div className="h-9 w-1/2 bg-zinc-200 rounded" />{" "}
              {/* Main Title Line 2 */}
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full bg-zinc-200 rounded" />{" "}
              {/* Description Line 1 */}
              <div className="h-4 w-full bg-zinc-200 rounded" />{" "}
              {/* Description Line 2 */}
              <div className="h-4 w-2/3 bg-zinc-200 rounded" />{" "}
              {/* Description Line 3 */}
            </div>
          </div>

          {/* Hero Action Sidebar Area (Enrollment Button Skeleton Area) */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="h-4 w-1/3 bg-zinc-200 rounded" />
            <div className="h-11 w-full bg-zinc-200 rounded-xl" />{" "}
            {/* Primary Action Button Box */}
            <div className="h-3 w-1/2 bg-zinc-200 rounded mx-auto" />
          </div>
        </div>
      </div>

      {/* Mocking CourseModulePreview Content Container */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 space-y-8">
        <div className="h-5 w-48 bg-zinc-200 rounded" />{" "}
        {/* Modules Grid / Stack */}
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="border border-zinc-200 rounded-2xl p-6 flex items-center justify-between gap-6 bg-white"
            >
              <div className="flex items-center gap-4 w-full">
                {/* Numeric index or icon block skeleton */}
                <div className="h-10 w-10 bg-zinc-100 rounded-xl shrink-0 flex items-center justify-center">
                  <div className="h-4 w-4 bg-zinc-200 rounded" />
                </div>

                {/* Module title and descriptor metadata block */}
                <div className="space-y-2 w-full">
                  <div className="h-4 w-1/3 bg-zinc-200 rounded" />
                  <div className="h-3 w-1/4 bg-zinc-200 rounded" />
                </div>
              </div>

              {/* Trailing arrow component or lock block indicator skeleton */}
              <div className="h-8 w-8 bg-zinc-100 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
