"use client";

import { useState } from "react";
import { Waypoints, X } from "lucide-react";

interface AnalyticsDrawerProps {
  moduleId: string;
  // You can pass progress data down here if the analytics panel needs it
  lessonProgress?: Record<string, Set<string>>;
  quizProgress?: Record<string, { completedSteps: number; totalSteps: number }>;
}

export default function AnalyticsDrawer({
  moduleId,
  lessonProgress,
  quizProgress,
}: AnalyticsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        title="View Analytics"
      >
        <Waypoints size={22} />
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Side Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-zinc-200 bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              Module Analytics
            </h3>
            <p className="text-xs text-zinc-500">ID: {moduleId}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-4">
          <p className="text-sm text-zinc-600">
            Your analytics widgets, charts, and progress summaries go here.
          </p>

          {/* Example of hook-in data usage */}
          {lessonProgress && (
            <div className="rounded-lg bg-zinc-50 p-4">
              <span className="text-xs font-medium text-zinc-400 uppercase">
                Lessons Started
              </span>
              <div className="text-xl font-bold text-zinc-800">
                {Object.keys(lessonProgress).length}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
