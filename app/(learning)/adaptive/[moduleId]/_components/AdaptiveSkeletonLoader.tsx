"use client";

import React from "react";

export default function AdaptiveSkeletonLoader() {
  return (
    <div className="min-h-screen bg-white px-6 py-10 sm:px-12 lg:px-16">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-10 border-b border-zinc-100 pb-6 animate-pulse">
          <div className="h-3 w-32 bg-linear-to-r from-zinc-200 to-zinc-100 rounded mb-3" />
          <div className="h-8 w-72 bg-linear-to-r from-zinc-200 to-zinc-100 rounded mb-4" />
          <div className="h-4 w-96 bg-linear-to-r from-zinc-100 to-zinc-50 rounded" />
        </div>

        {/* Adaptive Recipe Banner Skeleton */}
        <div className="mb-8 rounded-3xl border border-zinc-100 bg-zinc-50/50 p-5 animate-pulse">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="h-2 w-48 bg-linear-to-r from-zinc-200 to-zinc-100 rounded mb-3" />
              <div className="h-6 w-full max-w-md bg-linear-to-r from-zinc-200 to-zinc-100 rounded mb-2" />
              <div className="h-4 w-full max-w-2xl bg-linear-to-r from-zinc-100 to-zinc-50 rounded mb-4" />
              <div className="h-4 w-96 bg-linear-to-r from-zinc-100 to-zinc-50 rounded" />
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 h-20 w-32">
              <div className="h-2 w-16 bg-linear-to-r from-zinc-200 to-zinc-100 rounded mb-2" />
              <div className="h-6 w-24 bg-linear-to-r from-zinc-200 to-zinc-100 rounded" />
            </div>
          </div>

          {/* Tags skeleton */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-6 w-24 bg-linear-to-r from-zinc-100 to-zinc-50 rounded-full" />
            <div className="h-6 w-28 bg-linear-to-r from-zinc-100 to-zinc-50 rounded-full" />
            <div className="h-6 w-20 bg-linear-to-r from-zinc-100 to-zinc-50 rounded-full" />
          </div>
        </div>

        {/* Content Blocks Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-100 bg-white p-6 sm:p-8 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Block header */}
              <div className="mb-6 border-b border-zinc-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-linear-to-r from-zinc-200 to-zinc-100" />
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-linear-to-r from-zinc-200 to-zinc-100 rounded" />
                  </div>
                </div>
              </div>

              {/* Block content lines */}
              <div className="space-y-3">
                <div className="h-4 w-full bg-linear-to-r from-zinc-100 to-zinc-50 rounded" />
                <div className="h-4 w-full bg-linear-to-r from-zinc-100 to-zinc-50 rounded" />
                <div className="h-4 w-4/5 bg-linear-to-r from-zinc-100 to-zinc-50 rounded" />
              </div>

              {/* Block media placeholder */}
              <div className="mt-6 aspect-video w-full rounded-xl bg-linear-to-r from-zinc-200 to-zinc-100" />
            </div>
          ))}
        </div>

        {/* Footer Navigation Skeleton */}
        <div className="mt-20 border-t border-zinc-100 pt-8 flex justify-center animate-pulse">
          <div className="h-12 w-48 rounded-full bg-linear-to-r from-zinc-200 to-zinc-100" />
        </div>

        {/* Loading Status */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 py-12">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8b5cf6] animate-spin" />
          </div>
          <p className="text-sm font-medium text-zinc-600">
            Generating personalized content...
          </p>
          <p className="text-xs text-zinc-400 text-center max-w-sm">
            We're fetching and organizing your adaptive lesson content based on
            your learning preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
