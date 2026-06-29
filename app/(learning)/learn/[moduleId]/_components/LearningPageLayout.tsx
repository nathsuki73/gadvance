import { Menu } from "lucide-react";
import ModuleSidebar from "./ModuleSidebar";
import ModuleSectionViewer from "./ModuleSectionViewer";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import type { ProgressData } from "../_lib/learning-page";
import Pretest from "@/app/components/pretest";
import QuizContainer from "../_blocks/TestContainer/TestContainer";

type LearningPageLayoutProps = {
  moduleId: string;
  moduleTitle?: string;
  lessons: Lesson[];
  activeLesson?: Lesson;
  activeLessonId: string;
  currentIndex: number;
  progressData: ProgressData;
  isSidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  onNavigate: (id: string) => void;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onOpenMobile: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onQuizBlockCompleted: (blockId: string) => void;
  onBlockCompletedLive: (
    blockId: string,
    interactionType: string,
    updatedLesson?: {
      lesson_id: string;
      completed_steps: number;
      total_steps: number;
      is_completed: boolean;
      percentage: number;
    },
  ) => void;
  pretestCompleted?: boolean;
  onPretestComplete?: () => void;
};

export default function LearningPageLayout({
  moduleId,
  moduleTitle,
  lessons,
  activeLesson,
  activeLessonId,
  currentIndex,
  progressData,
  isSidebarCollapsed,
  mobileSidebarOpen,
  onNavigate,
  onToggleCollapse,
  onCloseMobile,
  onOpenMobile,
  onNext,
  onPrevious,
  onQuizBlockCompleted,
  onBlockCompletedLive,
  pretestCompleted = false,
  onPretestComplete,
}: LearningPageLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      <ModuleSidebar
        moduleId={moduleId}
        structureTitle={moduleTitle}
        lessons={lessons}
        activeLessonId={activeLessonId}
        completedBlockIds={progressData.completed_block_ids}
        completedQuizLessons={progressData.completed_quiz_lessons}
        lessonsProgress={progressData.lessons_progress}
        onNavigate={onNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={onCloseMobile}
        pretestCompleted={pretestCompleted}
      />

      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-200 bg-white px-4 lg:hidden">
        <button
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50"
          aria-label="Open sidebar layout"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 truncate text-sm font-semibold text-zinc-900">
          {moduleTitle}
        </span>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"}`}
      >
        {activeLessonId === "pre_test" ? (
          <QuizContainer />
        ) : (
          <ModuleSectionViewer
            lesson={activeLesson}
            currentIndex={currentIndex}
            totalSections={lessons.length}
            lessonsProgress={progressData.lessons_progress}
            completedBlockIds={progressData.completed_block_ids}
            completedQuizLessons={progressData.completed_quiz_lessons}
            lessons={lessons}
            onNext={onNext}
            onPrevious={onPrevious}
            isFirst={currentIndex === 0}
            isLast={currentIndex === lessons.length - 1}
            onQuizBlockCompleted={onQuizBlockCompleted}
            onBlockCompletedLive={onBlockCompletedLive}
          />
        )}
      </div>
    </main>
  );
}
