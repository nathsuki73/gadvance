import { useEffect, useMemo, useState } from "react";
import { fetchLessonQuiz, saveLessonQuizProgress } from "./service";
import { Quiz } from "./types";

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
        const data = await fetchLessonQuiz(lessonBlockId);
        console.log("DATA" + JSON.stringify(data));
        if (cancelled) return;

        setQuiz(data);

        if (!data.questions || data.questions.length === 0) {
          setError("No quiz found.");
          setQuizState("error");
          return;
        }

        if (data.previouslySavedAnswers) {
          setAnswers(data.previouslySavedAnswers);
        }

        if (data.status === "completed") {
          setQuizState("completed");
        } else if ((data.currentIndex ?? 0) > 0) {
          setCurrentQuestion(data.currentIndex ?? 0);
          setQuizState("started");
        } else {
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

  const handleNextQuestion = async () => {
    if (!quiz || isSaving) return;

    const questionId = quiz.questions[currentQuestion].id;
    const selectedChoiceId = answers[questionId];

    if (!selectedChoiceId) return;

    setSubmitted(true);
    setIsSaving(true);

    const isLastQuestion = currentQuestion === quiz.questions.length - 1;
    const nextIndexPointer = currentQuestion + 1;

    // 3. PERSIST PROGRESS: Ping the backend endpoint using the unified pipeline layout
    if (quiz.attemptId) {
      try {
        console.log("Attempt id: " + quiz.attemptId);
        await saveLessonQuizProgress(quiz.attemptId, {
          question_id: questionId,
          selected_choice_id: selectedChoiceId,
          current_index: nextIndexPointer,
        });
      } catch (err) {
        console.error("Failed to sync structural answer state:", err);
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

  const handleSelectAnswer = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  return {
    quiz,
    quizState,
    setQuizState,
    currentQuestion,
    submitted,
    isSaving,
    error,
    score,
    answers,
    handleNextQuestion,
    handleSelectAnswer,
  };
}
