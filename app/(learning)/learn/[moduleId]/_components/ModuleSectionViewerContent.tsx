import React from "react";
import BlockRenderer from "./BlockRenderer";
import { AdaptiveRecipeSummary } from "./AdaptiveRecipeSummary";
import { AnimatedBlockWrapper } from "./AnimatedBlockWrapper";
import { CompiledQuizBlock } from "./CompiledQuizBlock";
import { ModuleSectionViewerHeader } from "./ModuleSectionViewerHeader";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type ModuleSectionViewerContentProps = {
  lesson: Lesson & { blocks?: Array<{ id: string; order_index: number }> };
  currentIndex: number;
  totalSections: number;
  adaptiveBlocks: Array<{ id: string; [key: string]: unknown }>;
  adaptiveQuizzes: Array<Record<string, unknown>>;
  adaptiveRecipe?: {
    target_bloom_tier?: string;
    predicted_learning_tags?: Array<{ label: string; confidence: number }>;
    recommended_blocks?: Array<Record<string, unknown>>;
    recommended_quizzes?: Array<Record<string, unknown>>;
  } | null;
  adaptiveRecipeRevision: number;
  isAdaptiveMode: boolean;
  isAssessmentMode: boolean;
  hasAdaptiveRecipe: boolean;
  onQuizBlockCompleted: (blockId: string) => void;
  onBlockCompletedLive: (
    blockId: string,
    interactionType: string,
    updatedLesson?: unknown,
  ) => void;
};

export const ModuleSectionViewerContent = ({
  lesson,
  currentIndex,
  totalSections,
  adaptiveBlocks,
  adaptiveQuizzes,
  adaptiveRecipe,
  adaptiveRecipeRevision,
  isAdaptiveMode,
  isAssessmentMode,
  hasAdaptiveRecipe,
  onQuizBlockCompleted,
  onBlockCompletedLive,
}: ModuleSectionViewerContentProps) => {
  const renderAdaptiveBlockBody = (block: { id: string }) => (
    <BlockRenderer
      block={block}
      lessonId={lesson.id}
      onBlockCompletedLive={onBlockCompletedLive}
    />
  );

  return (
    <div className="mx-auto w-full max-w-4xl flex-1">
      <ModuleSectionViewerHeader
        currentIndex={currentIndex}
        totalSections={totalSections}
        lesson={lesson}
      />

      {isAssessmentMode ? (
        <div className="space-y-6">
          <AdaptiveRecipeSummary
            adaptiveRecipe={adaptiveRecipe}
            hasAdaptiveRecipe={hasAdaptiveRecipe}
          />
          <AnimatedBlockWrapper
            block={{ id: `assessment-${lesson.id}` }}
            index={0}
            extraKeyPrefix={`assessment-${lesson.id}`}
            adaptiveRecipeRevision={adaptiveRecipeRevision}
            isAdaptiveMode={isAdaptiveMode}
          >
            <CompiledQuizBlock
              lesson={lesson}
              quizBlocks={
                adaptiveQuizzes as Array<{
                  id: string;
                  content?: string | null;
                }>
              }
              isAssessmentMode={isAssessmentMode}
              onQuizBlockCompleted={onQuizBlockCompleted}
              onBlockCompletedLive={onBlockCompletedLive}
            />
          </AnimatedBlockWrapper>
        </div>
      ) : (
        <div className="space-y-2">
          <AdaptiveRecipeSummary
            adaptiveRecipe={adaptiveRecipe}
            hasAdaptiveRecipe={hasAdaptiveRecipe}
          />
          {adaptiveBlocks.map((block, index) => (
            <AnimatedBlockWrapper
              key={`${lesson.id}-${block.id}-${index}`}
              block={block}
              index={index}
              extraKeyPrefix={`block-${lesson.id}`}
              adaptiveRecipeRevision={adaptiveRecipeRevision}
              isAdaptiveMode={isAdaptiveMode}
            >
              {renderAdaptiveBlockBody(block)}
            </AnimatedBlockWrapper>
          ))}

          {adaptiveQuizzes.length > 0 && (
            <div className="mt-12 border-t border-dashed border-zinc-200 pt-10">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Lesson Knowledge Check
              </h2>
              <AnimatedBlockWrapper
                block={{ id: `quiz-${lesson.id}` }}
                index={adaptiveBlocks.length}
                extraKeyPrefix={`quiz-${lesson.id}`}
                adaptiveRecipeRevision={adaptiveRecipeRevision}
                isAdaptiveMode={isAdaptiveMode}
              >
                <CompiledQuizBlock
                  lesson={lesson}
                  quizBlocks={
                    adaptiveQuizzes as Array<{
                      id: string;
                      content?: string | null;
                    }>
                  }
                  isAssessmentMode={isAssessmentMode}
                  onQuizBlockCompleted={onQuizBlockCompleted}
                  onBlockCompletedLive={onBlockCompletedLive}
                />
              </AnimatedBlockWrapper>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
