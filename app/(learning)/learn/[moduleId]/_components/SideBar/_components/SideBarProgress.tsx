import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type LessonProgressItem = {
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

const stepsFor = (
  lesson: Lesson,
  completedBlockIds: string[],
  lessonsProgress: Record<string, LessonProgressItem>,
) => {
  const standalone =
    (lesson.quiz_blocks?.length || 0) > 0 && (lesson.blocks?.length || 0) === 0;
  const stepCount = standalone
    ? lesson.quiz_blocks?.length || 0
    : lesson.blocks?.length || 0;
  let completed = standalone
    ? (lesson.quiz_blocks || []).filter((q) => completedBlockIds.includes(q.id))
        .length
    : (lesson.blocks || []).filter((b) => completedBlockIds.includes(b.id))
        .length +
      (lesson.quiz_blocks || []).filter((q) => completedBlockIds.includes(q.id))
        .length;
  if (completed === 0 && lessonsProgress[lesson.id])
    completed = lessonsProgress[lesson.id].completed_steps;
  return { stepCount, completed };
};

export const getLessonState = (
  lesson: Lesson,
  index: number,
  lessons: Lesson[],
  completedBlockIds: string[],
  completedQuizLessons: string[],
  lessonsProgress: Record<string, LessonProgressItem>,
  pretestCompleted: boolean,
  isAdaptiveMode: boolean,
) => {
  const { stepCount, completed } = stepsFor(
    lesson,
    completedBlockIds,
    lessonsProgress,
  );
  const doneInDb =
    completedQuizLessons.includes(lesson.id) ||
    lessonsProgress[lesson.id]?.is_completed;
  const completedSteps = doneInDb ? stepCount : Math.min(completed, stepCount);

  let isUnlocked = isAdaptiveMode || (pretestCompleted && index === 0);
  if (!isAdaptiveMode && index > 0) {
    const prev = lessons[index - 1];
    const prevSteps = stepsFor(prev, completedBlockIds, lessonsProgress);
    const prevDone =
      completedQuizLessons.includes(prev.id) ||
      lessonsProgress[prev.id]?.is_completed ||
      (prevSteps.completed === prevSteps.stepCount && prevSteps.stepCount > 0);
    isUnlocked = pretestCompleted && prevDone;
  }

  return { stepCount, completedSteps, isUnlocked };
};

export const isPostTestUnlocked = (
  lessons: Lesson[],
  completedBlockIds: string[],
  completedQuizLessons: string[],
  lessonsProgress: Record<string, LessonProgressItem>,
  pretestCompleted: boolean,
) => {
  if (!pretestCompleted) return false;

  return lessons.every((lesson) => {
    if (
      completedQuizLessons.includes(lesson.id) ||
      lessonsProgress[lesson.id]?.is_completed
    )
      return true;
    const { stepCount, completed } = stepsFor(
      lesson,
      completedBlockIds,
      lessonsProgress,
    );
    return stepCount === 0 || completed >= stepCount;
  });
};
