"use client";

import React, { useState, useEffect } from "react";
import { submitAssessment } from "./assessmentService";
import { useQueryClient } from "@tanstack/react-query";
import { AssessmentViewData, Question } from "../types";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import {
  loadInitialAssessmentState,
  saveLocalDraft,
  clearLocalDraft,
} from "./assessmentDraftUtils"; // 👈 Imported utilities
import { ResultsSummary } from "./_components/ResultSummary";
import { ReviewSubmission } from "./_components/ReviewSubmission";
import { QuizQuestionCard } from "./_components/AssessmentQuestionCard";

interface AssessmentViewProps {
  assessmentData: AssessmentViewData;
  assessmentId: string;
  sectionItemId?: string;
  itemId?: string;
  moduleId?: string;
  isLastItem?: boolean;
  onComplete?: () => void;
  onNext?: () => void;
  onExit?: () => void;
  onRetake?: () => void;
}

export default function AssessmentView({
  assessmentData,
  assessmentId,
  sectionItemId,
  itemId,
  moduleId,
  isLastItem = false,
  onComplete,
  onNext,
  onExit,
  onRetake,
}: AssessmentViewProps) {
  const queryClient = useQueryClient();
  const effectiveSectionItemId = sectionItemId || itemId;

  const [currentData] = useState<AssessmentViewData>(assessmentData);

  // 🛡️ Initialize state using the pruning & validation utility
  const [initialState] = useState(() =>
    loadInitialAssessmentState(
      assessmentData,
      assessmentId,
      effectiveSectionItemId,
    ),
  );

  const [answers, setAnswers] = useState<Record<string, string>>(
    initialState.answers,
  );
  const [currentIndex, setCurrentIndex] = useState<number>(
    initialState.currentIndex,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(
    assessmentData.previous_attempt || null,
  );

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isReviewActive, setIsReviewActive] = useState<boolean>(false);

  const questions: Question[] = currentData.questions || [];
  const totalQuestions = questions.length;
  const safeQuestionIndex = Math.min(
    Math.max(0, currentIndex),
    Math.max(0, totalQuestions - 1),
  );
  const currentQuestion = questions[safeQuestionIndex];
  const progressPercentage =
    totalQuestions > 0 ? ((safeQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // ⏱️ Elapsed Timer
  useEffect(() => {
    const timer = setInterval(
      () => setElapsedSeconds((prev) => prev + 1),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // 💾 Auto-save answers and page index using the utility
  useEffect(() => {
    if (result || !effectiveSectionItemId) return;
    saveLocalDraft(
      currentData.id,
      effectiveSectionItemId,
      answers,
      currentIndex,
    );
  }, [answers, currentIndex, currentData.id, effectiveSectionItemId, result]);

  const handleSelectOption = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async () => {
    if (!effectiveSectionItemId || !moduleId) {
      alert("Missing required assessment context. Please reload the page.");
      return;
    }

    setIsSubmitting(true);
    const formattedAnswers = Object.entries(answers).map(([qId, cId]) => ({
      question_id: qId,
      choice_id: cId,
    }));

    try {
      const response = await submitAssessment({
        assessmentId: currentData.id,
        moduleId,
        sectionItemId: effectiveSectionItemId,
        answers: formattedAnswers,
      });

      if (response && response.success) {
        const payloadData = response.data || response;
        setResult(payloadData);

        // 🗑️ Clear local draft storage on successful submission
        clearLocalDraft(currentData.id, effectiveSectionItemId);

        queryClient.setQueryData(
          [
            "assessmentContainer",
            assessmentId,
            effectiveSectionItemId,
            moduleId,
          ],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                user_has_completed: true,
                previous_attempt: payloadData,
              },
            };
          },
        );
      } else {
        alert(response?.message || "Submission failed.");
      }
    } catch (err: any) {
      alert(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    const rawScore = Number(result.score ?? 0);
    const totalPoints = Number(result.total_points ?? questions.length);
    const scorePercentage = Number(result.score_percentage ?? 0);
    const passingScore = Number(
      result.passing_score ?? currentData.settings?.passingScore ?? 70,
    );
    const isPassed = Boolean(result.has_passed);
    const remedialSuggestions =
      result.remedial_suggestions ||
      result.remedialSuggestions ||
      currentData.previous_attempt?.remedial_suggestions ||
      [];

    const evaluatedAnswers = result.answers || {};
    const correctCount = Object.values(evaluatedAnswers).filter(
      (a: any) => a.is_correct,
    ).length;

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
        <ResultsSummary
          scorePercentage={scorePercentage}
          score={rawScore}
          totalPoints={totalPoints}
          correctCount={correctCount}
          totalGraded={questions.length}
          totalQuestions={questions.length}
          elapsedSeconds={elapsedSeconds}
          settings={{ ...currentData.settings, passingScore }}
          onRetry={() => {
            clearLocalDraft(currentData.id, effectiveSectionItemId);
            if (onRetake) onRetake();
          }}
          onNext={onNext || (() => {})}
          isLastItem={isLastItem}
          onExit={onExit}
          isPassed={isPassed}
          remedialSuggestions={remedialSuggestions}
          moduleId={moduleId}
        />

        <ReviewSubmission
          questions={questions}
          answers={answers}
          submitted={true}
          settings={currentData.settings}
          isPoll={false}
          isReviewActive={isReviewActive}
          onToggleReview={setIsReviewActive}
          onSelectChoice={handleSelectOption}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-zinc-500">
        No questions found for this assessment.
      </div>
    );
  }

  const isFirstQuestion = safeQuestionIndex === 0;
  const isLastQuestion = safeQuestionIndex === totalQuestions - 1;
  const isCurrentAnswered = Boolean(
    currentQuestion && answers[currentQuestion.id],
  );

  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4 py-6 sm:py-10 justify-between">
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-500">
          <span>
            Question{" "}
            <span className="text-[#8b5cf6]">{safeQuestionIndex + 1}</span> of{" "}
            {totalQuestions}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full bg-[#8b5cf6] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <QuizQuestionCard
          question={currentQuestion}
          index={safeQuestionIndex}
          selectedChoiceId={answers[currentQuestion.id]}
          submitted={false}
          settings={currentData.settings}
          showQuestionNumber={false}
          onSelectChoice={handleSelectOption}
        />
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200/80 pt-6 mt-10">
        <button
          type="button"
          disabled={isFirstQuestion}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            disabled={!isCurrentAnswered}
            onClick={() =>
              setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
            }
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8b5cf6]/20 transition-all hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            disabled={!isCurrentAnswered || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8b5cf6]/20 transition-all hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>{isSubmitting ? "Submitting..." : "Submit Assessment"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
