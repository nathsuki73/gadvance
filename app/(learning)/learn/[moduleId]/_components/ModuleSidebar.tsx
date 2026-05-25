"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  BookOpen,
  Lock, // 🌟 Added Lock icon from Lucide for clear visual feedback
} from "lucide-react";

import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import { LessonDonutProgress } from "./LessonDonutProgress";

type LessonProgressItem = {
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

type ModuleSidebarProps = {
  structureTitle: string;
  lessons: Lesson[];
  activeLessonId: string;
  completedBlockIds?: string[];
  completedQuizLessons?: string[];
  lessonsProgress: Record<string, LessonProgressItem>;
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
  lessonsProgress = {},
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
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
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
              const stepCount = isStandaloneQuizPage
                ? totalQuizQuestions
                : totalBlocks;

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
                totalCompletedSteps = (lesson.quiz_blocks || []).filter((q) =>
                  completedBlockIds.includes(q.id),
                ).length;

                if (totalCompletedSteps === 0 && lessonsProgress[lesson.id]) {
                  totalCompletedSteps =
                    lessonsProgress[lesson.id].completed_steps;
                }

                isEntirelyDone =
                  totalCompletedSteps === stepCount && stepCount > 0;
              } else {
                const completedQuizzesCount = (lesson.quiz_blocks || []).filter(
                  (q) => completedBlockIds.includes(q.id),
                ).length;

                totalCompletedSteps =
                  completedBlocksCount + completedQuizzesCount;

                if (totalCompletedSteps === 0 && lessonsProgress[lesson.id]) {
                  totalCompletedSteps =
                    lessonsProgress[lesson.id].completed_steps;
                }

                isEntirelyDone =
                  totalCompletedSteps === stepCount && stepCount > 0;
              }

              if (
                isQuizFinishedInDb ||
                lessonsProgress[lesson.id]?.is_completed
              ) {
                totalCompletedSteps = stepCount;
                isEntirelyDone = true;
              }

              totalCompletedSteps = Math.min(totalCompletedSteps, stepCount);

              // 🎯 LINEAR PROGRESS GATEKEEPER LOGIC:
              // Index 0 (Pre-test) is always unlocked.
              // Any subsequent lesson is ONLY unlocked if the lesson right before it is completely finished.
              let isUnlocked = index === 0;
              if (index > 0) {
                const previousLesson = lessons[index - 1];
                const prevServerProgress = lessonsProgress[previousLesson.id];

                // Check local runtime array completion states or fallback onto clean server snapshots
                const prevBlocksCount = (previousLesson.blocks || []).filter(
                  (b) => completedBlockIds.includes(b.id),
                ).length;
                const prevQuizzesCount = (
                  previousLesson.quiz_blocks || []
                ).filter((q) => completedBlockIds.includes(q.id)).length;
                const prevFinishedInDb = completedQuizLessons.includes(
                  previousLesson.id,
                );

                const isPrevStandaloneQuiz =
                  (previousLesson.quiz_blocks?.length || 0) > 0 &&
                  (previousLesson.blocks?.length || 0) === 0;
                const prevMaxSteps = isPrevStandaloneQuiz
                  ? previousLesson.quiz_blocks?.length || 0
                  : previousLesson.blocks?.length || 0;

                let prevCompletedCount = isPrevStandaloneQuiz
                  ? (previousLesson.quiz_blocks || []).filter((q) =>
                      completedBlockIds.includes(q.id),
                    ).length
                  : prevBlocksCount + prevQuizzesCount;

                if (prevCompletedCount === 0 && prevServerProgress) {
                  prevCompletedCount = prevServerProgress.completed_steps;
                }

                const prevDoneCalculated =
                  prevCompletedCount === prevMaxSteps && prevMaxSteps > 0;

                isUnlocked =
                  prevFinishedInDb ||
                  prevDoneCalculated ||
                  !!prevServerProgress?.is_completed;
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
                    disabled={!isUnlocked} // Prevent clicking locked items
                    onClick={() => {
                      if (!isUnlocked) return;
                      onNavigate(lesson.id);
                      onToggleCollapse();
                    }}
                    className={`
                      hidden lg:flex relative h-11 w-11 mx-auto items-center justify-center
                      rounded-xl transition-all duration-150
                      ${!isUnlocked ? "opacity-40 cursor-not-allowed text-zinc-300" : isActive ? "bg-purple-50 text-primary" : "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700"}
                    `}
                    title={
                      !isUnlocked
                        ? "Complete preceding topics to unlock"
                        : `${lesson.title} (${totalCompletedSteps}/${stepCount} completed)`
                    }
                  >
                    {!isUnlocked ? (
                      <Lock size={16} className="text-zinc-400" />
                    ) : (
                      <>
                        <BookOpen size={18} />
                        <div className="absolute right-0.5 bottom-0.5 bg-white rounded-full p-0.5">
                          <LessonDonutProgress
                            totalSteps={stepCount}
                            completedSteps={totalCompletedSteps}
                            size={12}
                            strokeWidth={1.5}
                          />
                        </div>
                      </>
                    )}
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
                  disabled={!isUnlocked} // Prevent clicking locked items
                  onClick={() => {
                    if (!isUnlocked) return;
                    onNavigate(lesson.id);
                    if (mobileOpen) onCloseMobile();
                  }}
                  className={`
                    flex w-full items-center gap-3 rounded-xl border border-transparent
                    px-3 py-3 text-left transition-all duration-150
                    ${!isUnlocked ? "opacity-50 cursor-not-allowed bg-zinc-100/30 text-zinc-400 select-none" : isActive ? "bg-purple-50/70 border-purple-100/50 text-primary" : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"}
                  `}
                >
                  {/* UNLOCKED DIGIT TAG OR LOCKED GRAPHIC MARKER */}
                  {!isUnlocked ? (
                    <div className="w-[14px] flex items-center justify-center shrink-0">
                      <Lock size={12} className="text-zinc-300" />
                    </div>
                  ) : (
                    <span
                      className={`text-[10px] font-mono font-bold pt-0.5 shrink-0 ${isActive ? "text-primary" : "text-zinc-300"}`}
                    >
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                  )}

                  {/* DETAILS TEXT BLOCK */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p
                      className={`text-xs font-medium leading-tight break-words ${!isUnlocked ? "text-zinc-400 font-normal" : isActive ? "font-semibold text-zinc-900" : "text-zinc-700"}`}
                    >
                      {lesson.title}
                    </p>

                    {!isUnlocked ? (
                      <p className="text-[10px] font-light text-zinc-300 lowercase tracking-wide">
                        locked 🔒
                      </p>
                    ) : isEntirelyDone ? (
                      <p className="text-[11px] font-medium text-emerald-600 lowercase tracking-wide">
                        complete ✓
                      </p>
                    ) : (
                      <p
                        className={`text-[11px] font-light lowercase ${isActive ? "text-primary/80" : "text-zinc-400"}`}
                      >
                        {totalCompletedSteps}/{stepCount} completed
                      </p>
                    )}
                  </div>

                  {isUnlocked && (
                    <LessonDonutProgress
                      totalSteps={stepCount}
                      completedSteps={totalCompletedSteps}
                      size={20}
                      strokeWidth={2}
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
