import { useCallback, useMemo } from "react";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type BlockLike = {
  id?: string;
  type?: string;
  block_type?: string;
  content_type?: string;
  content?: string;
  body?: string;
  text?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  order_index?: number;
  [key: string]: unknown;
};

type QuizLike = {
  id?: string;
  content?: string | null;
  [key: string]: unknown;
};

type AdaptiveRecipeLike = {
  target_bloom_tier?: string;
  predicted_learning_tags?: Array<{ label: string; confidence: number }>;
  recommended_blocks?: BlockLike[];
  recommended_quizzes?: QuizLike[];
};

type LessonProgressState = {
  completed_steps?: number;
  is_completed?: boolean;
};

export type ModuleSectionViewerState = {
  lesson: Lesson & {
    blocks?: BlockLike[];
    quiz_blocks?: QuizLike[];
  };
  currentIndex: number;
  lessonsProgress: Record<string, LessonProgressState>;
  completedBlockIds: string[];
  completedQuizLessons: string[];
  lessons: Array<{ id: string }>;
  adaptiveRecipe?: AdaptiveRecipeLike | null;
  adaptiveRecipeRevision?: number;
  isAdaptiveMode?: boolean;
  learningPreference?: "video" | "reading" | null;
};

export const useModuleSectionViewer = ({
  lesson,
  currentIndex,
  lessonsProgress,
  completedBlockIds,
  completedQuizLessons,
  lessons,
  adaptiveRecipe,
  isAdaptiveMode = false,
  learningPreference = null,
}: ModuleSectionViewerState) => {
  const hasContentBlocks = (lesson.blocks?.length || 0) > 0;
  const hasQuizBlocks = (lesson.quiz_blocks?.length || 0) > 0;
  const isAssessmentMode = hasQuizBlocks && !hasContentBlocks;
  const hasAdaptiveRecipe =
    !!adaptiveRecipe &&
    ((adaptiveRecipe.recommended_blocks?.length || 0) > 0 ||
      (adaptiveRecipe.recommended_quizzes?.length || 0) > 0);

  const normalizeRecipeBlock = useCallback(
    (item: BlockLike, index: number) => ({
      id:
        item.backendBlockId ||
        item.block_id ||
        item.id ||
        `${lesson.id}-adaptive-block-${index}`,
      type: item.type || item.block_type || item.content_type || "text",
      content:
        typeof item.content === "string"
          ? item.content
          : typeof item.body === "string"
            ? item.body
            : typeof item.text === "string"
              ? item.text
              : typeof item.title === "string"
                ? item.title
                : "",
      metadata:
        item.metadata || item.meta || item.description || item.title
          ? {
              title: item.title,
              description: item.description,
            }
          : undefined,
      order_index: item.order_index ?? index,
    }),
    [lesson.id],
  );

  const adaptiveBlocks = useMemo(() => {
    const blocks: BlockLike[] = hasAdaptiveRecipe
      ? (adaptiveRecipe?.recommended_blocks || []).map(normalizeRecipeBlock)
      : (lesson.blocks || [])
          .slice()
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    if (isAdaptiveMode && learningPreference) {
      if (learningPreference === "video") {
        return blocks.filter((block) => block.type === "video");
      }

      if (learningPreference === "reading") {
        return blocks.filter(
          (block) =>
            block.type !== "video" &&
            block.type !== "quiz" &&
            block.type !== "pretest" &&
            block.type !== "survey",
        );
      }
    }

    return blocks;
  }, [
    adaptiveRecipe,
    hasAdaptiveRecipe,
    isAdaptiveMode,
    learningPreference,
    lesson.blocks,
    normalizeRecipeBlock,
  ]);

  const adaptiveQuizzes = useMemo(() => {
    if (!hasAdaptiveRecipe) return lesson.quiz_blocks || [];
    return adaptiveRecipe?.recommended_quizzes || [];
  }, [adaptiveRecipe, hasAdaptiveRecipe, lesson.quiz_blocks]);

  const isNextStageAccessible = useMemo(() => {
    if (isAdaptiveMode || hasAdaptiveRecipe) return true;

    const totalBlocks = adaptiveBlocks.length;
    const totalQuizQuestions = adaptiveQuizzes.length;
    const isStandaloneQuizPage = totalQuizQuestions > 0 && totalBlocks === 0;
    const stepCount = isStandaloneQuizPage ? totalQuizQuestions : totalBlocks;

    const completedBlocksCount = adaptiveBlocks.filter((block) =>
      completedBlockIds.includes(block.id || ""),
    ).length;
    const isQuizFinishedInDb = completedQuizLessons.includes(lesson.id);

    let totalCompletedSteps = 0;
    if (isStandaloneQuizPage) {
      totalCompletedSteps = adaptiveQuizzes.filter((quiz) =>
        completedBlockIds.includes(quiz.id || ""),
      ).length;
    } else {
      const completedQuizzesCount = adaptiveQuizzes.filter((quiz) =>
        completedBlockIds.includes(quiz.id || ""),
      ).length;
      totalCompletedSteps = completedBlocksCount + completedQuizzesCount;
    }

    if (totalCompletedSteps === 0 && lessonsProgress[lesson.id]) {
      totalCompletedSteps = Number(
        lessonsProgress[lesson.id].completed_steps ?? 0,
      );
    }

    const isCurrentSectionDone =
      isQuizFinishedInDb ||
      (totalCompletedSteps === stepCount && stepCount > 0) ||
      Boolean(lessonsProgress[lesson.id]?.is_completed);

    if (isCurrentSectionDone) return true;

    const nextLesson = lessons[currentIndex + 1];
    if (!nextLesson) return false;

    const nextProgress = lessonsProgress[nextLesson.id];
    const prevToNextProgress = lessonsProgress[lessons[currentIndex]?.id];

    return Boolean(
      nextProgress?.is_completed ||
      Number(nextProgress?.completed_steps ?? 0) > 0 ||
      prevToNextProgress?.is_completed,
    );
  }, [
    adaptiveBlocks,
    adaptiveQuizzes,
    completedBlockIds,
    completedQuizLessons,
    currentIndex,
    hasAdaptiveRecipe,
    isAdaptiveMode,
    lesson.id,
    lessons,
    lessonsProgress,
  ]);

  return {
    adaptiveBlocks,
    adaptiveQuizzes,
    hasAdaptiveRecipe,
    isAssessmentMode,
    isNextStageAccessible,
  };
};
