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
  getAssessmentState,
  saveAssessmentDraft,
  submitAssessment,
  submitPollVote,
  AnswerPayload,
  retakeAssessment,
} from "./assessmentService";
import { AssessmentStartScreen } from "./AssessmentStartScreen";
import { QuestionCard } from "./QuestionCard";
import { ResultsSummary } from "./ResultSummary";
import { ReviewSubmission } from "./ReviewSubmission";

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

const DRAFT_SAVE_DEBOUNCE_MS = 600;

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
  const queryClient = useQueryClient();

  const viewQueryKey = ["assessmentView", assessmentId, itemId, type] as const;
  const stateQueryKey = [
    "assessmentState",
    assessmentId,
    itemId,
    type,
  ] as const;

  const {
    data: viewData,
    isLoading: viewLoading,
    error: viewError,
  } = useQuery({
    queryKey: viewQueryKey,
    queryFn: () => getAssessmentViewData(assessmentId),
    enabled: Boolean(assessmentId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const { data: stateData, isLoading: stateLoading } = useQuery({
    queryKey: stateQueryKey,
    queryFn: () => getAssessmentState(assessmentId, itemId),
    enabled: Boolean(assessmentId) && Boolean(itemId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
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

  useEffect(() => {
    if (hasHydrated.current) return;
    if (!viewData || stateLoading) return;

    const availableQuestions = viewData.questions || [];
    const validQuestionMap = new Map(availableQuestions.map((q) => [q.id, q]));

    const prevAttempt = (viewData as any).previous_attempt;
    if (prevAttempt) {
      setSavedScore(prevAttempt.score_percentage);
      setSavedRawScore(prevAttempt.score ?? null);
      setSavedTotalPoints(prevAttempt.total_points ?? null);

      if (Array.isArray(prevAttempt.answers)) {
        const correct = prevAttempt.answers.filter(
          (a: any) => a.is_correct,
        ).length;
        setSavedCorrectCount(correct);

        const pastAnswersMap: Record<string, string> = {};
        prevAttempt.answers.forEach((ans: any) => {
          const qId = ans.question_id;
          const cId = ans.choice_id ?? ans.selected_option_id;
          if (qId && cId) {
            pastAnswersMap[qId] = String(cId);
          }
        });

        if (Object.keys(pastAnswersMap).length > 0) {
          setAnswers((prev) => ({ ...pastAnswersMap, ...prev }));
        }
      }

      if (prevAttempt.remedial_suggestions) {
        setRemedialSuggestions(prevAttempt.remedial_suggestions);
      }
    }

    const stateRes = stateData as any;

    if (stateRes?.success && stateRes.data) {
      const {
        draft_answers,
        question_order,
        current_index,
        status,
        poll_distributions,
        voted_question_ids,
      } = stateRes.data;

      // 🔑 Option 4: Reconcile ordered list against existing database questions
      let activeQuestions = [...availableQuestions];

      if (Array.isArray(question_order) && question_order.length > 0) {
        const restored = question_order
          .map((qId: string) => validQuestionMap.get(qId))
          .filter(Boolean) as typeof availableQuestions;

        const restoredIdSet = new Set(restored.map((q) => q.id));
        const unlistedQuestions = availableQuestions.filter(
          (q) => !restoredIdSet.has(q.id),
        );

        const reconciled = [...restored, ...unlistedQuestions];
        if (reconciled.length > 0) {
          activeQuestions = reconciled;
        }
      }

      // Reconcile poll distributions
      if (poll_distributions && Object.keys(poll_distributions).length > 0) {
        activeQuestions = activeQuestions.map((q) => ({
          ...q,
          choices: q.choices.map((choice) => {
            const c = choice as any;
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

      setAssessment({ ...viewData, questions: activeQuestions });

      // 🔑 Option 4: Discard draft answers for questions that were deleted
      const restoredMap: Record<string, string> = {};
      if (draft_answers) {
        if (Array.isArray(draft_answers)) {
          draft_answers.forEach((ans: any) => {
            if (ans?.question_id && validQuestionMap.has(ans.question_id)) {
              restoredMap[ans.question_id] = ans.choice_id;
            }
          });
        } else if (
          typeof draft_answers === "object" &&
          draft_answers !== null
        ) {
          Object.entries(draft_answers).forEach(([qId, cId]) => {
            if (validQuestionMap.has(qId)) {
              restoredMap[qId] = String(cId);
            }
          });
        }
      }

      if (Object.keys(restoredMap).length > 0) {
        setAnswers(restoredMap);
      }

      // Restore per-question vote status (discard deleted IDs)
      const validVotedIds: string[] = (voted_question_ids || []).filter(
        (qId: string) => validQuestionMap.has(qId),
      );
      if (validVotedIds.length > 0) {
        setSubmittedQuestions((prev) => {
          const next = { ...prev };
          validVotedIds.forEach((qId) => {
            next[qId] = true;
          });
          return next;
        });
      }

      // 🔑 Safely clamp current question index
      if (activeQuestions.length > 0) {
        const safeIndex =
          typeof current_index === "number"
            ? Math.min(Math.max(0, current_index), activeQuestions.length - 1)
            : 0;
        setCurrentQuestionIndex(safeIndex);
      } else {
        setCurrentQuestionIndex(0);
      }

      if (status === "completed") {
        setHasStarted(true);
        setSubmitted(true);

        if (viewData.settings.type === "poll") {
          const allSubmittedMap: Record<string, boolean> = {};
          activeQuestions.forEach((q) => {
            allSubmittedMap[q.id] = true;
          });
          setSubmittedQuestions(allSubmittedMap);
        }
      } else if (status === "in_progress") {
        setHasStarted(true);
      }
    } else {
      setAssessment(viewData);
    }

    hasHydrated.current = true;
    setStartTime(Date.now());
    questionStartRef.current = Date.now();
  }, [viewData, stateData, stateLoading]);

  useEffect(() => {
    if (viewError) {
      setError((viewError as any)?.message || "Failed to load assessment.");
    }
  }, [viewError]);

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
  }, [hasStarted, startTime, submitted, assessment]);

  const draftSaveMutation = useMutation({
    mutationFn: (vars: {
      formattedAnswers: AnswerPayload[];
      questionOrder: string[];
      targetIndex: number;
    }) =>
      saveAssessmentDraft(
        assessmentId,
        itemId,
        vars.formattedAnswers,
        vars.questionOrder,
        vars.targetIndex,
      ),
    onError: (err) => console.error("Draft save failed:", err),
  });

  const pollVoteMutation = useMutation({
    mutationFn: (vars: { questionId: string; choiceId: string }) =>
      submitPollVote(assessmentId, itemId, vars.questionId, vars.choiceId),
    onError: (err) => console.error("Poll vote failed:", err),
  });

  const pendingDraftRef = useRef<{
    updatedAnswers: Record<string, string>;
    targetIndex: number;
  } | null>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendDraft = useCallback(
    (updatedAnswers: Record<string, string>, targetIndex: number) => {
      if (!assessment) return;

      const formattedAnswers: AnswerPayload[] = Object.entries(
        updatedAnswers,
      ).map(([qId, cId]) => ({ question_id: qId, choice_id: cId }));

      const questionOrder = assessment.questions.map((q) => q.id);

      queryClient.setQueryData(stateQueryKey, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            draft_answers: updatedAnswers,
            current_index: targetIndex,
            status: "in_progress",
          },
        };
      });

      draftSaveMutation.mutate({
        formattedAnswers,
        questionOrder,
        targetIndex,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assessment, assessmentId, itemId, queryClient],
  );

  const triggerDraftSave = useCallback(
    (updatedAnswers: Record<string, string>, targetIndex: number) => {
      pendingDraftRef.current = { updatedAnswers, targetIndex };

      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        if (pendingDraftRef.current) {
          sendDraft(
            pendingDraftRef.current.updatedAnswers,
            pendingDraftRef.current.targetIndex,
          );
          pendingDraftRef.current = null;
        }
      }, DRAFT_SAVE_DEBOUNCE_MS);
    },
    [sendDraft],
  );

  const flushDraftSave = useCallback(() => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    }
    if (pendingDraftRef.current) {
      sendDraft(
        pendingDraftRef.current.updatedAnswers,
        pendingDraftRef.current.targetIndex,
      );
      pendingDraftRef.current = null;
    }
  }, [sendDraft]);

  useEffect(() => {
    return () => {
      flushDraftSave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = viewLoading || (Boolean(itemId) && stateLoading);

  if (isLoading) {
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

  // Guard against missing assessment or zero questions available
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
          <p className="text-xs leading-relaxed text-zinc-500">
            {error ||
              (!assessment?.questions?.length
                ? "This assessment currently has no available questions."
                : "Could not retrieve assessment information.")}
          </p>
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

  const handleSelectChoice = (questionId: string, choiceId: string) => {
    if (submitted || submittedQuestions[questionId]) return;

    const updatedAnswers = { ...answers, [questionId]: choiceId };
    setAnswers(updatedAnswers);

    setAnsweredAtMap((prev) => ({
      ...prev,
      [questionId]: prev[questionId] || new Date().toISOString(),
    }));

    triggerDraftSave(updatedAnswers, safeQuestionIndex);
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

      queryClient.setQueryData(stateQueryKey, (old: any) => {
        if (!old?.data) return old;
        const votedSet = new Set(old.data.voted_question_ids || []);
        votedSet.add(qId);
        return {
          ...old,
          data: {
            ...old.data,
            voted_question_ids: Array.from(votedSet),
            poll_distributions: {
              ...old.data.poll_distributions,
              ...result.poll_distributions,
            },
          },
        };
      });

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
      alert("Couldn't save your vote — please try again.");
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      recordCurrentQuestionTime();
      const nextIndex = safeQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      triggerDraftSave(answers, nextIndex);
      flushDraftSave();
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      recordCurrentQuestionTime();
      const prevIndex = safeQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      triggerDraftSave(answers, prevIndex);
      flushDraftSave();
    }
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting || submitted) return;

    try {
      setIsSubmitting(true);
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
        draftTimerRef.current = null;
      }
      pendingDraftRef.current = null;

      recordCurrentQuestionTime();

      const finalTimes = { ...questionTimes };
      const currentQ = questions[safeQuestionIndex];
      if (currentQ) {
        finalTimes[currentQ.id] =
          (finalTimes[currentQ.id] || 0) +
          Math.round((Date.now() - questionStartRef.current) / 1000);
      }

      // Filter submission answers to only valid questions
      const validQuestionsMap = new Map(questions.map((q) => [q.id, true]));
      const formattedAnswers = Object.entries(answers)
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
        answers: formattedAnswers as any,
      });

      if (result.success) {
        const responseData = result.data as any;

        const backendScore =
          responseData?.score_percentage ?? (result as any).score_percentage;
        const rawScore = responseData?.score ?? (result as any).score;
        const totalPoints =
          responseData?.total_points ?? (result as any).total_points;

        const finalRemedialSuggestions: Array<{
          page_id: string;
          block_id: string;
          review_url: string;
        }> =
          responseData?.remedial_suggestions ??
          (Array.isArray((result.data as any)?.remedial_suggestions)
            ? (result.data as any).remedial_suggestions
            : []);

        const finalCorrectCount =
          backendScore !== undefined
            ? Math.round((backendScore / 100) * totalGraded)
            : displayCorrectCount;

        if (backendScore !== undefined) {
          setSavedScore(backendScore);
          setSavedRawScore(rawScore);
          setSavedTotalPoints(totalPoints);
          setSavedCorrectCount(finalCorrectCount);
        }

        setRemedialSuggestions(finalRemedialSuggestions);

        if (result.poll_distributions && assessment) {
          const distributions = result.poll_distributions;

          setAssessment((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              questions: prev.questions.map((q) => ({
                ...q,
                choices: q.choices.map((choice) => {
                  const c = choice as any;
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

        queryClient.setQueryData(viewQueryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            previous_attempt: {
              score_percentage: backendScore,
              score: rawScore,
              total_points: totalPoints,
              answers: formattedAnswers.map((a) => ({
                question_id: a.question_id,
                choice_id: a.choice_id,
                is_correct:
                  gradedQuestions.find((q: any) => q.id === a.question_id)
                    ?.correctChoiceId === a.choice_id,
              })),
              remedial_suggestions: finalRemedialSuggestions,
            },
          };
        });

        queryClient.setQueryData(stateQueryKey, (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              draft_answers: answers,
              current_index: safeQuestionIndex,
              status: "completed",
            },
          };
        });

        queryClient.invalidateQueries({
          queryKey: stateQueryKey,
          refetchType: "none",
        });
        queryClient.invalidateQueries({
          queryKey: viewQueryKey,
          refetchType: "none",
        });

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
    if (settings.maxAttempts != null && settings.maxAttempts <= 1) {
      alert("You have reached the maximum allowed attempts.");
      return;
    }

    const res = await retakeAssessment(assessmentId, itemId);
    if (!res.success) {
      alert(res.error || "Failed to retake assessment.");
      return;
    }

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

    await queryClient.cancelQueries({ queryKey: stateQueryKey });
    await queryClient.cancelQueries({ queryKey: viewQueryKey });

    queryClient.setQueryData(stateQueryKey, (old: any) => ({
      success: true,
      data: {
        ...(old?.data ?? {}),
        attempt_id: (res as any).attempt_id ?? old?.data?.attempt_id ?? null,
        status: "in_progress",
        draft_answers: {},
        question_order: [],
        current_index: 0,
        voted_question_ids: [],
        poll_distributions: {},
      },
    }));

    queryClient.setQueryData(viewQueryKey, (old: any) => {
      if (!old) return old;
      const { previous_attempt, ...rest } = old;
      return rest;
    });

    queryClient.invalidateQueries({
      queryKey: stateQueryKey,
      refetchType: "none",
    });
    queryClient.invalidateQueries({
      queryKey: viewQueryKey,
      refetchType: "none",
    });
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
              triggerDraftSave(answers, 0);
              flushDraftSave();
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
                    onNext={onNext}
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
