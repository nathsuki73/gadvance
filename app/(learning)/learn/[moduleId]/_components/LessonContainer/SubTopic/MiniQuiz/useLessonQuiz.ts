"use client";

import { useEffect, useMemo, useState } from "react";
import { Quiz } from "../../Quiz/types";
import { fetchMiniQuiz, saveMiniQuizProgress } from "./service";

export type QuizState = "loading" | "ready" | "started" | "completed" | "error";

// 💡 Added onBktUpdate callback signature property parameter to the hook
export function useLessonQuiz(
  lessonBlockId: string,
  onBktUpdate?: (lessonBlockId: string, currentPLt: number) => void,
) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuiz() {
      setQuizState("loading");
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

        if (data.status === "completed") {
          setQuizState("completed");
        } else if (
          data.previouslySavedAnswers &&
          Object.keys(data.previouslySavedAnswers).length > 0
        ) {
          // 💡 RESUME: If they have *any* saved responses in the DB, drop them straight into action layout
          setCurrentQuestion(data.currentIndex ?? 0);
          setQuizState("started");
        } else {
          // FRESH: No progress logged yet, show start intro panel
          setQuizState("ready");
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load quiz.");
        setQuizState("error");
      }
    }

    loadQuiz();
    return () => {
      cancelled = true;
    };
  }, [lessonBlockId]);

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
  }, [answers, quiz]);

  const startQuiz = () => setQuizState("started");

  const selectAnswer = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const goToNextQuestion = async () => {
    if (!quiz || isSaving) return;

    const questionId = quiz.questions[currentQuestion].id;
    const selectedChoiceId = answers[questionId];
    if (!selectedChoiceId) return;

    setSubmitted(true);
    setIsSaving(true);

    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const nextIndexPointer = currentQuestion + 1;
    const activeAttemptId = quiz.attemptId;

    if (activeAttemptId) {
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
        console.error("Failed to sync structural mini-quiz answer state:", err);
      }
    }

    setTimeout(() => {
      setIsSaving(false);
      if (isLastQuestion) {
        setQuizState("completed");
      } else {
        setCurrentQuestion((prev) => prev + 1);
        setSubmitted(false);
      }
    }, 500);
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
