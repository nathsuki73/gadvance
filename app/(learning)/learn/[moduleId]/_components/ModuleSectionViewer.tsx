"use client";

import React, { useMemo } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";
import BlockRenderer from "./BlockRenderer";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type LessonQuizBlock = Lesson["quiz_blocks"][number] & {
  content?: string | null;
};

type ModuleSectionViewerProps = {
  lesson: Lesson;
  currentIndex: number;
  totalSections: number;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onQuizBlockCompleted?: (blockId: string) => void;
  onBlockCompletedLive: (
    blockId: string,
    interactionType: "reading" | "quiz" | "text" | "video",
  ) => void;
};

const ModuleSectionViewer = ({
  lesson,
  currentIndex,
  totalSections,
  onNext,
  isLast,
  onQuizBlockCompleted,
  onBlockCompletedLive,
}: ModuleSectionViewerProps) => {
  const hasContentBlocks = (lesson.blocks?.length || 0) > 0;
  const hasQuizBlocks = (lesson.quiz_blocks?.length || 0) > 0;

  // 🎯 FIX: If a lesson contains quiz blocks, ensure it runs the assessment presentation layer
  const isAssessmentMode = hasQuizBlocks && !hasContentBlocks;

  /*
  |--------------------------------------------------------------------------
  | QUIZ COMPILER HELPER METHOD
  |--------------------------------------------------------------------------
  */
  const renderCompiledQuiz = () => {
    if (!lesson.quiz_blocks || lesson.quiz_blocks.length === 0) return null;

    const combinedQuestions = lesson.quiz_blocks
      .map((qb: LessonQuizBlock) => {
        try {
          const parsed =
            typeof qb.content === "string"
              ? JSON.parse(qb.content)
              : qb.content;
          const targetQuestion = Array.isArray(parsed.questions)
            ? parsed.questions[0]
            : parsed;

          if (!targetQuestion) return null;

          return {
            question: targetQuestion.question,
            options: targetQuestion.options,
            correctAnswer: targetQuestion.correctAnswer,
            explanation: targetQuestion.explanation || "",
            backendBlockId: qb.id,
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

    return (
      <BlockRenderer
        block={{
          id: lesson.id,
          type: "pretest",
          content: unifiedQuizContent,
          metadata: {
            title: lesson.title,
            description: `This assessment tests your understanding of all ${combinedQuestions.length} elements.`,
          },
        }}
        onQuizBlockCompleted={onQuizBlockCompleted}
        lessonId={lesson.id}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white px-6 py-10 sm:px-12 lg:px-16">
      {/* MAIN WORKSPACE CANVAS AREA */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        {/* DYNAMIC HEADER ANCHOR */}
        <div className="mb-10 border-b border-zinc-100 pb-6">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#8b5cf6] mb-1">
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
            {/* 🎯 Call our clean helper method right here */}
            {renderCompiledQuiz()}
          </div>
        ) : (
          /* STANDARD CONTENT BLOCK LAYER WITH OPTIONAL QUIZZES APPENDED */
          <div className="space-y-2">
            {(lesson.blocks || [])
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  lessonId={lesson.id}
                  onBlockCompletedLive={onBlockCompletedLive}
                />
              ))}

            {/* 🎯 FIX: If a lesson has BOTH content blocks AND quiz blocks, append the quizzes safely at the bottom */}
            {!isAssessmentMode && hasQuizBlocks && (
              <div className="mt-12 pt-10 border-t border-dashed border-zinc-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">
                  Lesson Knowledge Check
                </h2>
                {renderCompiledQuiz()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MINIMALIST WORKSPACE LINEAR FOOTER NAVIGATION */}
      <div className="mt-20 border-t border-zinc-100 pt-8 w-full max-w-4xl mx-auto shrink-0">
        <div className="flex justify-center">
          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              className="group flex items-center justify-center gap-3 rounded-full bg-[#8b5cf6] px-12 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#7c3aed] active:scale-[0.98] w-full sm:w-auto hover:shadow-lg hover:shadow-purple-100"
            >
              <span>{isAssessmentMode ? "start assessment" : "continue"}</span>
              <ArrowRight
                size={14}
                strokeWidth={2.5}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2.5 rounded-full bg-purple-50 border border-purple-100/60 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6]">
              <CheckCircle
                size={12}
                className="text-[#8b5cf6]"
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
