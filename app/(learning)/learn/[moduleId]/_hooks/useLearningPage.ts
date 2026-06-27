import { useEffect, useMemo, useState } from "react";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import {
  createProgressData,
  EMPTY_PROGRESS_DATA,
  getInitialLessonId,
  normalizeLessons,
  type ProgressData,
} from "../_lib/learning-page";
import type { ModuleResponse } from "../types";

type LessonProgressUpdate = {
  lesson_id: string;
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

export function useLearningPage(moduleId: string) {
  const [module, setModule] = useState<ModuleResponse | null>(null);
  const [progressData, setProgressData] =
    useState<ProgressData>(EMPTY_PROGRESS_DATA);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadModule = async () => {
      if (!moduleId) return;

      setLoading(true);
      setError(false);

      try {
        const result = await getLearningModule(moduleId);
        if (!result.success || !result.data)
          throw new Error("Module unavailable");

        const nextProgress = createProgressData(result.progress);
        const lessons = normalizeLessons(
          result.data as unknown as ModuleResponse,
        );
        const initialLessonId =
          result.progress?.active_quiz_lesson_id ??
          getInitialLessonId(lessons, nextProgress);

        setModule(result.data as unknown as ModuleResponse);
        setProgressData(nextProgress);
        setActiveLessonId(initialLessonId || lessons[0]?.id || "");
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  const lessons = useMemo<Lesson[]>(() => normalizeLessons(module), [module]);

  const handleLessonChange = (id: string) => {
    setActiveLessonId(id);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = (currentIndex: number) => {
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) handleLessonChange(nextLesson.id);
  };

  const handlePrevious = (currentIndex: number) => {
    const previousLesson = lessons[currentIndex - 1];
    if (previousLesson) handleLessonChange(previousLesson.id);
  };

  const handleQuizBlockCompleted = (blockId: string) => {
    setProgressData((prev) => {
      if (prev.completed_block_ids.includes(blockId)) return prev;
      return {
        ...prev,
        completed_block_ids: [...prev.completed_block_ids, blockId],
      };
    });
  };

  const handleBlockCompletedLive = (
    blockId: string,
    _interactionType: string,
    updatedLesson?: LessonProgressUpdate,
  ) => {
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
  };

  return {
    module,
    lessons,
    progressData,
    activeLessonId,
    mobileSidebarOpen,
    isSidebarCollapsed,
    loading,
    error,
    setMobileSidebarOpen,
    setIsSidebarCollapsed,
    handleLessonChange,
    handleNext,
    handlePrevious,
    handleQuizBlockCompleted,
    handleBlockCompletedLive,
  };
}
