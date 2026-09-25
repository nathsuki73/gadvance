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
  onRetake?: () => void;
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
  >(
    initialState.checkedQuestions, // 👈 Initialized from persisted draft state
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

  // The furthest question the learner has actually completed (answered, and
  // checked when immediate feedback is on). This is independent of which
  // question is currently on screen, so navigating with Previous/Next never
  // changes it — only actually completing a new question does.
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

  // Consecutive-correct streak, counted backward from the furthest completed
  // question (not from whatever question is currently being viewed).
  // Anchoring to safeQuestionIndex previously meant hitting "Previous" to
  // revisit an earlier question re-anchored the count there too, making the
  // streak appear to drop even though no answers had changed. Anchoring to
  // furthestCompletedIndex means Previous/Next is just browsing and never
  // moves the streak on its own.
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

  // Brief "pop" animation whenever the streak actually increases, on top of
  // the tiered ambient pulse below.
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
    if (result) return; // Do not trap navigation if the assessment is already submitted/completed

    // 1. Push an initial history state to act as the trap barrier
    window.history.pushState(
      { activeAssessment: true },
      "",
      window.location.href,
    );

    const handlePopState = (event: PopStateEvent) => {
      // 2. Show the strict alert message
      showToast("You can't go back while taking an assessment.");

      // 3. Instantly push the state back onto the stack to force them to stay
      window.history.pushState(
        { activeAssessment: true },
        "",
        window.location.href,
      );
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = ""; // Standard browser dialog for accidental page reloads / tab closes
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
      // First click: Submit/check the individual question to show feedback
      setCheckedQuestions((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    } else {
      // Second click (or normal mode): Proceed to next question or submit final assessment
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

    const answerEntries = Object.values(evaluatedAnswers);
    const times = answerEntries.map(
      (ans: any) => Number(ans?.time_spent_seconds) || 0,
    );
    const totalTimeSeconds = times.reduce((acc, curr) => acc + curr, 0);
    const validTimes = times.filter((t) => t > 0);
    const averageTimeSeconds =
      validTimes.length > 0
        ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
        : 0;
    const fastestTimeSeconds =
      validTimes.length > 0 ? Math.min(...validTimes) : 0;
    const slowestTimeSeconds =
      validTimes.length > 0 ? Math.max(...validTimes) : 0;

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
      {/* Segmented Progress Bar & Right-Side Stats */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 w-full">
          {/* Segmented Progress Bar ("Cuts per part") */}
          <div className="flex items-center gap-1.5 flex-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isCurrent = idx === safeQuestionIndex;

              let segmentStyle = "bg-zinc-200"; // Unanswered/default

              if (isAnswered) {
                segmentStyle = "bg-[#8b5cf6]"; // Answered
              }

              if (isCurrent) {
                segmentStyle = "bg-[#8b5cf6] ring-2 ring-purple-200"; // Active current question
              }

              return (
                <div
                  key={q.id}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${segmentStyle}`}
                />
              );
            })}
          </div>

          {/* Right side: Streak Badge + Counter (e.g. 5/8) */}
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
