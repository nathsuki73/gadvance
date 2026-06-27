import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";
import type { ModuleResponse } from "../types";

export type LessonProgressItem = {
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

export type ProgressData = {
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

export const EMPTY_PROGRESS_DATA: ProgressData = {
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

export function createProgressData(
  progress?: Partial<ProgressData> | null,
): ProgressData {
  return {
    ...EMPTY_PROGRESS_DATA,
    ...progress,
    completed_block_ids: progress?.completed_block_ids ?? [],
    completed_quiz_lessons: progress?.completed_quiz_lessons ?? [],
    lessons_progress: progress?.lessons_progress ?? {},
  };
}

export function normalizeLessons(module: ModuleResponse | null): Lesson[] {
  if (!module?.lessons) return [];
  return Array.isArray(module.lessons) ? module.lessons : [module.lessons];
}

export function getInitialLessonId(lessons: Lesson[], progress: ProgressData) {
  const fallbackLessonId = lessons[0]?.id ?? "";

  const nextLesson = lessons.find((lesson) => {
    const hasUnviewedBlocks = lesson.blocks?.some(
      (block) => !progress.completed_block_ids.includes(block.id),
    );
    const hasUnfinishedQuiz =
      (lesson.quiz_blocks?.length ?? 0) > 0 &&
      !progress.completed_quiz_lessons.includes(lesson.id);

    return hasUnviewedBlocks || hasUnfinishedQuiz;
  });

  return nextLesson?.id ?? fallbackLessonId;
}
