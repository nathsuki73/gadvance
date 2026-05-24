"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar from "../../learn/[moduleId]/_components/ModuleSidebar";
import ModuleSectionViewer from "../../learn/[moduleId]/_components/ModuleSectionViewer";
import type { ModuleResponse } from "../../learn/[moduleId]/types";
import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import AdaptiveQuestionnaireModal from "./_components/AdaptiveQuestionnaireModal";
import AdaptiveSkeletonLoader from "./_components/AdaptiveSkeletonLoader";

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

type ProgressData = {
  completed_blocks: number;
  total_blocks: number;
  percentage: number;
  completed_block_ids: string[];
  completed_quiz_lessons: string[];
  active_quiz_lesson_id: string | null;
  active_quiz_attempt_id: string | null;
  latest_activity_lesson_id: string | null;
  lessons_progress: Record<string, LessonProgressItem>;
};

type PreferenceType = "video" | "reading" | null;

type AdaptivePageProps = {
  params: Promise<{ moduleId: string }>;
};

// 🎲 Fisher-Yates shuffle algorithm for randomizing lesson order
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const EMPTY_PROGRESS: ProgressData = {
  completed_blocks: 0,
  total_blocks: 0,
  percentage: 0,
  completed_block_ids: [],
  completed_quiz_lessons: [],
  active_quiz_lesson_id: null,
  active_quiz_attempt_id: null,
  latest_activity_lesson_id: null,
  lessons_progress: {},
};

const AdaptiveLearningPage = ({ params }: AdaptivePageProps) => {
  const { moduleId } = use(params);

  // State Management
  const [modalOpen, setModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [adaptiveReady, setAdaptiveReady] = useState(false);
  const [learningPreference, setLearningPreference] =
    useState<PreferenceType>(null);
  const [uiRecipes, setUiRecipes] = useState<Record<string, any>>({});
  const [adaptiveRecipeRevision, setAdaptiveRecipeRevision] = useState(0);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState("");

  const [module, setModule] = useState<ModuleResponse | null>(null);
  const [progressData, setProgressData] =
    useState<ProgressData>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load the module initially
  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;
      try {
        setLoading(true);

        const result = await getLearningModule(moduleId);

        if (!result.success || !result.data) throw new Error();

        setModule(result.data as unknown as ModuleResponse);

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
            latest_activity_lesson_id:
              result.progress.latest_activity_lesson_id ?? null,
            lessons_progress: result.progress.lessons_progress ?? {},
          });
        }

        const moduleLessons = result.data.lessons || [];
        const fallbackLesson = moduleLessons[0];

        setActiveLessonId(moduleLessons[0]?.id || fallbackLesson?.id || "");
      } catch (err) {
        console.error("❌ Adaptive Module Load Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const lessons = useMemo<Lesson[]>(() => {
    if (!module || !module.lessons) return [];
    const lessonArray = Array.isArray(module.lessons)
      ? module.lessons
      : [module.lessons];
    // 🎲 Shuffle lessons for adaptive mode (non-sequential learning)
    return shuffleArray(lessonArray);
  }, [module]);

  const currentIndex = useMemo(() => {
    return lessons.findIndex((l) => l.id === activeLessonId);
  }, [lessons, activeLessonId]);

  const activeLesson = lessons[currentIndex];

  // 🎯 Handle questionnaire submission with preference bias
  const handleAdaptiveQuestionnaireSubmit = async (
    preference: PreferenceType,
  ) => {
    setLearningPreference(preference);
    setModalOpen(false);
    setIsLoading(true);

    if (!lessons || lessons.length === 0) {
      console.warn("⚠️ Lessons not yet loaded");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch recipes for all lessons with preference bias
      const syncPromises = lessons.map(async (lesson: any) => {
        const targetLessonId = lesson.id;

        try {
          const response = await fetch("http://127.0.0.1:8000/api/predict", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              lesson_id: targetLessonId,
              pretest_score: 12,
              learning_preference: preference,
              telemetry: {
                avg_time_spent: 60.0,
                retries: 0,
                quiz_accuracy: 0.7,
                engagement_score: 6.0,
                inactivity_count: 0,
                prefers_visual: preference === "video",
              },
            }),
          });

          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          const result = await response.json();

          if (result.status === "success" || result.recommended_blocks) {
            setUiRecipes((prev) => ({
              ...prev,
              [targetLessonId]: result,
            }));
          }
        } catch (err) {
          console.error(
            `❌ Adaptive Recipe fetch failed for lesson [${targetLessonId}]:`,
            err,
          );
        }
      });

      await Promise.all(syncPromises);
      setAdaptiveRecipeRevision((prev) => prev + 1);
      setAdaptiveReady(true);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Render questionnaire modal if not ready
  if (!adaptiveReady) {
    return (
      <main className="min-h-screen bg-white">
        {isLoading ? (
          <AdaptiveSkeletonLoader />
        ) : (
          <AdaptiveQuestionnaireModal
            isOpen={modalOpen}
            onSubmit={handleAdaptiveQuestionnaireSubmit}
          />
        )}
      </main>
    );
  }

  // Error handling
  if (error || !module || !activeLesson) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Sidebar - Fixed positioning (no wrapper animation needed) */}
      <div className="adaptive-sidebar-animate">
        <ModuleSidebar
          structureTitle={`${module.title} (Adaptive)`}
          lessons={lessons}
          activeLessonId={activeLessonId}
          completedBlockIds={[]}
          completedQuizLessons={[]}
          lessonsProgress={{}}
          onNavigate={handleLessonChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isAdaptiveMode={true}
        />
      </div>

      {/* Mobile Header - Only visible on small screens */}
      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 truncate text-sm font-semibold text-zinc-900">
          {module.title}
        </span>
      </div>

      {/* Content Section - Independent scrolling area with animation */}
      <div
        className={`adaptive-content-animate ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"}`}
      >
        <ModuleSectionViewer
          lesson={activeLesson}
          currentIndex={currentIndex}
          totalSections={lessons.length}
          lessonsProgress={{}}
          completedBlockIds={[]}
          completedQuizLessons={[]}
          lessons={lessons}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === lessons.length - 1}
          onQuizBlockCompleted={handleQuizBlockCompleted}
          adaptiveRecipeRevision={adaptiveRecipeRevision}
          isAdaptiveMode={true}
          learningPreference={learningPreference}
          onBlockCompletedLive={(blockId, interactionType, updatedLesson?) => {
            setProgressData((prev) => {
              const nextBlockIds = prev.completed_block_ids.includes(blockId)
                ? prev.completed_block_ids
                : [...prev.completed_block_ids, blockId];

              const nextLessonsProgress = { ...prev.lessons_progress };

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

export default AdaptiveLearningPage;
