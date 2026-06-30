"use client";

import { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

import LearningPageLayout from "./_components/LearningPageLayout";
import type { ModuleResponse } from "./types";
import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import {
  createProgressData,
  EMPTY_PROGRESS_DATA,
  normalizeLessons,
  type ProgressData,
} from "./_lib/learning-page";
import Pretest from "@/app/components/pretest";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

type LessonProgressUpdate = {
  lesson_id: string;
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);
  const [module, setModule] = useState<ModuleResponse | null>(null);
  const [progressData, setProgressData] =
    useState<ProgressData>(EMPTY_PROGRESS_DATA);
  const [activeLessonId, setActiveLessonId] = useState("pre_test");
  const [pretestCompleted, setPretestCompleted] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasPreTest, setHasPreTest] = useState(false);
  const [hasPostTest, setHasPostTest] = useState(false);

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
          result.progress?.active_quiz_lesson_id ?? "pre_test";

        setModule(result.data as unknown as ModuleResponse);
        setProgressData(nextProgress);
        setActiveLessonId(initialLessonId || lessons[0]?.id || "pre_test");
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  const lessons = useMemo<Lesson[]>(() => normalizeLessons(module), [module]);
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.id === activeLessonId,
  );
  const activeLesson = lessons[currentIndex];

  const handlePretestComplete = () => {
    setPretestCompleted(true);
    setActiveLessonId(lessons[0]?.id || "");
  };

  const handleLessonChange = (id: string) => {
    setActiveLessonId(id);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) handleLessonChange(nextLesson.id);
  };

  const handlePrevious = () => {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !module || (!activeLesson && activeLessonId !== "pre_test"))
    notFound();

  return (
    <LearningPageLayout
      moduleId={moduleId}
      moduleTitle={module?.title}
      lessons={lessons}
      activeLesson={activeLesson}
      activeLessonId={activeLessonId}
      currentIndex={currentIndex}
      progressData={progressData}
      isSidebarCollapsed={isSidebarCollapsed}
      mobileSidebarOpen={mobileSidebarOpen}
      onNavigate={handleLessonChange}
      onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      onCloseMobile={() => setMobileSidebarOpen(false)}
      onOpenMobile={() => setMobileSidebarOpen(true)}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onQuizBlockCompleted={handleQuizBlockCompleted}
      onBlockCompletedLive={handleBlockCompletedLive}
      pretestCompleted={pretestCompleted}
      onPretestComplete={handlePretestComplete}
      hasPreTest={hasPreTest}
      hasPostTest={hasPostTest}
    />
  );
};

export default LearnPage;
