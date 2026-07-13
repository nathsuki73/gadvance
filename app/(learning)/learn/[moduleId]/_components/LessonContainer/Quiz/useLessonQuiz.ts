import { useEffect, useMemo, useState } from "react";
import { fetchLessonQuiz, saveLessonQuizProgress } from "./service";
import { BackendOptionResponse, BackendQuestionResponse, Quiz } from "./types";

export type QuizState = "loading" | "ready" | "started" | "completed" | "error";

export function useLessonQuiz(lessonBlockId: string, isActive: boolean) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("ready");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🌟 1. Safe early return: If it's not active, do ABSOLUTELY NOTHING.
    // No setStates are called here, completely satisfying the React compiler.
    if (!isActive) return;

    let cancelled = false;

    async function loadQuiz() {
      setQuizState("loading");
      setError(null);

      try {
        const data = await fetchLessonQuiz(lessonBlockId);
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
          setQuizState("started");
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
  }, [lessonBlockId, isActive]);

  // Use state variables derived directly during render phase if not active
  // This effectively mocks the "ready" state safely without using setState!
  const effectiveQuizState = isActive ? quizState : "ready";

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

    if (quiz.attemptId) {
      try {
        console.log("Attempt id: " + quiz.attemptId);
        const response = await saveLessonQuizProgress(quiz.attemptId, {
          question_id: questionId,
          selected_choice_id: selectedChoiceId,
          current_index: nextIndexPointer,
        });

        if (response.success && response.data) {
          if (response.data.quiz_status === "completed") {
            setQuizState("completed");
            setIsSaving(false);
            return;
          }

          // If the backend returned a newly pruned question array list, update our state
          if (response.data.questions) {
            const rawQuestions: BackendQuestionResponse[] =
              response.data.questions;
            setQuiz((prevQuiz) => {
              if (!prevQuiz) return null;

              // Map the backend questions back into the frontend structure format
              const updatedQuestions = rawQuestions.map(
                (q: BackendQuestionResponse) => ({
                  id: q.id,
                  question: q.question_text,
                  choices: (q.options || []).map(
                    (opt: BackendOptionResponse) => ({
                      id: opt.id,
                      text: opt.option_text,
                    }),
                  ),
                  correctAnswer:
                    q.options.find(
                      (opt: BackendOptionResponse) => opt.is_correct,
                    )?.id ?? "",
                }),
              );

              return {
                ...prevQuiz,
                questions: updatedQuestions,
              };
            });
          }
        }
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
    quizState: effectiveQuizState,
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
