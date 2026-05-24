"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar from "./_components/ModuleSidebar";
import ModuleSectionViewer from "./_components/ModuleSectionViewer";
import type { ModuleResponse } from "./types";
import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import QuestionnaireModal from "./_components/QuestionnaireModal";
import { submitAdaptiveTelemetryAction } from "./actions";

type LessonProgressItem = {
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};
type LiveUpdatedLessonPayload = {
  lesson_id: string;
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

// 🎯 1. UPGRADED TYPES: Add tracking definitions returned by our Laravel model tables
type ProgressData = {
  completed_blocks: number;
  total_blocks: number;
  percentage: number;
  completed_block_ids: string[];
  completed_quiz_lessons: string[]; // Tracks completely finished quiz lesson rows
  active_quiz_lesson_id: string | null; // Pointer to resume an ongoing active test
  active_quiz_attempt_id: string | null;
  latest_activity_lesson_id: string | null;
  lessons_progress: Record<string, LessonProgressItem>;
};

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [modalOpen, setModalOpen] = useState(false);
  const [uiRecipes, setUiRecipes] = useState<Record<string, any>>({});
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    if (mode === "adaptive") {
      setModalOpen(true);
    }
  }, [mode]);

  const handleAdaptiveSetupAllLessons = async () => {
    // 🛡️ Guard Clause: Ensure your lessons repository array has hydrated in state first
    if (!lessons || lessons.length === 0) {
      console.warn(
        "⚠️ Loop deferred: Lessons repository list is empty or unhydrated.",
      );
      return;
    }

    setIsSyncingAll(true);
    console.log(
      `🔄 [Batch AI Synced] Triggering adaptive matrix logic loops over ${lessons.length} lessons...`,
    );

    // ⚡ Map each lesson into an independent asynchronous execution tracking line
    const syncPromises = lessons.map(async (lesson: any) => {
      const targetLessonId = lesson.id;

      try {
        console.log(
          `📡 Fetching recommendations for Lesson Node: [${targetLessonId}]`,
        );

        const response = await fetch("http://127.0.0.1:8000/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            lesson_id: targetLessonId,
            pretest_score: 12, // Pass target lesson scores dynamically if captured
            telemetry: {
              avg_time_spent: 60.0,
              retries: 0,
              quiz_accuracy: 0.7,
              engagement_score: 6.0,
              inactivity_count: 0,
              prefers_visual: true,
            },
          }),
        });

        if (!response.ok)
          throw new Error(`HTTP network error code ${response.status}`);
        const result = await response.json();

        if (result.status === "success" || result.recommended_blocks) {
          console.log(
            `✨ [Lesson Synced Live] Received items for UUID: ${targetLessonId}`,
            result,
          );

          console.group(
            `📦 AI Recipe Payload Matrix for Lesson [${targetLessonId}]`,
          );
          console.log("🌸 Target Bloom Tier:", result.target_bloom_tier);
          console.log(
            "🧠 Predicted Learning Tags:",
            result.predicted_learning_tags,
          );

          // 🎯 FIXED: Target Python's explicit key arrays directly to get accurate item lengths
          console.log(
            "🧱 Recommended Content Blocks Count:",
            result.recommended_blocks?.length || 0,
          );
          console.log(
            "📋 Recommended Quizzes Count:",
            result.recommended_quizzes?.length || 0,
          );
          console.groupEnd();

          setUiRecipes((prev) => ({
            ...prev,
            [targetLessonId]: result,
          }));
        }
      } catch (err) {
        console.error(
          `❌ Fallback tracking failure on Lesson node [${targetLessonId}]:`,
          err,
        );
      }
    });

    // Wait for all requests in the array loop to finish execution safely
    await Promise.all(syncPromises);
    setIsSyncingAll(false);
    console.log(
      "🏁 [Batch AI Synced] All lesson data loops have completed processing.",
    );
  };

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
    latest_activity_lesson_id: null,
    lessons_progress: {},
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleQuizBlockCompleted = (blockId: string) => {
    setProgressData((prev) => {
      if (prev.completed_block_ids.includes(blockId)) {
        return prev; // Bails out smoothly if the index already exists
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

        // 📡 STEP 1: Inspect the raw payload coming across the wire from Laravel
        console.log(
          "📡 [LearnPage Hydration] Raw result from getLearningModule:",
          result,
        );

        if (!result.success || !result.data) throw new Error();

        setModule(result.data as unknown as ModuleResponse);

        // 📡 STEP 2: Inspect the precise relational telemetry metrics mapped into frontend state
        if (result.progress) {
          console.log("📊 [LearnPage Hydration] Progress payload detected:", {
            completedBlocksCount: result.progress.completed_blocks,
            totalBlocksCount: result.progress.total_blocks,
            completionPercentage: result.progress.percentage,
            completedBlockIdsArray: result.progress.completed_block_ids,
            completedQuizLessonsArray: result.progress.completed_quiz_lessons,
            // 🎯 ADDED FOR SESSION RESTORE TRACKING:
            latestActivityLessonId: result.progress.latest_activity_lesson_id,
            // 🎯 ADDED FOR REAL-TIME SIDEBAR TELEMETRY METRICS:
            lessonsProgressObject: result.progress.lessons_progress,
          });

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
            latest_activity_lesson_id:
              result.progress.latest_activity_lesson_id ?? null,
            lessons_progress: result.progress.lessons_progress ?? {},
          });
        } else {
          console.warn(
            "⚠️ [LearnPage Hydration] No user progress tracking object accompanied this module payload.",
          );
        }

        const moduleLessons = result.data.lessons || [];
        const fallbackLesson = moduleLessons[0];

        // 📡 STEP 3: Trace the auto-focus router layout engine decisions
        console.log(
          "🔀 [LearnPage Hydration] Running Auto-Focus Router Engine over total lessons:",
          moduleLessons.length,
        );

        if (result.progress?.active_quiz_lesson_id) {
          console.log(
            `🎯 [Router Engine] Pointing view to ongoing active quiz session: [${result.progress.active_quiz_lesson_id}]`,
          );
          setActiveLessonId(result.progress.active_quiz_lesson_id);
        } else {
          const firstIncompleteLesson = moduleLessons.find((lesson: any) => {
            const hasUnviewedBlocks = lesson.blocks?.some(
              (b: any) => !result.progress?.completed_block_ids?.includes(b.id),
            );
            const hasUnfinishedQuiz =
              (lesson.quiz_blocks?.length ?? 0) > 0 &&
              !result.progress?.completed_quiz_lessons?.includes(lesson.id);

            return hasUnviewedBlocks || hasUnfinishedQuiz;
          });

          console.log("🎯 [Router Engine] Focus assignment choice:", {
            incompleteLessonIdFound:
              firstIncompleteLesson?.id || "None (All done!)",
            fallbackLessonIdUsed: fallbackLesson?.id || "None",
          });

          setActiveLessonId(
            firstIncompleteLesson?.id || fallbackLesson?.id || "",
          );
        }
      } catch (err) {
        console.error("❌ LearnPage Hydration Error:", err);
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
      {mode === "adaptive" && (
        <QuestionnaireModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAdaptiveSetupAllLessons}
        />
      )}
      <ModuleSidebar
        structureTitle={module.title}
        lessons={lessons}
        activeLessonId={activeLessonId}
        completedBlockIds={progressData.completed_block_ids}
        // 🎯 5. EXTENDED SIDEBAR CHANNELS:
        // Pass completed quiz flags down so checkboxes can light up correctly
        completedQuizLessons={progressData.completed_quiz_lessons}
        lessonsProgress={progressData.lessons_progress}
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
          lessonsProgress={progressData.lessons_progress}
          completedBlockIds={progressData.completed_block_ids}
          completedQuizLessons={progressData.completed_quiz_lessons}
          lessons={lessons}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === lessons.length - 1}
          onQuizBlockCompleted={handleQuizBlockCompleted}
          // 🎯 THE FIX: Add the '?' right after updatedLesson to accept optional/undefined payloads!
          onBlockCompletedLive={(blockId, interactionType, updatedLesson?) => {
            setProgressData((prev) => {
              // 1. Maintain clean flat array record for checklist markers
              const nextBlockIds = prev.completed_block_ids.includes(blockId)
                ? prev.completed_block_ids
                : [...prev.completed_block_ids, blockId];

              // 2. Clone current lesson progress mappings record
              const nextLessonsProgress = { ...prev.lessons_progress };

              // 3. Inject the real-time server tracking numbers directly into the target map item
              if (updatedLesson) {
                nextLessonsProgress[updatedLesson.lesson_id] = {
                  completed_steps: updatedLesson.completed_steps,
                  total_steps: updatedLesson.total_steps,
                  is_completed: updatedLesson.is_completed,
                  percentage: updatedLesson.percentage,
                };
              }

              return {
                ...prev,
                completed_block_ids: nextBlockIds,
                lessons_progress: nextLessonsProgress,
              };
            });
          }}
          adaptiveRecipe={uiRecipes[activeLessonId] || null}
        />
      </div>
    </main>
  );
};

export default LearnPage;
