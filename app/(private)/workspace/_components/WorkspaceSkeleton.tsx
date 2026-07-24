"use client";

import React from "react";

export default function WorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans relative overflow-x-hidden animate-pulse">
      <main className="relative z-10 mx-auto max-w-7xl px-8 py-16 lg:px-12 lg:py-24">
        {/* Top Split Row Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 border-b border-zinc-200 pb-12">
          <header className="max-w-2xl w-full">
            {/* Tagline skeleton */}
            <div className="h-3 w-48 bg-zinc-200 rounded mb-3" />
            {/* Main Heading skeleton */}
            <div className="h-10 w-72 sm:h-12 sm:w-96 bg-zinc-200 rounded" />
          </header>

          {/* Analytics Grid Panels Skeleton */}
          <section className="w-full sm:w-auto shrink-0 lg:ml-auto">
            <div className="flex gap-3 w-full sm:w-64 max-w-70">
              {/* Stat Block 01 */}
              <div className="flex-1 border border-zinc-200 bg-zinc-50/50 rounded-xl p-3.5">
                <div className="h-2.5 w-16 bg-zinc-200 rounded mb-2" />
                <div className="h-7 w-20 bg-zinc-200 rounded" />
              </div>
              {/* Stat Block 02 */}
              <div className="flex-1 border border-zinc-200 bg-zinc-50/50 rounded-xl p-3.5">
                <div className="h-2.5 w-16 bg-zinc-200 rounded mb-2" />
                <div className="h-7 w-20 bg-zinc-200 rounded" />
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Columns Skeleton */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Active Overview Card Skeleton */}
          <section className="space-y-6">
            <div className="h-4 w-32 bg-zinc-200 rounded" />{" "}
            {/* Section Title */}
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50/30 p-8 flex flex-col justify-between min-h-70">
              <div className="space-y-4 w-full">
                <div className="h-7 w-3/4 bg-zinc-200 rounded" />{" "}
                {/* Card Title */}
                {/* Progress bar skeleton */}
                <div className="py-1 max-w-md space-y-2">
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full" />
                  <div className="h-3 w-28 bg-zinc-200 rounded" />
                </div>
                {/* Description lines */}
                <div className="space-y-2 pt-1">
                  <div className="h-4 w-full bg-zinc-200 rounded" />
                  <div className="h-4 w-5/6 bg-zinc-200 rounded" />
                </div>
              </div>
              {/* Button skeleton */}
              <div className="pt-6 mt-auto">
                <div className="h-8 w-24 bg-zinc-200 rounded-lg" />
              </div>
            </div>
          </section>

          {/* Right Column: Recent Timeline Block Skeleton */}
          <section className="space-y-6">
            <div className="h-4 w-40 bg-zinc-200 rounded" />{" "}
            {/* Section Title */}
            <div className="border border-zinc-200 rounded-3xl divide-y divide-zinc-100 bg-white overflow-hidden min-h-70">
              {/* Timeline Item 1 */}
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 shrink-0" />{" "}
                  {/* Icon block */}
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-2/3 bg-zinc-200 rounded" />
                    <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                  </div>
                </div>
                <div className="h-5 w-5 bg-zinc-200 rounded shrink-0" />
              </div>

              {/* Timeline Item 2 */}
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 w-1/2 bg-zinc-200 rounded" />
                    <div className="h-3 w-1/3 bg-zinc-200 rounded" />
                  </div>
                </div>
                <div className="h-5 w-5 bg-zinc-200 rounded shrink-0" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
