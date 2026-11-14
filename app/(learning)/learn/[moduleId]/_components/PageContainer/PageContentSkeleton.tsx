"use client";

import React from "react";

export function PageContentSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-8 sm:py-12 animate-pulse space-y-6">
      {/* Title Placeholder */}
      <div className="space-y-3">
        <div className="h-7 bg-zinc-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-zinc-100 rounded-md w-1/2"></div>
      </div>

      {/* Paragraph Lines Skeleton */}
      <div className="space-y-3 pt-6">
        <div className="h-4 bg-zinc-200 rounded-md w-full"></div>
        <div className="h-4 bg-zinc-200 rounded-md w-11/12"></div>
        <div className="h-4 bg-zinc-200 rounded-md w-4/5"></div>
      </div>

      {/* Block Placeholder / Card Box */}
      <div className="h-40 bg-zinc-100 rounded-2xl w-full border border-zinc-200/60 my-6"></div>

      {/* More Paragraph Lines */}
      <div className="space-y-3">
        <div className="h-4 bg-zinc-200 rounded-md w-full"></div>
        <div className="h-4 bg-zinc-200 rounded-md w-5/6"></div>
        <div className="h-4 bg-zinc-200 rounded-md w-2/3"></div>
      </div>
    </div>
  );
}
