"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Quiz } from "../../Quiz/types";
import { fetchMiniQuiz, saveMiniQuizProgress } from "./service";

export type QuizState = "loading" | "ready" | "started" | "completed" | "error";

export function useLessonQuiz(
  lessonBlockId: string,
  onBktUpdate?: (lessonBlockId: string, currentPLt: number) => void,
  completedAction?: () => void,
) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasNotifiedCompletedRef = useRef(false);

  useEffect(() => {
    hasNotifiedCompletedRef.current = false;
  }, [lessonBlockId]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuiz() {
      // 💡 1. FAST LOCAL CHECK: Instant load on refresh/mount if cached in localStorage
      const isCompletedLocal =
        localStorage.getItem(`quiz_completed_${lessonBlockId}`) === "true";

      if (isCompletedLocal) {
        if (!cancelled) {
          setQuizState("completed");
        }
      } else {
        setQuizState("loading");
      }

      setError(null);

      try {
        const data = await fetchMiniQuiz(lessonBlockId);
        if (cancelled) return;

        setQuiz(data);

        if (!data.questions || data.questions.length === 0) {
          setError("No quiz found.");
          setQuizState("error");
          return;
        }

        if (data.previouslySavedAnswers) {
          setAnswers(data.previouslySavedAnswers as Record<string, string>);
        }

        // 💡 2. SYNC CHECK: If backend or local storage says completed
        if (data.status === "completed" || isCompletedLocal) {
          localStorage.setItem(`quiz_completed_${lessonBlockId}`, "true");
          setQuizState("completed");
        } else if (
          data.previouslySavedAnswers &&
          Object.keys(data.previouslySavedAnswers).length > 0
        ) {
          setCurrentQuestion(data.currentIndex ?? 0);
          setQuizState("started");
        } else {
          setQuizState("ready");
        }
      } catch (err) {
        if (cancelled) return;

        // If network request fails but local cache says completed, don't show error state
        if (isCompletedLocal) {
          setQuizState("completed");
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to load quiz.",
          );
          setQuizState("error");
        }
      }
    }

    loadQuiz();
    return () => {
      cancelled = true;
    };
  }, [lessonBlockId]);

  useEffect(() => {
    if (quizState !== "completed") return;
    if (hasNotifiedCompletedRef.current) return;

    hasNotifiedCompletedRef.current = true;

    // 💡 3. PERSISTENCE LOCK: Ensure localStorage is set when transition happens
    localStorage.setItem(`quiz_completed_${lessonBlockId}`, "true");
    completedAction?.();
  }, [completedAction, quizState, lessonBlockId]);

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.reduce((total, question) => {
      return (
        total + (answers[question.id] === question.correctAnswer ? 1 : 0)
      );
    }, 0);
  }, [answers, quiz]);

  const startQuiz = () => setQuizState("started");

  const selectAnswer = (questionId: string, choiceId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const goToNextQuestion = async () => {
    if (!quiz) return;

    const questionId = quiz.questions[currentQuestion].id;
    const selectedChoiceId = answers[questionId];
    if (!selectedChoiceId) return;

    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const nextIndexPointer = currentQuestion + 1;
    const activeAttemptId = quiz.attemptId;

    // 💡 4. LAST QUESTION COMPLETION: Persist immediately before API finishes
    if (isLastQuestion) {
      localStorage.setItem(`quiz_completed_${lessonBlockId}`, "true");
      setQuizState("completed");
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }

    if (activeAttemptId) {
      setIsSaving(true);
      try {
        const result = await saveMiniQuizProgress(activeAttemptId, {
          question_id: questionId,
          selected_choice_id: selectedChoiceId,
          current_index: nextIndexPointer,
        });

        if (result.success && result.data?.p_lt !== undefined && onBktUpdate) {
          onBktUpdate(lessonBlockId, result.data.p_lt);
        }
      } catch (err) {
        console.error(
          "Failed to sync structural mini-quiz answer state in background:",
          err,
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  return {
    quiz,
    quizState,
    answers,
    currentQuestion,
    submitted,
    isSaving,
    error,
    score,
    startQuiz,
    selectAnswer,
    goToNextQuestion,
  };
}