"use client";

import React, { useState, useEffect } from "react";
import { submitAssessment, retakeAssessment } from "./assessmentService";
import { useQueryClient } from "@tanstack/react-query";
import { AssessmentViewData, Question } from "../types";
import { QuizQuestionCard } from "./AssessmentQuestionCard";
import { ResultsSummary } from "./ResultSummary";
import { ReviewSubmission } from "./ReviewSubmission";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

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
}: AssessmentViewProps) {
  const queryClient = useQueryClient();
  const effectiveSectionItemId = sectionItemId || itemId;

  const [currentData, setCurrentData] =
    useState<AssessmentViewData>(assessmentData);
  const [currentIndex, setCurrentIndex] = useState<number>(
    assessmentData.current_index || 0,
  );

  // 🛡️ Helper to safely flatten draft answers or previous attempt answers into a flat Record<questionId, choiceId>
  const getInitialAnswers = () => {
    if (
      assessmentData.draft_answers &&
      Object.keys(assessmentData.draft_answers).length > 0
    ) {
      return assessmentData.draft_answers;
    }
    if (assessmentData.previous_attempt?.answers) {
      const parsed: Record<string, string> = {};
      const prev = assessmentData.previous_attempt.answers;

      if (Array.isArray(prev)) {
        prev.forEach((item: any) => {
          const qId = item.question_id;
          const cId = item.selected_option_id || item.choice_id;
          if (qId && cId) parsed[qId] = String(cId);
        });
      } else if (typeof prev === "object" && prev !== null) {
        Object.entries(prev).forEach(([qId, val]: [string, any]) => {
          if (typeof val === "object" && val !== null) {
            const cId = val.selected_option_id || val.choice_id;
            if (cId) parsed[qId] = String(cId);
          } else if (typeof val === "string") {
            parsed[qId] = val;
          }
        });
      }
      return parsed;
    }
    return {};
  };

  const [answers, setAnswers] =
    useState<Record<string, string>>(getInitialAnswers);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [result, setResult] = useState<any>(
    assessmentData.previous_attempt
      ? {
          score_percentage: assessmentData.previous_attempt.score_percentage,
          score: assessmentData.previous_attempt.score,
          total_points: assessmentData.previous_attempt.total_points,
          has_passed: assessmentData.previous_attempt.has_passed,
          answers: assessmentData.previous_attempt.answers,
          remedial_suggestions:
            assessmentData.previous_attempt.remedial_suggestions,
        }
      : null,
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

  // Timer Elapsed tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
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

        // 🚀 Update TanStack Query cache instantly so state is preserved across navigation/reloads
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
        alert(response?.error || "Submission failed.");
      }
    } catch (err: any) {
      alert(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = async () => {
    if (!effectiveSectionItemId) return;
    const res = await retakeAssessment(
      currentData.id,
      effectiveSectionItemId,
      moduleId,
    );
    if (res.success && res.data?.assessment) {
      setCurrentData(res.data.assessment);
      setResult(null);
      setAnswers({});
      setCurrentIndex(0);
      setElapsedSeconds(0);
      setIsReviewActive(false);

      // Invalidate cache to clear completed state for the retake
      queryClient.invalidateQueries({
        queryKey: [
          "assessmentContainer",
          assessmentId,
          effectiveSectionItemId,
          moduleId,
        ],
      });
    }
  };

  if (result) {
    const scorePercentage = Number(
      result.score_percentage ?? result.percentage ?? 0,
    );
    const passingScore = Number(
      result.passing_score ?? currentData.settings.passingScore ?? 70,
    );
    const isPassed = result.has_passed ?? scorePercentage >= passingScore;

    const evaluatedAnswers = result.answers || {};
    const correctCount = Array.isArray(evaluatedAnswers)
      ? evaluatedAnswers.filter((a: any) => a.is_correct).length
      : Object.values(evaluatedAnswers).filter((a: any) => a.is_correct).length;

    const totalGraded = questions.length;
    const rawScore = Number(result.score ?? correctCount);
    const totalPoints = Number(result.total_points ?? totalGraded);

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
        <ResultsSummary
          scorePercentage={scorePercentage}
          score={rawScore}
          totalPoints={totalPoints}
          correctCount={correctCount}
          totalGraded={totalGraded}
          totalQuestions={questions.length}
          elapsedSeconds={elapsedSeconds}
          settings={{ ...currentData.settings, passingScore }}
          onRetry={handleRetake}
          onNext={onNext || (() => {})}
          isLastItem={isLastItem}
          onExit={onExit}
          isPassed={isPassed}
          remedialSuggestions={result.remedial_suggestions || []}
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
      {/* Top Bar Header & Progress Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-zinc-500">
          <span>
            Question{" "}
            <span className="text-[#8b5cf6]">{safeQuestionIndex + 1}</span> of{" "}
            {totalQuestions}
          </span>
        </div>

        {/* Progress Tracker Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full bg-[#8b5cf6] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Question Body Card */}
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

      {/* Bottom Navigation Control Action Footer */}
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
