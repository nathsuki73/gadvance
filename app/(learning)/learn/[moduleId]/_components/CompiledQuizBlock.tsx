import React from "react";
import BlockRenderer from "./BlockRenderer";
import type { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type LessonQuizBlock = Lesson["quiz_blocks"][number] & {
  content?: string | null;
};

export type CompiledQuizBlockProps = {
  lesson: { id: string; title: string };
  quizBlocks: LessonQuizBlock[];
  isAssessmentMode: boolean;
  onQuizBlockCompleted: (blockId: string) => void;
  onBlockCompletedLive: (
    blockId: string,
    interactionType: string,
    updatedLesson?: unknown,
  ) => void;
};

export const CompiledQuizBlock = ({
  lesson,
  quizBlocks,
  isAssessmentMode,
  onQuizBlockCompleted,
  onBlockCompletedLive,
}: CompiledQuizBlockProps) => {
  if (!quizBlocks?.length) return null;

  const combinedQuestions = quizBlocks
    .map((qb) => {
      try {
        if (!qb.content) {
          console.warn("Quiz block has no content:", qb.id);
          return null;
        }

        const parsed =
          typeof qb.content === "string" ? JSON.parse(qb.content) : qb.content;

        if (!parsed || typeof parsed !== "object") {
          console.warn("Failed to parse quiz content:", qb.id);
          return null;
        }

        const targetQuestion = Array.isArray(parsed.questions)
          ? parsed.questions[0]
          : parsed;

        if (!targetQuestion) return null;

        const quizId =
          (qb as LessonQuizBlock & { backendBlockId?: string })
            .backendBlockId ||
          (qb as LessonQuizBlock & { backend_block_id?: string })
            .backend_block_id ||
          qb.id ||
          targetQuestion.id;

        return {
          question: targetQuestion.question,
          options: targetQuestion.options,
          correctAnswer: targetQuestion.correctAnswer,
          explanation: targetQuestion.explanation || "",
          backendBlockId: quizId,
        };
      } catch (error) {
        console.error("Error formatting quiz block item:", error);
        return null;
      }
    })
    .filter(Boolean);

  if (!combinedQuestions.length) return null;

  const unifiedQuizContent = JSON.stringify({ questions: combinedQuestions });
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
