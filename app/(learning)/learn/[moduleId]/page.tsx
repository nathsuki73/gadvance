"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar from "./_components/ModuleSidebar";
import ModuleSectionViewer from "./_components/ModuleSectionViewer";
import type { ModuleResponse } from "./types";
import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

// 🎯 1. UPGRADED TYPES: Add tracking definitions returned by our Laravel model tables
type ProgressData = {
  completed_blocks: number;
  total_blocks: number;
  percentage: number;
  completed_block_ids: string[];
  completed_quiz_lessons: string[]; // Tracks completely finished quiz lesson rows
  active_quiz_lesson_id: string | null; // Pointer to resume an ongoing active test
  active_quiz_attempt_id: string | null;
};

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);

  // Layout & UI State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState("");

  // Data Fetching State
  const [module, setModule] = useState<ModuleResponse | null>(null);

  // 🎯 2. UPGRADED STATE MAPS: Initialize tracking properties matching our backend schemas
  const [progressData, setProgressData] = useState<ProgressData>({
    completed_blocks: 0,
    total_blocks: 0,
    percentage: 0,
    completed_block_ids: [],
    completed_quiz_lessons: [],
    active_quiz_lesson_id: null,
    active_quiz_attempt_id: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleQuizBlockCompleted = (blockId: string) => {
    setProgressData((prev) => {
      if (prev.completed_block_ids.includes(blockId)) {
        return prev;
      }

      return {
        ...prev,
        completed_block_ids: [...prev.completed_block_ids, blockId],
      };
    });
  };

  /*
  |--------------------------------------------------------------------------
  | DATA EXTRACTION & WORKSPACE AUTO-FOCUS POINTER ROUTING
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;
      try {
        setLoading(true);

        const result = await getLearningModule(moduleId);

        if (!result.success || !result.data) throw new Error();

        setModule(result.data as unknown as ModuleResponse);

        // 🎯 3. UPGRADED SYNC: Map the extended relational telemetry fields down securely
        if (result.progress) {
          setProgressData({
            completed_blocks: result.progress.completed_blocks ?? 0,
            total_blocks: result.progress.total_blocks ?? 0,
            percentage: result.progress.percentage ?? 0,
            completed_block_ids: result.progress.completed_block_ids ?? [],
            completed_quiz_lessons:
              result.progress.completed_quiz_lessons ?? [],
            active_quiz_lesson_id:
              result.progress.active_quiz_lesson_id ?? null,
            active_quiz_attempt_id:
              result.progress.active_quiz_attempt_id ?? null,
          });
        }

        const moduleLessons = result.data.lessons || [];
        const fallbackLesson = moduleLessons[0];

        // 🎯 4. BULLPROOF AUTO-FOCUS ROUTER ENGINE:
        // Case A: If they left off in the middle of a test, restore that exact lesson container right away!
        if (result.progress?.active_quiz_lesson_id) {
          setActiveLessonId(result.progress.active_quiz_lesson_id);
        } else {
          // Case B: Find the first uncompleted checkpoint in their progress lists to jump forward to
          const firstIncompleteLesson = moduleLessons.find((lesson: any) => {
            const hasUnviewedBlocks = lesson.blocks?.some(
              (b: any) => !result.progress?.completed_block_ids?.includes(b.id),
            );
            const hasUnfinishedQuiz =
              (lesson.quiz_blocks?.length ?? 0) > 0 &&
              !result.progress?.completed_quiz_lessons?.includes(lesson.id);

            return hasUnviewedBlocks || hasUnfinishedQuiz;
          });

          setActiveLessonId(
            firstIncompleteLesson?.id || fallbackLesson?.id || "",
          );
        }
      } catch (err) {
        console.error("LearnPage Hydration Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  // Safely extract our sequential list of lessons
  const lessons = useMemo<Lesson[]>(() => {
    if (!module || !module.lessons) return [];
    return Array.isArray(module.lessons) ? module.lessons : [module.lessons];
  }, [module]);

  const currentIndex = useMemo(() => {
    return lessons.findIndex((l) => l.id === activeLessonId);
  }, [lessons, activeLessonId]);

  const activeLesson = lessons[currentIndex];

  // Navigation Event Actions
  const handleLessonChange = (id: string) => {
    setActiveLessonId(id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    const next = lessons[currentIndex + 1];
    if (next) handleLessonChange(next.id);
  };

  const handlePrevious = () => {
    const previous = lessons[currentIndex - 1];
    if (previous) handleLessonChange(previous.id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <Loader2 size={32} className="animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  if (error || !module || !activeLesson) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#ffffff]">
      <ModuleSidebar
        structureTitle={module.title}
        lessons={lessons}
        activeLessonId={activeLessonId}
        completedBlockIds={progressData.completed_block_ids}
        // 🎯 5. EXTENDED SIDEBAR CHANNELS:
        // Pass completed quiz flags down so checkboxes can light up correctly
        completedQuizLessons={progressData.completed_quiz_lessons}
        onNavigate={handleLessonChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile Top Navigation Sticky Bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
          aria-label="Open sidebar layout"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 truncate text-sm font-semibold text-zinc-900">
          {module.title}
        </span>
      </div>

      {/* Main Workspace Layout Canvas */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"}
        `}
      >
        {/* Viewer renders active lesson content */}
        <ModuleSectionViewer
          lesson={activeLesson}
          currentIndex={currentIndex}
          totalSections={lessons.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === lessons.length - 1}
          onQuizBlockCompleted={handleQuizBlockCompleted}
        />
      </div>
    </main>
  );
};

export default LearnPage;
