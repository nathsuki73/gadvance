"use client";

import React, { useMemo } from "react";
import { ArrowDown, ArrowRight, CheckCircle, Lock } from "lucide-react";
import BlockRenderer from "./BlockRenderer";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type LessonQuizBlock = Lesson["quiz_blocks"][number] & {
  content?: string | null;
};

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

export type ModuleSectionViewerProps = {
  lesson: any; // or your custom explicit Lesson type structure
  currentIndex: number;
  totalSections: number;
  lessonsProgress: Record<string, any>;
  completedBlockIds: string[];
  completedQuizLessons: string[];
  lessons: any[];
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onQuizBlockCompleted: (blockId: string) => void;
  onBlockCompletedLive: (
    blockId: string,
    interactionType: string,
    updatedLesson?: any,
  ) => void;
  adaptiveRecipeRevision?: number;
  isAdaptiveMode?: boolean;
  learningPreference?: "video" | "reading" | null;

  // 🎯 THE FIX: Add the optional adaptive tracking property to resolve the compilation mismatch!
  adaptiveRecipe?: {
    status: string;
    student_context: string;
    target_bloom_tier: string;
    predicted_learning_tags: Array<{ label: string; confidence: number }>;
    recommended_blocks: any[];
    recommended_quizzes: any[];
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
  const hasContentBlocks = (lesson.blocks?.length || 0) > 0;
  const hasQuizBlocks = (lesson.quiz_blocks?.length || 0) > 0;

  const isAssessmentMode = hasQuizBlocks && !hasContentBlocks;
  const hasAdaptiveRecipe =
    !!adaptiveRecipe &&
    ((adaptiveRecipe.recommended_blocks?.length || 0) > 0 ||
      (adaptiveRecipe.recommended_quizzes?.length || 0) > 0);

  const normalizeRecipeBlock = (item: any, index: number) => ({
    id:
      item?.backendBlockId ||
      item?.block_id ||
      item?.id ||
      `${lesson.id}-adaptive-block-${index}`,
    type: item?.type || item?.block_type || item?.content_type || "text",
    content:
      typeof item?.content === "string"
        ? item.content
        : typeof item?.body === "string"
          ? item.body
          : typeof item?.text === "string"
            ? item.text
            : typeof item?.title === "string"
              ? item.title
              : "",
    metadata:
      item?.metadata || item?.meta || item?.description || item?.title
        ? {
            title: item?.title,
            description: item?.description,
          }
        : undefined,
    order_index: item?.order_index ?? index,
  });

  const adaptiveBlocks = useMemo(() => {
    let blocks = [];
    if (!hasAdaptiveRecipe) {
      blocks = (lesson.blocks || [])
        .slice()
        .sort((a, b) => a.order_index - b.order_index);
    } else {
      blocks = (adaptiveRecipe?.recommended_blocks || []).map(
        normalizeRecipeBlock,
      );
    }

    // Filter blocks based on learning preference in adaptive mode
    if (isAdaptiveMode && learningPreference) {
      if (learningPreference === "video") {
        // Only show video blocks
        return blocks.filter((block) => block.type === "video");
      } else if (learningPreference === "reading") {
        // Only show non-video, non-interactive blocks (text, image, title, reading, etc.)
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
    lesson.blocks,
    isAdaptiveMode,
    learningPreference,
  ]);

  const adaptiveQuizzes = useMemo(() => {
    if (!hasAdaptiveRecipe) {
      return lesson.quiz_blocks || [];
    }

    return adaptiveRecipe?.recommended_quizzes || [];
  }, [adaptiveRecipe, hasAdaptiveRecipe, lesson.quiz_blocks]);

  // 🎯 OPTIMIZED INSTANT GATEKEEPER MATCHING SIDEBAR STATE:
  const isNextStageAccessible = useMemo(() => {
    // In adaptive mode, all sections are always accessible
    if (isAdaptiveMode) {
      return true;
    }

    if (hasAdaptiveRecipe) {
      return true;
    }

    const totalBlocks = adaptiveBlocks.length;
    const totalQuizQuestions = adaptiveQuizzes.length;

    const isStandaloneQuizPage = totalQuizQuestions > 0 && totalBlocks === 0;
    const stepCount = isStandaloneQuizPage ? totalQuizQuestions : totalBlocks;

    // A. Check live array configurations directly (Instant UI reaction)
    const completedBlocksCount = adaptiveBlocks.filter((b) =>
      completedBlockIds.includes(b.id),
    ).length;

    const isQuizFinishedInDb = completedQuizLessons.includes(lesson.id);

    let totalCompletedSteps = 0;
    if (isStandaloneQuizPage) {
      totalCompletedSteps = adaptiveQuizzes.filter((q) =>
        completedBlockIds.includes(q.id),
      ).length;
    } else {
      const completedQuizzesCount = adaptiveQuizzes.filter((q) =>
        completedBlockIds.includes(q.id),
      ).length;
      totalCompletedSteps = completedBlocksCount + completedQuizzesCount;
    }

    // Fall back to server metrics if local runtime array state is fresh
    if (totalCompletedSteps === 0 && lessonsProgress[lesson.id]) {
      totalCompletedSteps = lessonsProgress[lesson.id].completed_steps;
    }

    const isEntirelyDone = totalCompletedSteps === stepCount && stepCount > 0;
    const isCurrentSectionDone =
      isQuizFinishedInDb ||
      isEntirelyDone ||
      !!lessonsProgress[lesson.id]?.is_completed;

    if (isCurrentSectionDone) {
      return true;
    }

    // B. Historical Exception Bypass rule
    const nextLesson = lessons[currentIndex + 1];
    if (nextLesson) {
      const nextProgress = lessonsProgress[nextLesson.id];
      const prevToNextLesson = lessons[currentIndex];
      const prevToNextProgress = lessonsProgress[prevToNextLesson.id];

      if (
        nextProgress?.is_completed ||
        nextProgress?.completed_steps > 0 ||
        prevToNextProgress?.is_completed
      ) {
        return true;
      }
    }

    return false;
  }, [
    isAdaptiveMode,
    lessonsProgress,
    lesson,
    currentIndex,
    lessons,
    completedBlockIds,
    completedQuizLessons,
    adaptiveBlocks,
    adaptiveQuizzes,
  ]);

  /*
  |--------------------------------------------------------------------------
  | QUIZ COMPILER HELPER METHOD
  |--------------------------------------------------------------------------
  */
  const renderCompiledQuiz = () => {
    if (!adaptiveQuizzes || adaptiveQuizzes.length === 0) return null;

    const combinedQuestions = adaptiveQuizzes
      .map((qb: LessonQuizBlock) => {
        try {
          // Safety check: ensure content exists
          if (!qb.content) {
            console.warn("Quiz block has no content:", qb.id);
            return null;
          }

          const parsed =
            typeof qb.content === "string"
              ? JSON.parse(qb.content)
              : qb.content;

          // Safety check: ensure parsed is an object
          if (!parsed || typeof parsed !== "object") {
            console.warn("Failed to parse quiz content:", qb.id);
            return null;
          }

          const targetQuestion = Array.isArray(parsed.questions)
            ? parsed.questions[0]
            : parsed;

          if (!targetQuestion) return null;

          const quizId = qb.backendBlockId || qb.id || targetQuestion.id;

          return {
            question: targetQuestion.question,
            options: targetQuestion.options,
            correctAnswer: targetQuestion.correctAnswer,
            explanation: targetQuestion.explanation || "",
            backendBlockId: quizId,
          };
        } catch (e) {
          console.error("Error formatting quiz block item:", e);
          return null;
        }
      })
      .filter(Boolean);

    const unifiedQuizContent = JSON.stringify({
      questions: combinedQuestions,
    });

    const dynamicQuizType = isAssessmentMode ? "pretest" : "quiz";

    return (
      <BlockRenderer
        key={`compiled-quiz-context-${lesson.id}`}
        block={{
          id: lesson.id,
          type: dynamicQuizType,
          content: unifiedQuizContent,
          metadata: {
            title: lesson.title,
            description: isAssessmentMode
              ? `Baseline diagnostic evaluation testing your understanding of all ${combinedQuestions.length} elements.`
              : `Check your understanding of this lesson's concepts with these ${combinedQuestions.length} questions.`,
          },
        }}
        onQuizBlockCompleted={onQuizBlockCompleted}
        lessonId={lesson.id}
        onBlockCompletedLive={onBlockCompletedLive}
      />
    );
  };

  const renderAdaptiveSummary = () => {
    if (!hasAdaptiveRecipe) return null;

    return (
      <div className="mb-8 rounded-3xl border border-[#e9d5ff] bg-gradient-to-br from-[#faf5ff] via-white to-[#f5f3ff] p-5 shadow-sm animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8b5cf6]">
              Adaptive recipe received
            </p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">
              Showing recommended lesson blocks in a staged reveal
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">
              The questionnaire result has been applied to this lesson. The
              recommended blocks will animate in sequence so the layout feels
              intentionally introduced instead of appearing all at once.
            </p>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-right shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              Bloom Tier
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">
              {adaptiveRecipe?.target_bloom_tier || "Adaptive"}
            </p>
          </div>
        </div>

        {adaptiveRecipe?.predicted_learning_tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {adaptiveRecipe.predicted_learning_tags.map((tag) => (
              <span
                key={tag.label}
                className="rounded-full border border-[#e9d5ff] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#7c3aed]"
              >
                {tag.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderAnimatedBlock = (
    block: any,
    index: number,
    extraKeyPrefix: string,
    child: React.ReactNode,
  ) => {
    const delayMs = index * 180;

    if (isAdaptiveMode) {
      return (
        <div
          key={`${extraKeyPrefix}-${block.id}-${adaptiveRecipeRevision}`}
          className="adaptive-block-animate will-change-transform"
          style={{
            animationDelay: `${delayMs}ms`,
            transformOrigin: "center",
          }}
        >
          {child}
        </div>
      );
    }

    return (
      <div
        key={`${extraKeyPrefix}-${block.id}-${adaptiveRecipeRevision}`}
        className="animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 will-change-transform"
        style={{ animationDelay: `${delayMs}ms` }}
      >
        {child}
      </div>
    );
  };

  const renderAdaptiveBlockBody = (block: any) => {
    if (!hasAdaptiveRecipe)
      return (
        <BlockRenderer
          block={block}
          lessonId={lesson.id}
          onBlockCompletedLive={onBlockCompletedLive}
        />
      );

    return (
      <BlockRenderer
        block={block}
        lessonId={lesson.id}
        onBlockCompletedLive={onBlockCompletedLive}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white px-6 py-10 sm:px-12 lg:px-16">
      {/* MAIN WORKSPACE CANVAS AREA */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        {/* DYNAMIC HEADER ANCHOR */}
        <div className="mb-10 border-b border-zinc-100 pb-6">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary mb-1">
            Part {(currentIndex + 1).toString().padStart(2, "0")} of{" "}
            {totalSections.toString().padStart(2, "0")}
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="mt-2 text-sm font-light text-zinc-400 leading-relaxed">
              {lesson.description}
            </p>
          )}
        </div>

        {/* CONTENT SWITCH LAYER */}
        {isAssessmentMode ? (
          <div className="space-y-6">
            {renderAdaptiveSummary()}
            {renderAnimatedBlock(
              { id: `assessment-${lesson.id}` },
              0,
              `assessment-${lesson.id}`,
              renderCompiledQuiz(),
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {renderAdaptiveSummary()}
            {adaptiveBlocks.map((block, index) => {
              const blockNode = renderAdaptiveBlockBody(block);

              return renderAnimatedBlock(
                block,
                index,
                `block-${lesson.id}`,
                blockNode,
              );
            })}

            {adaptiveQuizzes.length > 0 && (
              <div className="mt-12 pt-10 border-t border-dashed border-zinc-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">
                  Lesson Knowledge Check
                </h2>
                {renderAnimatedBlock(
                  { id: `quiz-${lesson.id}` },
                  adaptiveBlocks.length,
                  `quiz-${lesson.id}`,
                  renderCompiledQuiz(),
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MINIMALIST WORKSPACE LINEAR FOOTER NAVIGATION */}
      <div className="mt-20 border-t border-zinc-100 pt-8 w-full max-w-4xl mx-auto shrink-0">
        <div className="flex justify-center">
          {!isLast ? (
            isNextStageAccessible ? (
              /* 🔓 NEXT STAGE OPEN: Present Navigation Button */
              <button
                type="button"
                onClick={onNext}
                className="group flex items-center justify-center gap-3 rounded-full bg-primary px-12 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-purple-600 active:scale-[0.98] w-full sm:w-auto hover:shadow-lg hover:shadow-purple-100"
              >
                <span>
                  {isAssessmentMode ? "start assessment" : "continue"}
                </span>
                <ArrowDown
                  size={14}
                  strokeWidth={2.5}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            ) : (
              /* 🔒 NEXT STAGE LOCKED: Present Lock Bar */
              <div className="inline-flex items-center justify-center gap-2.5 rounded-full bg-zinc-50 border border-zinc-200/60 px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 select-none w-full sm:w-auto">
                <Lock size={12} className="text-zinc-300" strokeWidth={2.5} />
                complete current material to unlock next section
              </div>
            )
          ) : (
            /* 🏆 CURRICULUM CAPSTONE COMPLETE */
            <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-50 border border-emerald-100/60 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              <CheckCircle
                size={12}
                className="text-emerald-500"
                strokeWidth={2.5}
              />
              final curriculum milestone completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleSectionViewer;
