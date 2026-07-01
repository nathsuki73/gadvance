"use client";

import { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar from "./_components/SideBar/ModuleSidebar";
import QuizContainer from "./_blocks/TestContainer/QuizContainer";
import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import type { ModuleResponse } from "./types";
import {
  createProgressData,
  EMPTY_PROGRESS_DATA,
  normalizeLessons,
  type ProgressData,
} from "./_lib/learning-page";

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

  useEffect(() => {
    if (!moduleId) return;

    const loadModule = async () => {
      setLoading(true);
      setError(false);

      try {
        const result = await getLearningModule(moduleId);
        if (!result.success || !result.data)
          throw new Error("Module unavailable");

        const data = result.data as unknown as ModuleResponse;
        const lessons = normalizeLessons(data);
        const initialLessonId =
          result.progress?.active_quiz_lesson_id ?? "pre_test";

        setModule(data);
        setProgressData(createProgressData(result.progress));
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

  const goTo = (id: string) => {
    setActiveLessonId(id);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePretestComplete = () => {
    setPretestCompleted(true);
    goTo(lessons[0]?.id || "");
  };

  const handleNext = () => {
    const next = lessons[currentIndex + 1];
    if (next) goTo(next.id);
  };

  const handlePrevious = () => {
    const prev = lessons[currentIndex - 1];
    if (prev) goTo(prev.id);
  };

  const handleQuizBlockCompleted = (blockId: string) => {
    setProgressData((prev) =>
      prev.completed_block_ids.includes(blockId)
        ? prev
        : {
            ...prev,
            completed_block_ids: [...prev.completed_block_ids, blockId],
          },
    );
  };

  const handleBlockCompletedLive = (
    blockId: string,
    _interactionType: string,
    updatedLesson?: LessonProgressUpdate,
  ) => {
    setProgressData((prev) => ({
      ...prev,
      completed_block_ids: prev.completed_block_ids.includes(blockId)
        ? prev.completed_block_ids
        : [...prev.completed_block_ids, blockId],
      lessons_progress: updatedLesson
        ? {
            ...prev.lessons_progress,
            [updatedLesson.lesson_id]: {
              completed_steps: updatedLesson.completed_steps,
              total_steps: updatedLesson.total_steps,
              is_completed: updatedLesson.is_completed,
              percentage: updatedLesson.percentage,
            },
          }
        : prev.lessons_progress,
    }));
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
    <main className="min-h-screen">
      <ModuleSidebar
        moduleId={moduleId}
        structureTitle={module?.title}
        lessons={lessons}
        activeLessonId={activeLessonId}
        completedBlockIds={progressData.completed_block_ids}
        completedQuizLessons={progressData.completed_quiz_lessons}
        lessonsProgress={progressData.lessons_progress}
        onNavigate={goTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        pretestCompleted={pretestCompleted}
      />

      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-200 px-4 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50"
          aria-label="Open sidebar layout"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 truncate text-sm font-semibold text-zinc-900">
          {module?.title}
        </span>
      </div>

      <div
        className={`h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"
        }`}
      >
        <div
          className={activeLessonId === "pre_test" ? "block h-full" : "hidden"}
        >
          <QuizContainer
            moduleId={moduleId}
            onContinue={() => {
              handlePretestComplete();
              handleNext();
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default LearnPage;
