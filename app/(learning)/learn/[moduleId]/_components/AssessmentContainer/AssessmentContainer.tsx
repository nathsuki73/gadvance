"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AssessmentViewData, Choice } from "./types";
import {
  getAssessmentViewData,
  submitAssessment,
  submitPollVote,
  AnswerPayload,
  retakeAssessment,
} from "./assessmentService";
import { AssessmentStartScreen } from "./AssessmentStartScreen";
import { QuestionCard } from "./QuestionCard";
import { ResultsSummary } from "./ResultSummary";
import { ReviewSubmission } from "./ReviewSubmission";
import { useToast } from "@/app/components/context/ToastContext";

interface AssessmentContainerProps {
  itemId: string;
  sectionId?: string;
  moduleId: string;
  assessmentId: string;
  type?: string;
  isLastItem?: boolean;
  onComplete: () => void;
  onNext: () => void;
  onExit: () => void;
  onNavigate?: (targetId: string, blockId: string) => void;
}

const TOAST_DURATION_MS = 2800;

export default function AssessmentContainer({
  itemId,
  sectionId = "",
  moduleId,
  assessmentId,
  type = "quiz",
  isLastItem = false,
  onComplete,
  onNext,
  onExit,
}: AssessmentContainerProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const viewQueryKey = [
    "assessmentView",
    assessmentId,
    itemId,
    moduleId,
    type,
  ] as const;

  const storageDraftKey = `assessment_draft_${assessmentId}_${itemId}`;

  // Prevent multiple executions of close logic
  const closingRef = useRef(false);

  // Helper that displays toast and auto-closes page after toast finishes
  const triggerAutoClose = useCallback(
    (message?: string) => {
      if (closingRef.current) return;
      closingRef.current = true;

      showToast(
        message || "This module is currently being edited. Closing page...",
        "warning",
        TOAST_DURATION_MS,
      );

      setTimeout(() => {
        window.close();
        if (onExit) {
          onExit();
        }
      }, TOAST_DURATION_MS);
    },
    [showToast, onExit],
  );

  // 1. Load Assessment Definition (Cached in React Query cache)
  const {
    data: viewData,
    isLoading: viewLoading,
    error: viewError,
  } = useQuery({
    queryKey: viewQueryKey,
    queryFn: () => getAssessmentViewData(assessmentId, itemId, moduleId),
    enabled: Boolean(assessmentId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: (failureCount, error: any) => {
      if (error?.code === "MODULE_UNPUBLISHED") return false;
      return failureCount < 2;
    },
  });

  const [assessment, setAssessment] = useState<AssessmentViewData | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isReviewActive, setIsReviewActive] = useState<boolean>(false);

  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [savedRawScore, setSavedRawScore] = useState<number | null>(null);
  const [savedTotalPoints, setSavedTotalPoints] = useState<number | null>(null);
  const [savedCorrectCount, setSavedCorrectCount] = useState<number | null>(
    null,
  );

  const [remedialSuggestions, setRemedialSuggestions] = useState<
    Array<{ page_id: string; block_id: string; review_url: string }>
  >([]);

  const [submittedQuestions, setSubmittedQuestions] = useState<
    Record<string, boolean>
  >({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const questionStartRef = useRef<number>(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>(
    {},
  );
  const [answeredAtMap, setAnsweredAtMap] = useState<Record<string, string>>(
    {},
  );

  const hasHydrated = useRef(false);

  // Handle unpublished status triggered during initial fetch
  useEffect(() => {
    if (viewError) {
      const err = viewError as any;
      if (err?.code === "MODULE_UNPUBLISHED") {
        triggerAutoClose(err.message);
        return;
      }
      setError(err?.message || "Failed to load assessment.");
    }
  }, [viewError, triggerAutoClose]);

  // Reconcile and hydrate state from viewData (TanStack Query cache)
  useEffect(() => {
    if (!viewData) return;

    setAssessment(viewData);
    const prevAttempt = (viewData as any).previous_attempt;
    const isCompleted = Boolean(
      prevAttempt ||
      (viewData as any).user_has_completed ||
      (viewData as any).is_submitted,
    );

    if (isCompleted) {
      setSubmitted(true);
      setHasStarted(true);

      if (prevAttempt) {
        setSavedScore(
          prevAttempt.score_percentage ?? prevAttempt.percentage ?? null,
        );
        setSavedRawScore(prevAttempt.score ?? null);
        setSavedTotalPoints(prevAttempt.total_points ?? null);

        if (prevAttempt.remedial_suggestions) {
          setRemedialSuggestions(prevAttempt.remedial_suggestions);
        }

        const pastAnswersMap: Record<string, string> = {};
        const rawAns = prevAttempt.answers;
        if (rawAns) {
          if (Array.isArray(rawAns)) {
            rawAns.forEach((ans: any) => {
              const qId = ans.question_id;
              const cId = ans.choice_id ?? ans.selected_option_id;
              if (qId && cId) {
                pastAnswersMap[qId] = String(cId);
              }
            });
          } else if (typeof rawAns === "object") {
            Object.entries(rawAns).forEach(([qId, ansObj]) => {
              const typedAnsObj = ansObj as any;
              const cId =
                typeof typedAnsObj === "object" && typedAnsObj !== null
                  ? (typedAnsObj.selected_option_id ?? typedAnsObj.choice_id)
                  : typedAnsObj;
              if (qId && cId) {
                pastAnswersMap[qId] = String(cId);
              }
            });
          }
        }

        if (Object.keys(pastAnswersMap).length > 0) {
          setAnswers(pastAnswersMap);
        }

        if (rawAns && Array.isArray(rawAns)) {
          const correct = rawAns.filter((a: any) => a.is_correct).length;
          setSavedCorrectCount(correct);
        }
      }
    } else if (!hasHydrated.current) {
      // Hydrate active draft from localStorage only if not submitted
      const localDraft = localStorage.getItem(storageDraftKey);
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          if (parsed.answers) setAnswers(parsed.answers);
          if (typeof parsed.current_index === "number") {
            setCurrentQuestionIndex(parsed.current_index);
          }
        } catch (e) {
          console.error("Failed to parse local draft", e);
        }
      }
      setHasStarted(true);
    }

    hasHydrated.current = true;
    setStartTime(Date.now());
    questionStartRef.current = Date.now();
  }, [viewData, storageDraftKey]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentQuestionIndex]);

  const recordCurrentQuestionTime = () => {
    if (!assessment) return;
    const currentQ = assessment.questions[currentQuestionIndex];
    if (!currentQ) return;
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
    setQuestionTimes((prev) => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + elapsed,
    }));
  };

  // Exam Countdown Timer
  useEffect(() => {
    if (!hasStarted || submitted || !assessment?.settings) return;

    const limitMinutes = assessment.settings.timeLimitMinutes;
    const totalAllowedSeconds = limitMinutes ? limitMinutes * 60 : null;

    const interval = setInterval(() => {
      const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(currentElapsed);

      if (totalAllowedSeconds && currentElapsed >= totalAllowedSeconds) {
        clearInterval(interval);
        handleFinalSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasStarted,
    startTime,
    submitted,
    assessment?.settings?.timeLimitMinutes,
  ]);

  const pollVoteMutation = useMutation({
    mutationFn: (vars: { questionId: string; choiceId: string }) =>
      submitPollVote(
        assessmentId,
        itemId,
        vars.questionId,
        vars.choiceId,
        moduleId,
      ),
    onError: (err) => console.error("Poll vote failed:", err),
  });

  if (viewLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-3 text-[#8b5cf6]">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-xs font-semibold text-zinc-500">
            Loading assessment module...
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !assessment ||
    !assessment.questions ||
    assessment.questions.length === 0
  ) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200/80 bg-white p-8 text-center shadow-xl shadow-zinc-200/50">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
            <AlertCircle size={24} />
          </div>
          <h2 className="mb-1 text-base font-bold text-zinc-900">
            Assessment Unavailable
          </h2>
          <p className="mb-4 text-xs leading-relaxed text-zinc-500">
            {error ||
              (!assessment?.questions?.length
                ? "This assessment currently has no available questions."
                : "Could not retrieve assessment information.")}
          </p>
          <button
            type="button"
            onClick={() => triggerAutoClose()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-zinc-800 cursor-pointer"
          >
            Close Page
          </button>
        </div>
      </div>
    );
  }

  const { settings, questions } = assessment;
  const isPoll = settings.type === "poll";

  const totalQuestions = questions.length;
  const safeQuestionIndex = Math.min(
    Math.max(0, currentQuestionIndex),
    Math.max(0, totalQuestions - 1),
  );
  const currentQuestion = questions[safeQuestionIndex];

  const isFirstQuestion = safeQuestionIndex === 0;
  const isLastQuestion = safeQuestionIndex === totalQuestions - 1;
  const isCurrentAnswered = Boolean(
    currentQuestion && answers[currentQuestion.id],
  );
  const isCurrentQuestionSubmitted = Boolean(
    currentQuestion && submittedQuestions[currentQuestion.id],
  );

  const gradedQuestions = questions.filter((q: any) => !q.isPoll);
  const totalGraded = gradedQuestions.length;

  const localCorrectCount = gradedQuestions.reduce((acc: number, q: any) => {
    return answers[q.id] === q.correctChoiceId ? acc + 1 : acc;
  }, 0);
  const localScorePercentage =
    totalGraded > 0 ? Math.round((localCorrectCount / totalGraded) * 100) : 100;

  const displayScore = savedScore !== null ? savedScore : localScorePercentage;
  const displayCorrectCount =
    savedCorrectCount !== null ? savedCorrectCount : localCorrectCount;
  const isPassed = displayScore >= settings.passingScore;

  // Local draft persistence helper
  const saveLocalDraft = (
    newAnswers: Record<string, string>,
    newIndex: number,
  ) => {
    try {
      localStorage.setItem(
        storageDraftKey,
        JSON.stringify({ answers: newAnswers, current_index: newIndex }),
      );
    } catch (e) {
      console.error("Failed to save local draft", e);
    }
  };

  const handleSelectChoice = (questionId: string, choiceId: string) => {
    if (submitted || submittedQuestions[questionId]) return;

    const nextAnswers = { ...answers, [questionId]: choiceId };
    setAnswers(nextAnswers);
    saveLocalDraft(nextAnswers, currentQuestionIndex);

    setAnsweredAtMap((prev) => ({
      ...prev,
      [questionId]: prev[questionId] || new Date().toISOString(),
    }));
  };

  const handleSubmitSinglePollVote = async () => {
    if (!currentQuestion || !answers[currentQuestion.id]) return;

    const qId = currentQuestion.id;
    const choiceId = answers[qId];

    setSubmittedQuestions((prev) => ({ ...prev, [qId]: true }));

    try {
      const result = await pollVoteMutation.mutateAsync({
        questionId: qId,
        choiceId,
      });

      if (!result.success) {
        setSubmittedQuestions((prev) => ({ ...prev, [qId]: false }));
        const errData = result as any;
        if (errData.code === "MODULE_UNPUBLISHED") {
          triggerAutoClose(errData.message);
          return;
        }
        showToast(
          result.message ||
            errData.error ||
            "Couldn't save your vote — please try again.",
          "error",
        );
        return;
      }

      showToast("Vote submitted successfully!", "success", 2000);

      if (result.poll_distributions) {
        setAssessment((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            questions: prev.questions.map((q) => ({
              ...q,
              choices: q.choices.map((choice: Choice) => {
                const pollDistributions = result.poll_distributions as
                  | Record<string, { votes: number; percentage: number }>
                  | undefined;

                const dist = pollDistributions?.[choice.id];

                return dist
                  ? {
                      ...choice,
                      votes: dist.votes,
                      percentage: dist.percentage,
                    }
                  : choice;
              }),
            })),
          };
        });
      }
    } catch (err) {
      setSubmittedQuestions((prev) => ({ ...prev, [qId]: false }));
      showToast("Couldn't save your vote — please try again.", "error");
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      recordCurrentQuestionTime();
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      saveLocalDraft(answers, nextIndex);
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      recordCurrentQuestionTime();
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      saveLocalDraft(answers, prevIndex);
    }
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || submitted) return;

    try {
      setIsSubmitting(true);
      recordCurrentQuestionTime();

      const finalTimes = { ...questionTimes };
      const currentQ = questions[safeQuestionIndex];
      if (currentQ) {
        finalTimes[currentQ.id] =
          (finalTimes[currentQ.id] || 0) +
          Math.round((Date.now() - questionStartRef.current) / 1000);
      }

      const validQuestionsMap = new Map(questions.map((q) => [q.id, true]));
      const formattedAnswers: AnswerPayload[] = Object.entries(answers)
        .filter(([qId]) => validQuestionsMap.has(qId))
        .map(([qId, cId]) => ({
          question_id: qId,
          choice_id: cId,
          time_spent_seconds: finalTimes[qId] || 0,
          answered_at: answeredAtMap[qId] || new Date().toISOString(),
        }));

      const result = await submitAssessment({
        assessmentId,
        moduleId,
        sectionId,
        sectionItemId: itemId,
        answers: formattedAnswers,
      });

      if (!result.success) {
        const errorData = result as any;
        if (errorData.code === "MODULE_UNPUBLISHED") {
          triggerAutoClose(errorData.message);
          return;
        }

        showToast(
          result.message ||
            errorData.error ||
            "Failed to save assessment progress.",
          "error",
        );
        return;
      }

      const responseData = (result.data as any) ?? result;
      const backendScore =
        responseData?.score_percentage ?? responseData?.percentage;
      const rawScore = responseData?.score;
      const totalPoints = responseData?.total_points;
      const correctAnswersMap =
        responseData?.correct_answers ?? result.correct_answers;

      const finalRemedialSuggestions =
        responseData?.remedial_suggestions ??
        (Array.isArray((result as any)?.remedial_suggestions)
          ? (result as any).remedial_suggestions
          : []);

      const finalCorrectCount =
        backendScore !== undefined
          ? Math.round((backendScore / 100) * totalGraded)
          : displayCorrectCount;

      if (backendScore !== undefined) {
        setSavedScore(backendScore);
        setSavedRawScore(rawScore ?? null);
        setSavedTotalPoints(totalPoints ?? null);
        setSavedCorrectCount(finalCorrectCount);
      }

      setRemedialSuggestions(finalRemedialSuggestions);
      setSubmitted(true);
      showToast("Assessment submitted successfully!", "success", 2500);

      try {
        localStorage.removeItem(storageDraftKey);
      } catch {}

      // 🚀 CRITICAL FIX: Directly update the TanStack Query cache with the completed state.
      // This ensures that when unmounting and remounting (navigating away and back),
      // useQuery immediately sees the completed state without needing localStorage.
      queryClient.setQueryData(viewQueryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          user_has_completed: true,
          previous_attempt: {
            score_percentage: backendScore,
            score: rawScore,
            total_points: totalPoints,
            remedial_suggestions: finalRemedialSuggestions,
            answers: formattedAnswers,
          },
          questions: oldData.questions.map((q: any) => ({
            ...q,
            correctChoiceId: correctAnswersMap?.[q.id] || q.correctChoiceId,
            choices: q.choices.map((c: any) => ({
              ...c,
              isCorrect: c.id === correctAnswersMap?.[q.id],
            })),
          })),
        };
      });
    } catch (err: any) {
      console.error("Submission error:", err);
      showToast(
        err?.message || "Network issue while submitting assessment.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (settings.maxAttempts != null && settings.maxAttempts <= 1) {
      showToast("You have reached the maximum allowed attempts.", "warning");
      return;
    }

    const res = await retakeAssessment(assessmentId, itemId, moduleId);
    if (!res.success) {
      const errData = res as any;
      if (errData.code === "MODULE_UNPUBLISHED") {
        triggerAutoClose(errData.message);
        return;
      }
      showToast(
        res.error || res.message || "Failed to retake assessment.",
        "error",
      );
      return;
    }

    try {
      localStorage.removeItem(storageDraftKey);
    } catch {}

    if (settings.maxAttempts != null) {
      setAssessment((prev) =>
        prev
          ? {
              ...prev,
              settings: {
                ...prev.settings,
                maxAttempts: prev.settings.maxAttempts! - 1,
              },
            }
          : null,
      );
    }

    setAnswers({});
    setSubmitted(false);
    setHasStarted(true);
    setIsReviewActive(false);
    setSubmittedQuestions({});
    setRemedialSuggestions([]);
    setCurrentQuestionIndex(0);
    setElapsedSeconds(0);
    setStartTime(Date.now());
    setQuestionTimes({});
    setAnsweredAtMap({});
    questionStartRef.current = Date.now();

    setSavedScore(null);
    setSavedRawScore(null);
    setSavedTotalPoints(null);
    setSavedCorrectCount(null);

    // Update TanStack Query cache for retake
    if (res.data?.assessment) {
      setAssessment(res.data.assessment);
      queryClient.setQueryData(viewQueryKey, res.data.assessment);
      showToast("Started fresh attempt.", "info", 2000);
    }
  };

  const formatTimerDisplay = () => {
    if (settings.timeLimitMinutes) {
      const totalAllowedSeconds = settings.timeLimitMinutes * 60;
      const remainingSeconds = Math.max(
        0,
        totalAllowedSeconds - elapsedSeconds,
      );
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return "";
  };

  const currentProgressPercent =
    totalQuestions > 0
      ? Math.round(((safeQuestionIndex + 1) / totalQuestions) * 100)
      : 0;

  return (
    <div className="flex h-[100dvh] flex-col overflow-x-hidden overflow-y-auto bg-white font-sans antialiased">
      <div className="border-b border-zinc-100 bg-white px-4 py-3 sm:px-8 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          {hasStarted && Boolean(settings.timeLimitMinutes) && !submitted && (
            <div
              className={`flex shrink-0 items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-xl border ${
                settings.timeLimitMinutes! * 60 - elapsedSeconds <= 60
                  ? "animate-pulse border-rose-200 bg-rose-50 font-bold text-rose-700"
                  : "border-zinc-200/60 bg-zinc-50 text-zinc-600"
              }`}
            >
              <Clock
                size={14}
                className={
                  settings.timeLimitMinutes! * 60 - elapsedSeconds <= 60
                    ? "text-rose-600"
                    : "text-zinc-400"
                }
              />
              <span>{formatTimerDisplay()}</span>
            </div>
          )}
        </div>

        {hasStarted && !submitted && (
          <div className="mx-auto mt-3 max-w-3xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
              <span>
                Question {safeQuestionIndex + 1} of {totalQuestions}
              </span>
              <span>{currentProgressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full bg-[#8b5cf6] transition-all duration-300 ease-out"
                style={{ width: `${currentProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-12 sm:px-6 lg:px-8">
        {!hasStarted ? (
          <AssessmentStartScreen
            assessment={assessment}
            onStart={() => {
              setStartTime(Date.now());
              questionStartRef.current = Date.now();
              setHasStarted(true);
            }}
          />
        ) : submitted ? (
          <div className="space-y-6">
            {!isReviewActive && (
              <>
                {settings.showFinalResults && (
                  <ResultsSummary
                    scorePercentage={displayScore}
                    score={savedRawScore ?? localCorrectCount}
                    totalPoints={savedTotalPoints ?? totalGraded}
                    correctCount={displayCorrectCount}
                    totalGraded={totalGraded}
                    totalQuestions={totalQuestions}
                    elapsedSeconds={elapsedSeconds}
                    settings={settings}
                    onRetry={handleRetry}
                    onNext={isLastItem ? onExit : onNext}
                    isLastItem={isLastItem}
                    isPassed={isPassed}
                    isPoll={isPoll}
                    remedialSuggestions={remedialSuggestions}
                    moduleId={moduleId}
                  />
                )}
              </>
            )}

            <ReviewSubmission
              questions={questions}
              answers={answers}
              submitted={submitted}
              settings={settings}
              isPoll={isPoll}
              isReviewActive={isReviewActive}
              onToggleReview={setIsReviewActive}
              onSelectChoice={handleSelectChoice}
            />
          </div>
        ) : !currentQuestion ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            Question not found or removed.
          </div>
        ) : (
          <div className="space-y-6">
            <QuestionCard
              question={currentQuestion}
              index={safeQuestionIndex}
              selectedChoiceId={
                currentQuestion ? answers[currentQuestion.id] : undefined
              }
              submitted={submitted}
              isQuestionSubmitted={isCurrentQuestionSubmitted}
              settings={settings}
              onSelectChoice={handleSelectChoice}
              showQuestionNumber={false}
            />

            <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
              <button
                type="button"
                onClick={handlePreviousQuestion}
                disabled={isFirstQuestion}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 transition-all cursor-pointer hover:bg-zinc-50 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              {isPoll && !isCurrentQuestionSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitSinglePollVote}
                  disabled={!isCurrentAnswered}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-40"
                >
                  <CheckCircle2 size={16} />
                  <span>Submit Vote</span>
                </button>
              ) : !isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!isCurrentAnswered}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={!isCurrentAnswered || isSubmitting}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <span>Complete & Submit</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
