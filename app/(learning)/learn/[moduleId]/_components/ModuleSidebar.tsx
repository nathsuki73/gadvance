"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  X,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type ModuleSidebarProps = {
  structureTitle: string;
  lessons: Lesson[];
  activeLessonId: string;
  onNavigate: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const ModuleSidebar = ({
  structureTitle,
  lessons,
  activeLessonId,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: ModuleSidebarProps) => {
  return (
    <>
      {/* MOBILE CANVAS OVERLAY */}
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation sidebar"
        />
      )}

      {/* SIDEBAR WRAPPER HOUSING CANVAS */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-dvh
          border-r border-zinc-200
          bg-zinc-50/80 backdrop-blur-md
          transition-all duration-300 ease-in-out
          flex flex-col 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          w-[290px] sm:w-[320px]
          ${isCollapsed ? "lg:w-16" : "lg:w-80"}
        `}
      >
        {/* SIDEBAR ACCENT TOPPING HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 shrink-0">
          {/* MOBILE PORTVIEW BRANDING HEADER */}
          <div className="flex w-full items-center justify-between gap-2 lg:hidden">
            <button
              onClick={() => window.history.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </button>

            <span className="max-w-[180px] truncate text-sm font-semibold text-zinc-900 lowercase">
              {structureTitle}
            </span>

            <button
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* DESKTOP DESK INTEGRATED HEADER */}
          <div className="hidden w-full items-center justify-between lg:flex">
            {!isCollapsed && (
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
                  curriculum
                </p>
                <h2 className="truncate text-sm font-semibold text-zinc-800 leading-snug">
                  {structureTitle}
                </h2>
              </div>
            )}

            <div
              className={`flex items-center gap-1.5 ${isCollapsed ? "mx-auto" : ""}`}
            >
              {!isCollapsed && (
                <button
                  onClick={() => window.history.back()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                  aria-label="Go back"
                >
                  <ArrowLeft size={14} />
                </button>
              )}

              <button
                onClick={onToggleCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronLeft size={14} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* WORKSPACE ITEMS SCROLLBAR LIST */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {lessons.map((lesson, index) => {
              const isActive = activeLessonId === lesson.id;
              const stepCount =
                (lesson.blocks?.length || 0) +
                (lesson.quiz_blocks?.length || 0);

              /*
              |--------------------------------------------------------------------------
              | COMPRESSED HERO ICON SLOTS (SIDEBAR COLLAPSED DETACHED MODE)
              |--------------------------------------------------------------------------
              */
              if (isCollapsed && !mobileOpen) {
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      onNavigate(lesson.id);
                      onToggleCollapse(); // Auto-expand layout when focused via minimalist docks
                    }}
                    className={`
                      hidden lg:flex
                      h-11 w-11 mx-auto
                      items-center justify-center
                      rounded-xl transition-all duration-150
                      ${
                        isActive
                          ? "bg-purple-50 text-[#8b5cf6]"
                          : "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700"
                      }
                    `}
                    title={lesson.title}
                  >
                    <BookOpen size={18} />
                  </button>
                );
              }

              /*
              |--------------------------------------------------------------------------
              | INTEGRATED FLAT ROW ENTRIES LIST (SIDEBAR FULL EXPANDED VIEW)
              |--------------------------------------------------------------------------
              */
              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    onNavigate(lesson.id);
                    if (mobileOpen) onCloseMobile();
                  }}
                  className={`
                    flex w-full items-start gap-3
                    rounded-xl border border-transparent
                    px-3 py-3 text-left
                    transition-all duration-150
                    ${
                      isActive
                        ? "bg-purple-50/70 border-purple-100/50 text-[#8b5cf6]"
                        : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"
                    }
                  `}
                >
                  {/* STEP SEQUENCE DIGIT TAG */}
                  <span
                    className={`text-[10px] font-mono font-bold pt-0.5 shrink-0 ${isActive ? "text-[#8b5cf6]" : "text-zinc-300"}`}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </span>

                  {/* LESSON DETAILS COMPILATION TEXTS */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p
                      className={`text-xs font-medium leading-tight break-words ${isActive ? "font-semibold text-zinc-900" : "text-zinc-700"}`}
                    >
                      {lesson.title}
                    </p>
                    <p
                      className={`text-[11px] font-light lowercase ${isActive ? "text-[#8b5cf6]/80" : "text-zinc-400"}`}
                    >
                      {stepCount} learning {stepCount === 1 ? "step" : "steps"}
                    </p>
                  </div>

                  {/* ACTIVE INDICATOR BLOTS */}
                  {isActive && (
                    <Circle
                      size={6}
                      className="fill-[#8b5cf6] text-[#8b5cf6] shrink-0 mt-1.5 animate-pulse"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default ModuleSidebar;
