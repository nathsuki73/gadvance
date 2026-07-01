"use client";

import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import SideBarNavItem from "./_components/SideBarNavItem";
import {
  getLessonState,
  isPostTestUnlocked,
} from "./_components/SideBarProgress";
import { ArrowLeft } from "lucide-react";

type LessonProgressItem = {
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

type Props = {
  moduleId: string;
  structureTitle?: string;
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
  isAdaptiveMode?: boolean;
  pretestCompleted?: boolean;
};

export default function ModuleSidebar({
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
}: Props) {
  const go = (id: string) => {
    onNavigate(id);
    if (mobileOpen) onCloseMobile();
    if (isCollapsed) onToggleCollapse();
  };
  const collapsedView = isCollapsed && !mobileOpen;
  const postUnlocked = isPostTestUnlocked(
    lessons,
    completedBlockIds,
    completedQuizLessons,
    lessonsProgress,
    pretestCompleted,
  );
  let idx = 0;

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-[290px] flex-col border-r border-zinc-200 bg-zinc-50/80 backdrop-blur-md transition-all duration-300 ease-in-out sm:w-[320px] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isCollapsed ? "lg:w-16" : "lg:w-80"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-4">
          <div className="flex w-full items-center justify-between gap-2 lg:hidden">
            <button
              onClick={() => window.history.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600"
              aria-label="Go back"
            >
              ‹
            </button>
            <span className="max-w-[180px] truncate text-sm font-semibold lowercase text-zinc-900">
              {structureTitle}
            </span>
            <button
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="hidden w-full items-center justify-between lg:flex">
            {!isCollapsed && (
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  curriculum
                </p>
                <h2 className="truncate text-sm font-semibold leading-snug text-zinc-800">
                  {structureTitle}
                </h2>
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 ${isCollapsed ? "mx-auto" : ""}`}
            >
              <button
                onClick={onToggleCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? "›" : "‹"}
              </button>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4 ">
          <SideBarNavItem
            index={idx++}
            label="Course Entry Pre-test"
            sublabel={
              pretestCompleted ? "baseline complete" : "diagnostic baseline"
            }
            dotColor="bg-violet-500"
            dotColorInactive="bg-violet-200"
            active={activeLessonId === "pre_test"}
            collapsed={collapsedView}
            stepCount={1}
            completedSteps={pretestCompleted ? 1 : 0}
            onClick={() => go("pre_test")}
          />

          {lessons.map((lesson, i) => {
            const { stepCount, completedSteps, isUnlocked } = getLessonState(
              lesson,
              i,
              lessons,
              completedBlockIds,
              completedQuizLessons,
              lessonsProgress,
              pretestCompleted,
              isAdaptiveMode,
            );
            return (
              <SideBarNavItem
                key={lesson.id}
                index={idx++}
                label={lesson.title}
                sublabel={`${completedSteps}/${stepCount} completed`}
                dotColor="bg-blue-500"
                dotColorInactive="bg-blue-200"
                active={activeLessonId === lesson.id}
                locked={!isUnlocked}
                collapsed={collapsedView}
                stepCount={stepCount}
                completedSteps={completedSteps}
                onClick={() => isUnlocked && go(lesson.id)}
              />
            );
          })}

          <SideBarNavItem
            index={idx++}
            label="Course Final Post-test"
            sublabel="summative validation"
            dotColor="bg-amber-500"
            dotColorInactive="bg-amber-200"
            active={activeLessonId === "post_test"}
            locked={!postUnlocked}
            collapsed={collapsedView}
            stepCount={1}
            completedSteps={0}
            onClick={() => postUnlocked && go("post_test")}
          />
        </div>

        <div className="shrink-0 border-t border-zinc-200 bg-white/80 p-3">
          <button
            onClick={() => window.history.back()}
            aria-label="Exit module"
            className={`flex  items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 ${
              collapsedView
                ? "w-full h-10 w-10 justify-center"
                : "w-1/3 gap-2 px-3 py-2.5"
            }`}
          >
            <ArrowLeft size={16} className="shrink-0" />
            {!collapsedView && (
              <span className="text-xs font-medium">Exit</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
