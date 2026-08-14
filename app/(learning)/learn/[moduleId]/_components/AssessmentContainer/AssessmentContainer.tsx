"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  BookOpenText,
  ExternalLink,
} from "lucide-react";
import { AssessmentViewData } from "./types";
import {
  getAssessmentViewData,
  getAssessmentState,
  saveAssessmentDraft,
  submitAssessment,
  AnswerPayload,
  retakeAssessment,
} from "./assessmentService";
import { AssessmentStartScreen } from "./AssessmentStartScreen";
import { QuestionCard } from "./QuestionCard";
import { ResultsSummary } from "./ResultSummary";
import Link from "next/link";

interface AssessmentContainerProps {
  itemId: string;
  sectionId?: string;
  moduleId: string;
  assessmentId: string;
  type?: string;
  onComplete: () => void;
  onNext: () => void;
  onNavigate?: (targetId: string, blockId: string) => void;
}

export default function AssessmentContainer({
  itemId,
  sectionId = "",
  moduleId,
  assessmentId,
  type = "quiz",
  onComplete,
  onNext,
  onNavigate,
}: AssessmentContainerProps) {
  const [assessment, setAssessment] = useState<AssessmentViewData | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 🔑 NEW: States to permanently hold the backend's official score calculations
  const [savedScore, setSavedScore] = useState<number | null>(null);
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

  useEffect(() => {
    let isCancelled = false;

    setHasStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowReview(false);
    setSubmittedQuestions({});
    setElapsedSeconds(0);
    setRemedialSuggestions([]);
    setSavedScore(null);
    setSavedCorrectCount(null);

    async function initAssessment() {
      if (!assessmentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getAssessmentViewData(assessmentId);
        if (isCancelled) return;

        // 🔑 CHECK PREVIOUS ATTEMPT DATA ON PAGE LOAD
        const prevAttempt = (data as any).previous_attempt;
        if (prevAttempt) {
          setSavedScore(prevAttempt.score_percentage);

          if (Array.isArray(prevAttempt.answers)) {
            const correct = prevAttempt.answers.filter(
              (a: any) => a.is_correct,
            ).length;
            setSavedCorrectCount(correct);
          }

          if (prevAttempt.remedial_suggestions) {
            setRemedialSuggestions(prevAttempt.remedial_suggestions);
          }
        }

        const stateRes = await getAssessmentState(assessmentId, itemId);

        if (stateRes.success && stateRes.data && !isCancelled) {
          const {
            draft_answers,
            question_order,
            current_index,
            status,
            poll_distributions,
          } = stateRes.data as any;

          let activeQuestions = [...data.questions];

          if (question_order && question_order.length > 0) {
            const orderedMap = new Map(data.questions.map((q) => [q.id, q]));
            const restoredQuestions = question_order
              .map((qId: string) => orderedMap.get(qId))
              .filter((q): q is (typeof data.questions)[0] => Boolean(q));

            if (restoredQuestions.length > 0) {
              activeQuestions = restoredQuestions;
            }
          }

          if (
            poll_distributions &&
            Object.keys(poll_distributions).length > 0
          ) {
            activeQuestions = activeQuestions.map((q) => ({
              ...q,
              choices: q.choices.map((c: any) => {
                const dist = poll_distributions[c.id];
                if (typeof dist === "object" && dist !== null) {
                  return {
                    ...c,
                    votes: dist.votes ?? c.votes ?? 0,
                    percentage: dist.percentage ?? c.percentage ?? 0,
                  };
                }
                return c;
              }),
            }));
          }

          setAssessment({
            ...data,
            questions: activeQuestions,
          });

          const restoredMap: Record<string, string> = {};
          if (draft_answers) {
            if (Array.isArray(draft_answers)) {
              draft_answers.forEach((ans: any) => {
                restoredMap[ans.question_id] = ans.choice_id;
              });
            } else if (
              typeof draft_answers === "object" &&
              draft_answers !== null
            ) {
              Object.assign(restoredMap, draft_answers);
            }
          }

          if (Object.keys(restoredMap).length > 0) {
            setAnswers(restoredMap);
            setHasStarted(true);
          }

          if (
            typeof current_index === "number" &&
            current_index < activeQuestions.length
          ) {
            setCurrentQuestionIndex(current_index);
            if (current_index > 0) {
              setHasStarted(true);
            }
          }

          if (status === "completed") {
            setHasStarted(true);
            setSubmitted(true);
            setShowReview(false); // Keeps review closed by default on reload

            if (data.settings.type === "poll") {
              const allSubmittedMap: Record<string, boolean> = {};
              activeQuestions.forEach((q) => {
                allSubmittedMap[q.id] = true;
              });
              setSubmittedQuestions(allSubmittedMap);
            }
          } else if (
            status === "in_progress" &&
            Object.keys(restoredMap).length > 0
          ) {
            setHasStarted(true);
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
  const isPoll = settings.type === "poll";

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isCurrentAnswered = Boolean(answers[currentQuestion?.id]);
  const isCurrentQuestionSubmitted = Boolean(
    submittedQuestions[currentQuestion?.id],
  );

  const gradedQuestions = questions.filter((q) => !q.isPoll);
  const totalGraded = gradedQuestions.length;

  // Local calculations (fallbacks if backend data is missing)
  const localCorrectCount = gradedQuestions.reduce((acc, q) => {
    return answers[q.id] === q.correctChoiceId ? acc + 1 : acc;
  }, 0);
  const localScorePercentage =
    totalGraded > 0 ? Math.round((localCorrectCount / totalGraded) * 100) : 100;

  // 🔑 FINAL VALUES: Use backend scores if available, overriding local calculations
  const displayScore = savedScore !== null ? savedScore : localScorePercentage;
  const displayCorrectCount =
    savedCorrectCount !== null ? savedCorrectCount : localCorrectCount;
  const isPassed = displayScore >= settings.passingScore;

  const handleSelectChoice = (questionId: string, choiceId: string) => {
    if (submitted || submittedQuestions[questionId]) return;

    const updatedAnswers = { ...answers, [questionId]: choiceId };
    setAnswers(updatedAnswers);
    triggerDraftSave(updatedAnswers, currentQuestionIndex);
  };

  const handleSubmitSinglePollVote = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) return;

    const qId = currentQuestion.id;
    const choiceId = answers[qId];

    setSubmittedQuestions((prev) => ({ ...prev, [qId]: true }));

    setAssessment((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== qId) return q;

          const updatedChoices = q.choices.map((c) => ({
            ...c,
            votes: c.id === choiceId ? (c.votes ?? 0) + 1 : (c.votes ?? 0),
          }));

          const totalQVotes = updatedChoices.reduce(
            (sum, c) => sum + (c.votes ?? 0),
            0,
          );

          return {
            ...q,
            choices: updatedChoices.map((c) => ({
              ...c,
              percentage:
                totalQVotes > 0
                  ? Math.round(((c.votes ?? 0) / totalQVotes) * 100)
                  : 0,
            })),
          };
        }),
      };
    });
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
        const responseData = result.data as any;

        // 🔑 Capture Backend Score Instantly
        const backendScore =
          responseData?.score_percentage ?? result.score_percentage;
        if (backendScore !== undefined) {
          setSavedScore(backendScore);
          setSavedCorrectCount(Math.round((backendScore / 100) * totalGraded));
        }

        if (responseData?.remedial_suggestions) {
          setRemedialSuggestions(responseData.remedial_suggestions);
        } else if (
          result.data &&
          Array.isArray((result.data as any).remedial_suggestions)
        ) {
          setRemedialSuggestions((result.data as any).remedial_suggestions);
        }

        if (result.poll_distributions && assessment) {
          const distributions = result.poll_distributions;

          setAssessment((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              questions: prev.questions.map((q) => ({
                ...q,
                choices: q.choices.map((c) => {
                  const dist = distributions[c.id];
                  if (typeof dist === "object" && dist !== null) {
                    return {
                      ...c,
                      votes: dist.votes ?? c.votes ?? 0,
                      percentage: dist.percentage ?? c.percentage ?? 0,
                    };
                  }
                  return {
                    ...c,
                    votes: typeof dist === "number" ? dist : (c.votes ?? 0),
                    percentage: c.percentage ?? 0,
                  };
                }),
              })),
            };
          });
        }

        setSubmitted(true);
        setShowReview(true);
        onComplete();
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

  const handleRetry = async () => {
    if (settings.maxAttempts !== null) {
      if (settings.maxAttempts <= 1) {
        alert("You have reached the maximum allowed attempts.");
        return;
      }
    }

    const res = await retakeAssessment(assessmentId, itemId);
    if (!res.success) {
      alert(res.error || "Failed to retake assessment.");
      return;
    }

    if (settings.maxAttempts !== null) {
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
    setSubmittedQuestions({});
    setShowReview(false);
    setRemedialSuggestions([]);
    setCurrentQuestionIndex(0);
    setElapsedSeconds(0);
    setStartTime(Date.now());

    // Clear saved scores
    setSavedScore(null);
    setSavedCorrectCount(null);
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
      ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
      : 0;

  return (
    <div className="flex h-[100dvh] flex-col justify-between overflow-x-hidden overflow-y-auto bg-white font-sans antialiased">
      <div className="border-b border-zinc-100 bg-white px-4 py-3 sm:px-8 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <h1 className="truncate text-sm font-bold text-zinc-900">
            {assessment.title}
          </h1>

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
                scorePercentage={displayScore} // 🔑 Injected fixed backend score
                correctCount={displayCorrectCount} // 🔑 Injected fixed backend count
                totalGraded={totalGraded}
                totalQuestions={totalQuestions}
                elapsedSeconds={elapsedSeconds}
                settings={settings}
                onRetry={handleRetry}
              />
            )}

            {remedialSuggestions.length > 0 && (
              <div className="rounded-2xl border border-purple-200/60 bg-purple-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-900">
                  <BookOpenText size={18} className="text-[#8b5cf6]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Recommended Study Sections (Review Material)
                  </h3>
                </div>
                <p className="text-xs text-zinc-600">
                  Based on your assessment results, focus on reviewing these
                  targeted sections:
                </p>
                <div className="grid gap-2">
                  {remedialSuggestions.map((item, idx) => {
                    const reviewUrl = `/learn/${moduleId}?item=${item.page_id}#${item.block_id}`;

                    return (
                      <Link
                        key={idx}
                        href={reviewUrl}
                        className="flex items-center justify-between rounded-xl border border-purple-200/80 bg-white p-3 text-xs font-semibold text-zinc-800 shadow-2xs transition-all hover:border-purple-400 hover:bg-purple-50/50"
                      >
                        <span className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                            {idx + 1}
                          </span>
                          <span>Target Section Block #{idx + 1}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#8b5cf6]">
                          <span>Review Page</span>
                          <ExternalLink size={13} />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {(settings.allowReview || isPoll) && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowReview((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-200/80 bg-zinc-50/70 px-5 py-3.5 text-left transition-all hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                    {isPoll ? "View Poll Results" : "Review Submission"}
                  </span>
                  <ChevronRight
                    size={18}
                    className={`text-zinc-500 transition-transform duration-200 ${
                      showReview ? "rotate-90 text-purple-600" : ""
                    }`}
                  />
                </button>

                {showReview && (
                  <div className="space-y-6 pt-2">
                    {questions.map((q, qIndex) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={qIndex}
                        selectedChoiceId={answers[q.id]}
                        submitted={submitted}
                        isQuestionSubmitted={true}
                        settings={settings}
                        onSelectChoice={handleSelectChoice}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

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
          <div className="space-y-6">
            <QuestionCard
              question={currentQuestion}
              index={currentQuestionIndex}
              selectedChoiceId={answers[currentQuestion.id]}
              submitted={submitted}
              isQuestionSubmitted={isCurrentQuestionSubmitted}
              settings={settings}
              onSelectChoice={handleSelectChoice}
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
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer hover:bg-purple-700 active:scale-[0.98] disabled:opacity-40"
                >
                  <CheckCircle2 size={16} />
                  <span>Submit Vote</span>
                </button>
              ) : !isLastQuestion ? (
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
