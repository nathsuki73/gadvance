"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { submitAssessment } from "./assessmentService";
import { useQueryClient } from "@tanstack/react-query";
import { AssessmentViewData, Question } from "../types";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Flame,
} from "lucide-react";
import {
  loadInitialAssessmentState,
  saveLocalDraft,
  clearLocalDraft,
} from "./assessmentDraftUtils";
import { ResultsSummary } from "./_components/ResultSummary";
import { ReviewSubmission } from "./_components/ReviewSubmission";
import { QuizQuestionCard } from "./_components/AssessmentQuestionCard";
import { useToast } from "@/app/components/context/ToastContext";

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
  onRetake?: () => void | Promise<void>;
  onQuestionActiveChange?: (isActive: boolean) => void;
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
  onQuestionActiveChange,
}: AssessmentViewProps) {
  const queryClient = useQueryClient();
  const effectiveSectionItemId = sectionItemId || itemId;

  const [currentData] = useState<AssessmentViewData>(assessmentData);

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
  const [checkedQuestions, setCheckedQuestions] = useState<
    Record<string, boolean>
  >(initialState.checkedQuestions);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false); // 🔄 Lifted retry loading state
  const [result, setResult] = useState<any>(
    assessmentData.previous_attempt || null,
  );

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    initialState.elapsedSeconds,
  );
  const [isReviewActive, setIsReviewActive] = useState<boolean>(false);

  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>(
    initialState.questionTimers,
  );
  const questionStartTimeRef = useRef<number>(Date.now());

  const { showToast } = useToast();

  const questions: Question[] = currentData.questions || [];
  const totalQuestions = questions.length;
  const safeQuestionIndex = Math.min(
    Math.max(0, currentIndex),
    Math.max(0, totalQuestions - 1),
  );
  const currentQuestion = questions[safeQuestionIndex];

  const showImmediateFeedback =
    currentData.settings?.type !== "test" &&
    currentData.settings?.showFeedbackImmediately;

  const furthestCompletedIndex = useMemo(() => {
    let furthest = -1;
    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const selectedId = answers[q.id];
      const isChecked = !showImmediateFeedback || checkedQuestions[q.id];
      if (selectedId && isChecked) {
        furthest = idx;
      }
    }
    return furthest;
  }, [questions, answers, checkedQuestions, showImmediateFeedback]);

  const streakCount = useMemo(() => {
    let streak = 0;
    for (let idx = furthestCompletedIndex; idx >= 0; idx--) {
      const q = questions[idx];
      if (!q) break;

      const selectedId = answers[q.id];
      const correctId =
        q.correctChoiceId ||
        q.choices.find((c) => c.isCorrect || (c as any).is_correct)?.id;

      if (selectedId === correctId) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [questions, answers, furthestCompletedIndex]);

  const [streakPulse, setStreakPulse] = useState(false);
  const prevStreakCountRef = useRef(0);

  useEffect(() => {
    if (streakCount > prevStreakCountRef.current) {
      setStreakPulse(true);
      const t = setTimeout(() => setStreakPulse(false), 450);
      prevStreakCountRef.current = streakCount;
      return () => clearTimeout(t);
    }
    prevStreakCountRef.current = streakCount;
  }, [streakCount]);

  useEffect(() => {
    const isActive = !result;
    onQuestionActiveChange?.(isActive);
    return () => {
      onQuestionActiveChange?.(false);
    };
  }, [result, onQuestionActiveChange]);

  useEffect(() => {
    if (result) return;

    window.history.pushState(
      { activeAssessment: true },
      "",
      window.location.href,
    );

    const handlePopState = () => {
      showToast("You can't go back while taking an assessment.");
      window.history.pushState(
        { activeAssessment: true },
        "",
        window.location.href,
      );
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [result]);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  const recordCurrentQuestionTime = () => {
    if (!currentQuestion) return;
    const now = Date.now();
    const elapsed = Math.max(
      1,
      Math.round((now - questionStartTimeRef.current) / 1000),
    );
    setQuestionTimers((prev) => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] || 0) + elapsed,
    }));
    questionStartTimeRef.current = now;
  };

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  useEffect(() => {
    if (result || !effectiveSectionItemId) return;
    saveLocalDraft(
      currentData.id,
      effectiveSectionItemId,
      answers,
      currentIndex,
      checkedQuestions,
      questionTimers,
      elapsedSeconds,
    );
  }, [
    answers,
    currentIndex,
    checkedQuestions,
    questionTimers,
    elapsedSeconds,
    currentData.id,
    effectiveSectionItemId,
    result,
  ]);

  const handleSelectOption = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handlePrimaryAction = () => {
    if (!currentQuestion) return;

    const isChecked = Boolean(checkedQuestions[currentQuestion.id]);

    if (showImmediateFeedback && !isChecked) {
      setCheckedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    } else {
      recordCurrentQuestionTime();
      if (!isLastQuestion) {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    recordCurrentQuestionTime();

    if (!effectiveSectionItemId || !moduleId) {
      alert("Missing required assessment context. Please reload the page.");
      return;
    }

    setIsSubmitting(true);
    const nowFormatted = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const formattedAnswers = Object.entries(answers).map(([qId, cId]) => ({
      question_id: qId,
      choice_id: cId,
      time_spent_seconds: questionTimers[qId] || 1,
      answered_at: nowFormatted,
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
    // 🦴 If retrying, show StartScreen-matched skeleton loading state (hiding summary & review entirely)
    if (isRetrying) {
      return (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center w-full max-w-md mx-auto animate-pulse px-4">
          <div className="mb-6 h-7 w-28 rounded-full bg-zinc-200" />
          <div className="space-y-2 w-full flex flex-col items-center">
            <div className="h-8 w-64 sm:w-80 rounded-xl bg-zinc-200" />
            <div className="h-8 w-48 sm:w-56 rounded-xl bg-zinc-200" />
          </div>
          <div className="mt-4 space-y-2 w-full flex flex-col items-center">
            <div className="h-4 w-72 sm:w-96 rounded-md bg-zinc-200" />
            <div className="h-4 w-48 sm:w-64 rounded-md bg-zinc-200" />
          </div>
          <div className="mt-8 flex justify-center w-full">
            <div className="h-12 w-44 rounded-xl bg-zinc-200" />
          </div>
        </div>
      );
    }

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

    const restoredAnswers: Record<string, string> = {};
    if (Array.isArray(evaluatedAnswers)) {
      evaluatedAnswers.forEach((ans: any) => {
        const qId = ans?.question_id;
        const cId = ans?.selected_option_id || ans?.choice_id;
        if (qId && cId) restoredAnswers[qId] = String(cId);
      });
    } else if (
      typeof evaluatedAnswers === "object" &&
      evaluatedAnswers !== null
    ) {
      Object.entries(evaluatedAnswers).forEach(([qId, ans]) => {
        const typedAns = ans as any;
        const cId =
          typedAns?.selected_option_id || typedAns?.choice_id || typedAns;
        if (qId && cId) restoredAnswers[qId] = String(cId);
      });
    }

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
          onRetry={async () => {
            setIsRetrying(true);
            clearLocalDraft(currentData.id, effectiveSectionItemId);
            if (onRetake) {
              await Promise.resolve(onRetake());
            }
          }}
          onNext={onNext || (() => {})}
          isLastItem={isLastItem}
          onExit={onExit}
          isPassed={isPassed}
          remedialSuggestions={remedialSuggestions}
          moduleId={moduleId}
          answersData={evaluatedAnswers}
          bktSkillsBreakdown={
            result.bkt_skills_breakdown || result.skillsBreakdown
          }
        />

        <ReviewSubmission
          questions={questions}
          answers={restoredAnswers}
          submitted={true}
          settings={currentData.settings}
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

  const isCurrentChecked =
    !showImmediateFeedback ||
    Boolean(currentQuestion && checkedQuestions[currentQuestion.id]);

  const canProceed = isCurrentAnswered;
  const needsChecking = showImmediateFeedback && !isCurrentChecked;

  const buttonLabel = needsChecking
    ? "Submit Answer"
    : isLastQuestion
      ? "Submit Assessment"
      : "Next";

  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4 py-6 sm:py-10 justify-between">
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-1.5 flex-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isCurrent = idx === safeQuestionIndex;

              let segmentStyle = "bg-zinc-200";

              if (isAnswered) {
                segmentStyle = "bg-[#8b5cf6]";
              }

              if (isCurrent) {
                segmentStyle = "bg-[#8b5cf6] ring-2 ring-purple-200";
              }

              return (
                <div
                  key={q.id}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${segmentStyle}`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {streakCount > 0 && (
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transform transition-all duration-300 ${
                  streakPulse ? "scale-110" : "scale-100"
                } ${
                  streakCount >= 5
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : streakCount >= 3
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <Flame
                  size={15}
                  className={`transform transition-transform duration-300 ${
                    streakPulse ? "scale-125" : "scale-100"
                  } ${
                    streakCount >= 5
                      ? "text-rose-600 fill-rose-600 animate-pulse"
                      : streakCount >= 3
                        ? "text-orange-500 fill-orange-500 animate-pulse"
                        : "text-amber-500 fill-amber-500"
                  }`}
                />
                <span>{streakCount}</span>
              </div>
            )}

            <span className="text-xs sm:text-sm font-bold text-zinc-500 pl-0.5">
              <span className="text-[#8b5cf6]">{safeQuestionIndex + 1}</span>/
              {totalQuestions}
            </span>
          </div>
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
          isChecked={Boolean(
            currentQuestion && checkedQuestions[currentQuestion.id],
          )}
          onSelectChoice={handleSelectOption}
        />
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200/80 pt-6 mt-10">
        <button
          type="button"
          disabled={isFirstQuestion}
          onClick={() => {
            recordCurrentQuestionTime();
            setCurrentIndex((prev) => Math.max(0, prev - 1));
          }}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          disabled={!canProceed || isSubmitting}
          onClick={handlePrimaryAction}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8b5cf6]/20 transition-all hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : needsChecking ? (
            <CheckCircle2 size={16} />
          ) : isLastQuestion ? (
            <CheckCircle2 size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
          <span>{isSubmitting ? "Submitting..." : buttonLabel}</span>
        </button>
      </div>
    </div>
  );
}
