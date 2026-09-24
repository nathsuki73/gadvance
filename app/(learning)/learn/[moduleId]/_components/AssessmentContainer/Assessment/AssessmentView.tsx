"use client";

import React, { useState, useEffect } from "react";
import {
  submitAssessment,
  retakeAssessment,
  getAssessmentState,
} from "./assessmentService";
import { AssessmentViewData, Question } from "../types";
import { QuizQuestionCard } from "./AssessmentQuestionCard";
import { ResultsSummary } from "./ResultSummary";
import { ReviewSubmission } from "./ReviewSubmission";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

interface AssessmentViewProps {
  assessmentData: AssessmentViewData;
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
  sectionItemId,
  itemId,
  moduleId,
  isLastItem = false,
  onComplete,
  onNext,
  onExit,
}: AssessmentViewProps) {
  const effectiveSectionItemId = sectionItemId || itemId;

  const [currentData, setCurrentData] =
    useState<AssessmentViewData>(assessmentData);
  const [currentIndex, setCurrentIndex] = useState<number>(
    assessmentData.current_index || 0,
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    assessmentData.draft_answers || {},
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
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

  // Fetch active state & timer on mount
  useEffect(() => {
    if (effectiveSectionItemId) {
      getAssessmentState(currentData.id, effectiveSectionItemId, moduleId).then(
        (res) => {
          if (res.success && res.data) {
            if (res.data.current_index !== undefined)
              setCurrentIndex(res.data.current_index);
            if (res.data.draft_answers)
              setAnswers(res.data.draft_answers as any);
            if (res.data.remaining_seconds !== undefined)
              setRemainingSeconds(res.data.remaining_seconds);
          }
        },
      );
    }
  }, [currentData.id, effectiveSectionItemId, moduleId]);

  // Timer Countdown & Elapsed tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setRemainingSeconds((prev) =>
        prev !== null && prev > 0 ? prev - 1 : prev,
      );
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
      alert(
        "Missing required assessment context (sectionItemId or moduleId). Please reload the page.",
      );
      return;
    }

    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(([qId, cId]) => ({
      question_id: qId,
      choice_id: cId,
    }));

    const response = await submitAssessment({
      assessmentId: currentData.id,
      moduleId,
      sectionItemId: effectiveSectionItemId,
      answers: formattedAnswers,
    });

    if (response.success) {
      setResult(response);
      // 🛑 REMOVED auto-navigation `if (onComplete) onComplete();` here.
      // The user will now stay on the Results Summary screen until they manually click Continue.
    } else {
      alert(response.error || "Submission failed.");
    }
    setIsSubmitting(false);
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
    }
  };

  if (result) {
    const scorePercentage = result.score_percentage ?? 0;
    const passingScore =
      result.passing_score ?? currentData.settings.passingScore;
    const isPassed = result.has_passed ?? scorePercentage >= passingScore;

    const evaluatedAnswers = result.answers || {};
    const correctCount = Object.values(evaluatedAnswers).filter(
      (a: any) => a.is_correct,
    ).length;
    const totalGraded = questions.length;

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
        <ResultsSummary
          scorePercentage={scorePercentage}
          score={result.score}
          totalPoints={result.total_points}
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
          isPoll={false}
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
          {remainingSeconds !== null && (
            <span className="inline-flex items-center gap-1.5 font-mono text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60">
              Time Left: {Math.floor(remainingSeconds / 60)}:
              {(remainingSeconds % 60).toString().padStart(2, "0")}
            </span>
          )}
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
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-40 cursor-pointer"
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
