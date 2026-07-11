"use client";

import { useEffect, useMemo, useState } from "react";
import { Quiz } from "../../Quiz/types";
import { fetchMiniQuiz, saveMiniQuizProgress } from "./service";

export type QuizState = "loading" | "ready" | "started" | "completed" | "error";

export function useLessonQuiz(lessonBlockId: string) {
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
        } else if (data.currentIndex && data.currentIndex > 0) {
          // Resuming an in-progress attempt — skip the intro
          setCurrentQuestion(data.currentIndex);
          setQuizState("started");
        } else {
          // Fresh attempt — show the quiz's own intro screen
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
    // Persist choice entry state row logs securely to your database
    if (activeAttemptId) {
      try {
        await saveMiniQuizProgress(activeAttemptId, {
          question_id: questionId,
          selected_choice_id: selectedChoiceId,
          current_index: nextIndexPointer,
        });
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
