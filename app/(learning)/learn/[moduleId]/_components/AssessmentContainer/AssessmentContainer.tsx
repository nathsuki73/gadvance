"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { AssessmentViewData } from "./types";
import {
  getAssessmentViewData,
  getAssessmentState,
  saveAssessmentDraft,
  submitAssessment,
  AnswerPayload,
} from "./assessmentViewService";
import { AssessmentStartScreen } from "./AssessmentStartScreen";
import { QuestionCard } from "./QuestionCard";
import { ResultsSummary } from "./ResultSummary";

interface AssessmentContainerProps {
  itemId: string; // SectionItem ID
  sectionId?: string; // Section ID (Required for progress tracking)
  moduleId: string; // Module ID
  assessmentId: string; // Assessment ID
  type?: string;
  onComplete: () => void;
  onNext: () => void;
}

export default function AssessmentContainer({
  itemId,
  sectionId = "",
  moduleId,
  assessmentId,
  type = "quiz",
  onComplete,
  onNext,
}: AssessmentContainerProps) {
  const [assessment, setAssessment] = useState<AssessmentViewData | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // 1. Fetch assessment data & restore user attempt state
  useEffect(() => {
    let isCancelled = false;

    async function initAssessment() {
      if (!assessmentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch Assessment Content
        const data = await getAssessmentViewData(assessmentId);
        if (isCancelled) return;

        // 2. Fetch Active Attempt Draft State
        const stateRes = await getAssessmentState(assessmentId, itemId);

        if (stateRes.success && stateRes.data && !isCancelled) {
          const { draft_answers, question_order, current_index, status } =
            stateRes.data;

          let activeQuestions = [...data.questions];

          // Re-arrange questions to match locked order from active attempt
          if (question_order && question_order.length > 0) {
            const orderedMap = new Map(data.questions.map((q) => [q.id, q]));
            const restoredQuestions = question_order
              .map((qId) => orderedMap.get(qId))
              .filter((q): q is (typeof data.questions)[0] => Boolean(q));

            if (restoredQuestions.length > 0) {
              activeQuestions = restoredQuestions;
            }
          }

          setAssessment({
            ...data,
            questions: activeQuestions,
          });

          // Restore saved answers
          if (draft_answers && draft_answers.length > 0) {
            const restoredMap: Record<string, string> = {};
            draft_answers.forEach((ans: any) => {
              restoredMap[ans.question_id] = ans.choice_id;
            });
            setAnswers(restoredMap);
            setHasStarted(true); // Skip start screen on resume
          }

          // Restore saved active question index
          if (
            typeof current_index === "number" &&
            current_index < activeQuestions.length
          ) {
            setCurrentQuestionIndex(current_index);
          }

          if (status === "completed") {
            setSubmitted(true);
          }
        } else {
          setAssessment(data);
        }
      } catch (err: any) {
        if (!isCancelled) setError(err.message || "Failed to load assessment.");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    initAssessment();

    return () => {
      isCancelled = true;
    };
  }, [assessmentId, itemId]);

  // 2. Timer listener
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
  }, [hasStarted, startTime, submitted, assessment]);

  // Helper to persist draft with locked question order and current question index
  const triggerDraftSave = (
    updatedAnswers: Record<string, string>,
    targetIndex: number,
  ) => {
    if (!assessment) return;

    const formattedAnswers: AnswerPayload[] = Object.entries(
      updatedAnswers,
    ).map(([qId, cId]) => ({
      question_id: qId,
      choice_id: cId,
    }));

    const questionOrder = assessment.questions.map((q) => q.id);

    saveAssessmentDraft(
      assessmentId,
      itemId,
      formattedAnswers,
      questionOrder,
      targetIndex,
    ).catch((err) => console.error("Draft save failed:", err));
  };

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-3 text-purple-600">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-xs font-semibold text-zinc-500">
            Loading assessment module...
          </p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200/80 bg-white p-8 text-center shadow-xl shadow-zinc-200/50">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
            <AlertCircle size={24} />
          </div>
          <h2 className="mb-1 text-base font-bold text-zinc-900">
            Assessment Unavailable
          </h2>
          <p className="text-xs leading-relaxed text-zinc-500">
            {error || "Could not retrieve assessment information."}
          </p>
        </div>
      </div>
    );
  }

  const { settings, questions } = assessment;

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isCurrentAnswered = Boolean(answers[currentQuestion?.id]);

  const gradedQuestions = questions.filter((q) => !q.isPoll);
  const totalGraded = gradedQuestions.length;
  const correctCount = gradedQuestions.reduce((acc, q) => {
    return answers[q.id] === q.correctChoiceId ? acc + 1 : acc;
  }, 0);

  const scorePercentage =
    totalGraded > 0 ? Math.round((correctCount / totalGraded) * 100) : 100;

  // 3. Option Selection with Auto-Save Draft
  const handleSelectChoice = (questionId: string, choiceId: string) => {
    if (submitted && !settings.allowReview) return;

    const updatedAnswers = { ...answers, [questionId]: choiceId };
    setAnswers(updatedAnswers);
    triggerDraftSave(updatedAnswers, currentQuestionIndex);
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      triggerDraftSave(answers, nextIndex);
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      triggerDraftSave(answers, prevIndex);
    }
  };

  // 4. Final Submission Endpoint Call
  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || submitted) return;

    try {
      setIsSubmitting(true);

      const formattedAnswers: AnswerPayload[] = Object.entries(answers).map(
        ([qId, cId]) => ({
          question_id: qId,
          choice_id: cId,
        }),
      );

      const result = await submitAssessment({
        assessmentId,
        moduleId,
        sectionId,
        sectionItemId: itemId,
        answers: formattedAnswers,
      });

      if (result.success) {
        setSubmitted(true);
        onComplete(); // Triggers sidebar DonutProgress filling
      } else {
        alert(result.message || "Failed to save assessment progress.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Network issue while submitting assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (settings.maxAttempts !== null) {
      if (settings.maxAttempts <= 1) {
        alert("You have reached the maximum allowed attempts.");
        return;
      }

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
    setCurrentQuestionIndex(0);
    setElapsedSeconds(0);
    setStartTime(Date.now());
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

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentProgressPercent =
    totalQuestions > 0
      ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
      : 0;

  return (
    <div className="flex h-[100dvh] flex-col justify-between overflow-x-hidden overflow-y-auto bg-white font-sans antialiased">
      {/* Top Navigation & Status Bar */}
      <div className="border-b border-zinc-100 bg-white px-4 py-3 sm:px-8 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <h1 className="truncate text-sm font-bold text-zinc-900">
            {assessment.title}
          </h1>

          {hasStarted && (
            <div
              className={`flex shrink-0 items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-xl border ${
                settings.timeLimitMinutes &&
                settings.timeLimitMinutes * 60 - elapsedSeconds <= 60
                  ? "animate-pulse border-rose-200 bg-rose-50 font-bold text-rose-700"
                  : "border-zinc-200/60 bg-zinc-50 text-zinc-600"
              }`}
            >
              <Clock
                size={14}
                className={
                  settings.timeLimitMinutes &&
                  settings.timeLimitMinutes * 60 - elapsedSeconds <= 60
                    ? "text-rose-600"
                    : "text-zinc-400"
                }
              />
              <span>{formatTimerDisplay()}</span>
            </div>
          )}
        </div>

        {/* Question Step Bar */}
        {hasStarted && !submitted && (
          <div className="mx-auto mt-3 max-w-3xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
              <span>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span>{currentProgressPercent}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full bg-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${currentProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="mx-auto my-auto w-full max-w-3xl p-4 sm:p-8">
        {!hasStarted ? (
          <AssessmentStartScreen
            assessment={assessment}
            onStart={() => {
              setStartTime(Date.now());
              setHasStarted(true);
              triggerDraftSave(answers, 0);
            }}
          />
        ) : submitted ? (
          <div className="space-y-6">
            {settings.showFinalResults && (
              <ResultsSummary
                scorePercentage={scorePercentage}
                correctCount={correctCount}
                totalGraded={totalGraded}
                totalQuestions={totalQuestions}
                elapsedSeconds={elapsedSeconds}
                settings={settings}
                onRetry={handleRetry}
              />
            )}

            {/* Post-submission Review Cards */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Review Submission
              </h3>
              {questions.map((q, qIndex) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={qIndex}
                  selectedChoiceId={answers[q.id]}
                  submitted={submitted}
                  settings={settings}
                  onSelectChoice={handleSelectChoice}
                />
              ))}
            </div>

            {/* Next Item Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={onNext}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:bg-purple-700 active:scale-[0.98]"
              >
                <span>Continue to Next Item</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Step Card */
          <div className="space-y-6">
            <QuestionCard
              question={currentQuestion}
              index={currentQuestionIndex}
              selectedChoiceId={answers[currentQuestion.id]}
              submitted={submitted}
              settings={settings}
              onSelectChoice={handleSelectChoice}
            />

            {/* Step Navigation Controls */}
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

              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!isCurrentAnswered}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:bg-purple-700 active:scale-[0.98] disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={!isCurrentAnswered || isSubmitting}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:bg-purple-700 active:scale-[0.98] disabled:opacity-40"
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
