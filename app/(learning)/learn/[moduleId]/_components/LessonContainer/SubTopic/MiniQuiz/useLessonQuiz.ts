"use client";

import { useEffect, useMemo, useState } from "react";
import { Quiz } from "../../Quiz/types";
import { fetchMiniQuiz } from "./service";

export type QuizState = "loading" | "ready" | "started" | "completed" | "error";

export function useLessonQuiz(lessonBlockId: string) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("loading");

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
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

        if (data.questions.length === 0) {
          setError("No quiz found.");
          setQuizState("error");
          return;
        }

        setQuizState("ready");
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

  const goToNextQuestion = () => {
    if (!quiz) return;

    const question = quiz.questions[currentQuestion];
    const selected = answers[question.id];
    if (!selected) return;

    setSubmitted(true);

    setTimeout(() => {
      if (currentQuestion === quiz.questions.length - 1) {
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
    error,
    score,
    startQuiz,
    selectAnswer,
    goToNextQuestion,
  };
}
