"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import { LessonDonutProgress } from "./LessonDonutProgress";

type ModuleSidebarProps = {
  structureTitle: string;
  lessons: Lesson[];
  activeLessonId: string;
  completedBlockIds?: string[];
  completedQuizLessons?: string[];
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
  completedBlockIds = [],
  completedQuizLessons = [],
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
        {/* SIDEBAR HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 shrink-0">
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

        {/* LIST CONTAINER */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {lessons.map((lesson, index) => {
              const isActive = activeLessonId === lesson.id;

              const totalBlocks = lesson.blocks?.length || 0;
              const totalQuizQuestions = lesson.quiz_blocks?.length || 0;

              // 🎯 MIRROR THE EXACT VIEWPORT HOUSING RULES:
              const isStandaloneQuizPage =
                totalQuizQuestions > 0 && totalBlocks === 0;

              // 🎯 FIXED REAL TIME STEP COUNT:
              // Dedicated test views map over question arrays (e.g., 24 items).
              // Composite pages count text/video content items (the quiz runs as 1 final inline checker widget).
              const stepCount = isStandaloneQuizPage
                ? totalQuizQuestions
                : totalBlocks + totalQuizQuestions;

              // Calculate standard content block progress
              const completedBlocksCount = (lesson.blocks || []).filter((b) =>
                completedBlockIds.includes(b.id),
              ).length;

              // Verify overall parent lesson status flags
              const isQuizFinishedInDb = completedQuizLessons.includes(
                lesson.id,
              );

              // 🎯 FIXED COMPLETED STEPS ACCUMULATOR:
              let totalCompletedSteps = 0;
              let isEntirelyDone = false;

              if (isStandaloneQuizPage) {
                // Standalone diagnostics count sub-questions
                totalCompletedSteps = (lesson.quiz_blocks || []).filter((q) =>
                  completedBlockIds.includes(q.id),
                ).length;
                isEntirelyDone =
                  totalCompletedSteps === stepCount && stepCount > 0;
              } else {
                // Content pages read tracking markers straight out of their standard blocks array
                const completedQuizzesCount = (lesson.quiz_blocks || []).filter(
                  (q) => completedBlockIds.includes(q.id),
                ).length;

                totalCompletedSteps =
                  completedBlocksCount + completedQuizzesCount;
                isEntirelyDone =
                  totalCompletedSteps === stepCount && stepCount > 0;
              }

              // Apply database completion overrides smoothly
              if (isQuizFinishedInDb) {
                totalCompletedSteps = stepCount;
                isEntirelyDone = true;
              }

              /*
              |--------------------------------------------------------------------------
              | SIDEBAR COLLAPSED DETACHED MODE
              |--------------------------------------------------------------------------
              */
              if (isCollapsed && !mobileOpen) {
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      onNavigate(lesson.id);
                      onToggleCollapse();
                    }}
                    className={`
                      hidden lg:flex relative h-11 w-11 mx-auto items-center justify-center
                      rounded-xl transition-all duration-150
                      ${isActive ? "bg-purple-50 text-[#8b5cf6]" : "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700"}
                    `}
                    title={`${lesson.title} (${totalCompletedSteps}/${stepCount} completed)`}
                  >
                    <BookOpen size={18} />
                    <div className="absolute right-0.5 bottom-0.5 bg-white rounded-full p-0.5">
                      <LessonDonutProgress
                        totalSteps={stepCount}
                        completedSteps={totalCompletedSteps}
                        size={12}
                        strokeWidth={1.5}
                      />
                    </div>
                  </button>
                );
              }

              /*
              |--------------------------------------------------------------------------
              | SIDEBAR FULL EXPANDED VIEW
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
                    flex w-full items-center gap-3 rounded-xl border border-transparent
                    px-3 py-3 text-left transition-all duration-150
                    ${isActive ? "bg-purple-50/70 border-purple-100/50 text-[#8b5cf6]" : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"}
                  `}
                >
                  {/* STEP SEQUENCE DIGIT TAG */}
                  <span
                    className={`text-[10px] font-mono font-bold pt-0.5 shrink-0 ${isActive ? "text-[#8b5cf6]" : "text-zinc-300"}`}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </span>

                  {/* DETAILS TEXT BLOCK */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p
                      className={`text-xs font-medium leading-tight break-words ${isActive ? "font-semibold text-zinc-900" : "text-zinc-700"}`}
                    >
                      {lesson.title}
                    </p>

                    {isEntirelyDone ? (
                      <p className="text-[11px] font-medium text-emerald-600 lowercase tracking-wide">
                        complete ✓
                      </p>
                    ) : (
                      <p
                        className={`text-[11px] font-light lowercase ${isActive ? "text-[#8b5cf6]/80" : "text-zinc-400"}`}
                      >
                        {totalCompletedSteps}/{stepCount} completed
                      </p>
                    )}
                  </div>

                  <LessonDonutProgress
                    totalSteps={stepCount}
                    completedSteps={totalCompletedSteps}
                    size={20}
                    strokeWidth={2}
                  />
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
