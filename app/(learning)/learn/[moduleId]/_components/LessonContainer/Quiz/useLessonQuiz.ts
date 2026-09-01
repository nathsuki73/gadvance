import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLessonQuiz, saveLessonQuizProgress } from "./service";
import { BackendOptionResponse, BackendQuestionResponse, Quiz } from "./types";

export type QuizState = "loading" | "ready" | "started" | "completed" | "error";

export function useLessonQuiz(
  lessonBlockId: string,
  isActive: boolean,
  action?: () => void,
) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("ready");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const hasNotifiedCompletedRef = useRef(false);

  useEffect(() => {
    setHasCompletedQuiz(false);
    hasNotifiedCompletedRef.current = false;
  }, [lessonBlockId]);

  useEffect(() => {
    // 🌟 1. Safe early return: If it's not active, do ABSOLUTELY NOTHING.
    // No setStates are called here, completely satisfying the React compiler.
    if (!isActive) return;

    // Keep lesson quiz result sticky after first completion.
    // This mirrors the revisit behavior of pretest/posttest results screens.
    if (hasCompletedQuiz) {
      setQuizState("completed");
      return;
    }

    let cancelled = false;

    async function loadQuiz() {
      const isCompletedLocal =
        localStorage.getItem(`main_quiz_completed_${lessonBlockId}`) === "true";

      if (isCompletedLocal) {
        if (!cancelled) {
          setHasCompletedQuiz(true);
          setQuizState("completed");
        }
      } else {
        setQuizState("loading");
      }

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

        if (data.status === "completed" || isCompletedLocal) {
          localStorage.setItem(`main_quiz_completed_${lessonBlockId}`, "true");
          setHasCompletedQuiz(true);
          setQuizState("completed");
        } else if ((data.currentIndex ?? 0) > 0) {
          setCurrentQuestion(data.currentIndex ?? 0);
          setQuizState("started");
        } else {
          setQuizState("started");
        }
      } catch (err) {
        if (cancelled) return;
        if (isCompletedLocal) {
          setHasCompletedQuiz(true);
          setQuizState("completed");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load quiz.");
          setQuizState("error");
        }
      }
    }

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [lessonBlockId, isActive, hasCompletedQuiz]);

  // Use state variables derived directly during render phase if not active
  // This effectively mocks the "ready" state safely without using setState!
  const effectiveQuizState = isActive ? quizState : "ready";

  useEffect(() => {
    if (!isActive || quizState !== "completed") return;
    if (hasNotifiedCompletedRef.current) return;

    hasNotifiedCompletedRef.current = true;
    localStorage.setItem(`main_quiz_completed_${lessonBlockId}`, "true");
    action?.();
  }, [action, isActive, lessonBlockId, quizState]);

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
        const response = await saveLessonQuizProgress(quiz.attemptId, {
          question_id: questionId,
          selected_choice_id: selectedChoiceId,
          current_index: nextIndexPointer,
        });

        if (response.success && response.data) {
          if (response.data.quiz_status === "completed") {
            localStorage.setItem(
              `main_quiz_completed_${lessonBlockId}`,
              "true",
            );
            setHasCompletedQuiz(true);
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
        localStorage.setItem(`main_quiz_completed_${lessonBlockId}`, "true");
        setHasCompletedQuiz(true);
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
