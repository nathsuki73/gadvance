"use client";

import React from "react";
import { ModuleSectionViewerContent } from "./ModuleSectionViewerContent";
import { ModuleSectionViewerFooter } from "./ModuleSectionViewerFooter";
import { useModuleSectionViewer } from "./useModuleSectionViewer";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

export type ModuleSectionViewerProps = {
  lesson: Lesson & { blocks?: Array<{ id: string; order_index: number }> };
  currentIndex: number;
  totalSections: number;
  lessonsProgress: Record<
    string,
    { completed_steps?: number; is_completed?: boolean }
  >;
  completedBlockIds: string[];
  completedQuizLessons: string[];
  lessons: Array<{ id: string }>;
  onNext: () => void;
  isLast: boolean;
  onQuizBlockCompleted: (blockId: string) => void;
  onBlockCompletedLive: (
    blockId: string,
    interactionType: string,
    updatedLesson?: unknown,
  ) => void;
  adaptiveRecipeRevision?: number;
  isAdaptiveMode?: boolean;
  learningPreference?: "video" | "reading" | null;
  adaptiveRecipe?: {
    target_bloom_tier?: string;
    predicted_learning_tags?: Array<{ label: string; confidence: number }>;
    recommended_blocks?: Array<Record<string, unknown>>;
    recommended_quizzes?: Array<Record<string, unknown>>;
  } | null;
};

const ModuleSectionViewer = ({
  lesson,
  currentIndex,
  totalSections,
  onNext,
  isLast,
  onQuizBlockCompleted,
  onBlockCompletedLive,
  lessonsProgress = {},
  lessons = [],
  completedBlockIds = [],
  completedQuizLessons = [],
  adaptiveRecipe,
  adaptiveRecipeRevision = 0,
  isAdaptiveMode = false,
  learningPreference = null,
}: ModuleSectionViewerProps) => {
  const {
    adaptiveBlocks,
    adaptiveQuizzes,
    hasAdaptiveRecipe,
    isAssessmentMode,
    isNextStageAccessible,
  } = useModuleSectionViewer({
    lesson,
    currentIndex,
    lessonsProgress,
    completedBlockIds,
    completedQuizLessons,
    lessons,
    adaptiveRecipe,
    adaptiveRecipeRevision,
    isAdaptiveMode,
    learningPreference,
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white px-6 py-10 sm:px-12 lg:px-16">
      <ModuleSectionViewerContent
        lesson={lesson}
        currentIndex={currentIndex}
        totalSections={totalSections}
        adaptiveBlocks={adaptiveBlocks}
        adaptiveQuizzes={adaptiveQuizzes}
        adaptiveRecipe={adaptiveRecipe}
        adaptiveRecipeRevision={adaptiveRecipeRevision}
        isAdaptiveMode={isAdaptiveMode}
        isAssessmentMode={isAssessmentMode}
        hasAdaptiveRecipe={hasAdaptiveRecipe}
        onQuizBlockCompleted={onQuizBlockCompleted}
        onBlockCompletedLive={onBlockCompletedLive}
      />

      <ModuleSectionViewerFooter
        isLast={isLast}
        isNextStageAccessible={isNextStageAccessible}
        isAssessmentMode={isAssessmentMode}
        onNext={onNext}
      />
    </div>
  );
};

export default ModuleSectionViewer;
