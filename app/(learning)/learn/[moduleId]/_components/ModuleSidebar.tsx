"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  BookOpen,
  Lock,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import { LessonDonutProgress } from "./LessonDonutProgress";
import { getStaticTest } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";

type LessonProgressItem = {
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

type ModuleSidebarProps = {
  moduleId: string;
  structureTitle: string | undefined;
  lessons: Lesson[];
  activeLessonId: string; // 💡 Pass "pre_test" or "post_test" from your page wrapper to highlight them
  completedBlockIds?: string[];
  completedQuizLessons?: string[];
  lessonsProgress: Record<string, LessonProgressItem>;
  onNavigate: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isAdaptiveMode?: boolean;
  pretestCompleted?: boolean;
};

const ModuleSidebar = ({
  moduleId,
  structureTitle,
  lessons = [],
  activeLessonId,
  completedBlockIds = [],
  completedQuizLessons = [],
  lessonsProgress = {},
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  isAdaptiveMode = false,
  pretestCompleted = false,
}: ModuleSidebarProps) => {
  // 💡 Async state flags to verify assessment existence on the fly
  const [hasPreTest, setHasPreTest] = useState(false);
  const [hasPostTest, setHasPostTest] = useState(false);

  // 💡 Keep async matching perfectly with the list component
  useEffect(() => {
    let isMounted = true;
    const checkAssessments = async () => {
      try {
        const [preRes, postRes] = await Promise.all([
          getStaticTest(moduleId, "pre_test"),
          getStaticTest(moduleId, "post_test"),
        ]);

        if (isMounted) {
          if (preRes.success && preRes.data) setHasPreTest(true);
          if (postRes.success && postRes.data) setHasPostTest(true);
        }
      } catch (err) {
        console.error("Sidebar assessment link initialization failed:", err);
      }
    };
    checkAssessments();
    return () => {
      isMounted = false;
    };
  }, [moduleId]);

  // Track layout indexing sequences continuously across execution frames
  let runningIndex = 0;

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
          adaptive-sidebar-item pointer-events-auto
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
            {/* 💡 ENTRY ASSESSMENT LAYER: PRE-TEST */}
            {hasPreTest &&
              (() => {
                const currentNum = runningIndex++;
                const isPreTestActive = activeLessonId === "pre_test";
                const pretestProgress = pretestCompleted ? 1 : 0;

                if (isCollapsed && !mobileOpen) {
                  return (
                    <button
                      key="sidebar-pre-test"
                      onClick={() => {
                        onNavigate("pre_test");
                        onToggleCollapse();
                      }}
                      className={`hidden lg:flex relative h-11 w-11 mx-auto items-center justify-center rounded-xl transition-all duration-150 ${isPreTestActive ? "bg-purple-50 text-[#8b5cf6]" : "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700"}`}
                      title="Course Entry Pre-test"
                    >
                      <ClipboardCheck
                        size={18}
                        className={
                          isPreTestActive ? "text-[#8b5cf6]" : "text-zinc-400"
                        }
                      />
                      <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm">
                        <LessonDonutProgress
                          totalSteps={1}
                          completedSteps={pretestProgress}
                          size={12}
                          strokeWidth={1.5}
                        />
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key="sidebar-pre-test"
                    onClick={() => {
                      onNavigate("pre_test");
                      if (mobileOpen) onCloseMobile();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-150 ${isPreTestActive ? "bg-purple-50/70 border-purple-100/50 text-[#8b5cf6]" : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"}`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold pt-0.5 shrink-0 ${isPreTestActive ? "text-primary" : "text-zinc-300"}`}
                    >
                      {currentNum.toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p
                        className={`text-xs font-medium leading-tight break-words ${isPreTestActive ? "font-semibold text-zinc-900" : "text-zinc-700"}`}
                      >
                        Course Entry Pre-test
                      </p>
                      <p
                        className={`text-[11px] font-light lowercase ${isPreTestActive ? "text-primary/80" : "text-zinc-400"}`}
                      >
                        {pretestCompleted
                          ? "baseline complete"
                          : "diagnostic baseline"}
                      </p>
                    </div>
                    <LessonDonutProgress
                      totalSteps={1}
                      completedSteps={pretestProgress}
                      size={20}
                      strokeWidth={2}
                    />
                  </button>
                );
              })()}

            {/* CORE CURRICULUM TOPICS MAP LAYER */}
            {lessons.map((lesson, index) => {
              const isActive = activeLessonId === lesson.id;
              const totalBlocks = lesson.blocks?.length || 0;
              const totalQuizQuestions = lesson.quiz_blocks?.length || 0;

              const isStandaloneQuizPage =
                totalQuizQuestions > 0 && totalBlocks === 0;
              const stepCount = isStandaloneQuizPage
                ? totalQuizQuestions
                : totalBlocks;

              const completedBlocksCount = (lesson.blocks || []).filter((b) =>
                completedBlockIds.includes(b.id),
              ).length;

              const isQuizFinishedInDb = completedQuizLessons.includes(
                lesson.id,
              );

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

              const canAccessLessons = !hasPreTest || pretestCompleted;
              let isUnlocked =
                isAdaptiveMode || (canAccessLessons && index === 0);
              if (!isAdaptiveMode && index > 0) {
                const previousLesson = lessons[index - 1];
                const prevServerProgress = lessonsProgress[previousLesson.id];

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
                  canAccessLessons &&
                  (prevFinishedInDb ||
                    prevDoneCalculated ||
                    !!prevServerProgress?.is_completed);
              }

              const currentNum = runningIndex++;

              /* DETACHED COMPACT CONTAINER VIEW */
              if (isCollapsed && !mobileOpen) {
                return (
                  <button
                    key={lesson.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      onNavigate(lesson.id);
                      onToggleCollapse();
                    }}
                    className={`hidden lg:flex relative h-11 w-11 mx-auto items-center justify-center rounded-xl transition-all duration-150 pointer-events-auto ${!isUnlocked ? "opacity-40 cursor-not-allowed text-zinc-300" : isActive ? "bg-purple-50 text-[#8b5cf6]" : "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700"}`}
                    title={
                      !isUnlocked
                        ? "Complete preceding topics to unlock"
                        : `${lesson.title}`
                    }
                  >
                    {!isUnlocked ? (
                      <Lock size={16} className="text-zinc-400" />
                    ) : (
                      <>
                        <BookOpen
                          size={18}
                          className={
                            isActive ? "text-[#8b5cf6]" : "text-zinc-400"
                          }
                        />
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

              /* STANDALONE EXPANDED CONTAINER VIEW */
              return (
                <button
                  key={lesson.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (!isUnlocked) return;
                    onNavigate(lesson.id);
                    if (mobileOpen) onCloseMobile();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-150 pointer-events-auto ${!isUnlocked ? "opacity-50 cursor-not-allowed bg-zinc-100/30 text-zinc-400 select-none" : isActive ? "bg-purple-50/70 border-purple-100/50 text-[#8b5cf6]" : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"}`}
                >
                  {!isUnlocked ? (
                    <div className="w-[14px] flex items-center justify-center shrink-0">
                      <Lock size={12} className="text-zinc-300" />
                    </div>
                  ) : (
                    <span
                      className={`text-[10px] font-mono font-bold pt-0.5 shrink-0 ${isActive ? "text-primary" : "text-zinc-300"}`}
                    >
                      {currentNum.toString().padStart(2, "0")}
                    </span>
                  )}

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

            {/* 💡 EXIT ASSESSMENT LAYER: POST-TEST */}
            {hasPostTest &&
              (() => {
                const currentNum = runningIndex++;
                const isPostTestActive = activeLessonId === "post_test";
                const isUnlocked =
                  pretestCompleted &&
                  lessons.every((lesson) => {
                    const completedSteps = lesson.quiz_blocks?.length || 0;
                    return (
                      completedSteps === 0 ||
                      completedBlockIds.includes(lesson.id) ||
                      completedQuizLessons.includes(lesson.id)
                    );
                  });

                if (isCollapsed && !mobileOpen) {
                  return (
                    <button
                      key="sidebar-post-test"
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (!isUnlocked) return;
                        onNavigate("post_test");
                        onToggleCollapse();
                      }}
                      className={`hidden lg:flex relative h-11 w-11 mx-auto items-center justify-center rounded-xl transition-all duration-150 ${!isUnlocked ? "opacity-40 cursor-not-allowed text-zinc-300" : isPostTestActive ? "bg-purple-50 text-[#8b5cf6]" : "text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700"}`}
                      title={
                        !isUnlocked
                          ? "Complete the module to unlock"
                          : "Course Final Post-test"
                      }
                    >
                      {!isUnlocked ? (
                        <Lock size={16} className="text-zinc-400" />
                      ) : (
                        <GraduationCap
                          size={18}
                          className={
                            isPostTestActive
                              ? "text-[#8b5cf6]"
                              : "text-zinc-400"
                          }
                        />
                      )}
                      {isUnlocked && (
                        <div className="absolute -right-1 -bottom-1 bg-white rounded-full p-0.5 shadow-sm">
                          <LessonDonutProgress
                            totalSteps={1}
                            completedSteps={0}
                            size={12}
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key="sidebar-post-test"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (!isUnlocked) return;
                      onNavigate("post_test");
                      if (mobileOpen) onCloseMobile();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-all duration-150 ${!isUnlocked ? "opacity-50 cursor-not-allowed bg-zinc-100/30 text-zinc-400 select-none" : isPostTestActive ? "bg-purple-50/70 border-purple-100/50 text-[#8b5cf6]" : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"}`}
                  >
                    {!isUnlocked ? (
                      <div className="w-[14px] flex items-center justify-center shrink-0">
                        <Lock size={12} className="text-zinc-300" />
                      </div>
                    ) : (
                      <span
                        className={`text-[10px] font-mono font-bold pt-0.5 shrink-0 ${isPostTestActive ? "text-primary" : "text-zinc-300"}`}
                      >
                        {currentNum.toString().padStart(2, "0")}
                      </span>
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p
                        className={`text-xs font-medium leading-tight break-words ${!isUnlocked ? "text-zinc-400 font-normal" : isPostTestActive ? "font-semibold text-zinc-900" : "text-zinc-700"}`}
                      >
                        Course Final Post-test
                      </p>
                      <p
                        className={`text-[11px] font-light lowercase ${!isUnlocked ? "text-zinc-300" : isPostTestActive ? "text-primary/80" : "text-zinc-400"}`}
                      >
                        {isUnlocked ? "summative validation" : "locked 🔒"}
                      </p>
                    </div>
                    {isUnlocked && (
                      <LessonDonutProgress
                        totalSteps={1}
                        completedSteps={0}
                        size={20}
                        strokeWidth={2}
                      />
                    )}
                  </button>
                );
              })()}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default ModuleSidebar;
