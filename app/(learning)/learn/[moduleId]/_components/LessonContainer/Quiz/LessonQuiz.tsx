"use client";

import { useLessonQuiz } from "./useLessonQuiz";
import { QuizLoading } from "./_components/QuizLoading";
import { QuizError } from "./_components/QuizError";
import { QuizIntro } from "./_components/QuizIntro";
import { QuizActiveQuestion } from "./_components/QuizActiveQuestion";
import { QuizCompleted } from "./_components/QuizCompleted";

type Props = {
  lessonBlockId: string;
};

export function LessonQuiz({ lessonBlockId }: Props) {
  const {
    quiz,
    quizState,
    setQuizState,
    currentQuestion,
    submitted,
    isSaving, // Extracted
    error,
    score,
    answers,
    handleNextQuestion,
    handleSelectAnswer,
  } = useLessonQuiz(lessonBlockId);

  switch (quizState) {
    case "loading":
      return <QuizLoading />;
    case "error":
      return <QuizError error={error} />;
    case "ready":
      return <QuizIntro onStart={() => setQuizState("started")} />;
    case "completed":
      return (
        <QuizCompleted
          score={score}
          totalQuestions={quiz?.questions.length ?? 0}
        />
      );
    case "started":
      if (!quiz) return null;
      return (
        <QuizActiveQuestion
          question={quiz.questions[currentQuestion]}
          currentIndex={currentQuestion}
          totalQuestions={quiz.questions.length}
          selectedChoiceId={answers[quiz.questions[currentQuestion].id]}
          isSubmitted={submitted}
          isSaving={isSaving} // Passed down
          onSelectChoice={handleSelectAnswer}
          onNext={handleNextQuestion}
        />
      );
    default:
      return null;
  }
}
