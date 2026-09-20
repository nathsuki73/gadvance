"use client";

import React from "react";

export function LearnPageSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-white text-zinc-900 overflow-hidden animate-pulse">
      {/* 1. Sidebar Skeleton matching ModuleSidebar layout */}
      <aside className="fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col border-r border-zinc-200 bg-zinc-50/90 sm:w-80 lg:translate-x-0">
        {/* Header Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-4">
          <div className="h-4 bg-zinc-200 rounded-md w-3/4"></div>
          <div className="h-8 w-8 bg-zinc-200 rounded-md"></div>
        </div>

        {/* Sections & Navigation Items List Skeleton */}
        <div className="flex-1 space-y-6 overflow-hidden px-3 py-4">
          {/* Section Block 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="h-4 w-4 rounded-full bg-zinc-200 shrink-0"></div>
              <div className="h-3.5 bg-zinc-200 rounded w-1/2"></div>
            </div>
            <div className="space-y-1.5 pl-3">
              <div className="h-9 bg-zinc-200/70 rounded-xl w-full"></div>
              <div className="h-9 bg-zinc-200/40 rounded-xl w-full"></div>
              <div className="h-9 bg-zinc-200/40 rounded-xl w-full"></div>
            </div>
          </div>

          {/* Section Block 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="h-4 w-4 rounded-full bg-zinc-200 shrink-0"></div>
              <div className="h-3.5 bg-zinc-200 rounded w-2/3"></div>
            </div>
            <div className="space-y-1.5 pl-3">
              <div className="h-9 bg-zinc-200/40 rounded-xl w-full"></div>
              <div className="h-9 bg-zinc-200/40 rounded-xl w-full"></div>
            </div>
          </div>
        </div>

        {/* Footer Exit Button Skeleton */}
        <div className="shrink-0 border-t border-zinc-200 bg-white/80 p-3">
          <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
        </div>
      </aside>

      {/* 2. Main Content Viewport Skeleton */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden lg:pl-80">
        {/* Mobile Top Bar Skeleton */}
        <div className="flex h-14 items-center border-b border-zinc-200 bg-white px-4 lg:hidden">
          <div className="h-9 w-9 bg-zinc-200 rounded-lg"></div>
          <div className="h-4 bg-zinc-200 rounded-md w-1/3 ml-3"></div>
        </div>

        {/* Content Body Skeleton */}
        <div className="flex-1 overflow-y-auto px-6 py-12 lg:px-16 space-y-8">
          <div className="space-y-3 max-w-3xl">
            <div className="h-8 bg-zinc-200 rounded-lg w-2/3"></div>
            <div className="h-4 bg-zinc-100 rounded-md w-1/4"></div>
          </div>

          <div className="space-y-4 pt-4 max-w-3xl">
            <div className="h-4 bg-zinc-200 rounded-md w-full"></div>
            <div className="h-4 bg-zinc-200 rounded-md w-11/12"></div>
            <div className="h-4 bg-zinc-200 rounded-md w-4/5"></div>
          </div>

          <div className="h-48 bg-zinc-100 rounded-2xl w-full max-w-3xl border border-zinc-200/50"></div>

          <div className="space-y-4 max-w-3xl">
            <div className="h-4 bg-zinc-200 rounded-md w-full"></div>
            <div className="h-4 bg-zinc-200 rounded-md w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
