"use client";

import { useLessonQuiz } from "./useLessonQuiz";
import { QuizLoadingState } from "./QuizLoadingState";
import { QuizErrorState } from "./QuizErrorState";
import { QuizIntroState } from "./QuizIntroState";
import { QuizCompletedState } from "./QuizCompletedState";
import { QuizQuestionState } from "./QuizQuestionState";

type Props = {
  lessonBlockId: string;
  onBktUpdate?: (lessonBlockId: string, currentPLt: number) => void;
  completedAction?: () => void;
};

export function LessonQuiz({
  lessonBlockId,
  onBktUpdate,
  completedAction,
}: Props) {
  const {
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
  } = useLessonQuiz(lessonBlockId, onBktUpdate, completedAction);

  if (quizState === "loading") {
    return <QuizLoadingState />;
  }

  if (quizState === "error") {
    return <QuizErrorState error={error} />;
  }

  if (!quiz) return null;

  if (quizState === "ready") {
    return <QuizIntroState onStart={startQuiz} />;
  }

  if (quizState === "completed") {
    return <QuizCompletedState score={score} total={quiz.questions.length} />;
  }

  const question = quiz.questions[currentQuestion];

  return (
    <QuizQuestionState
      question={question}
      currentQuestion={currentQuestion}
      totalQuestions={quiz.questions.length}
      selected={answers[question.id]}
      submitted={submitted}
      isSaving={isSaving}
      onSelect={(choiceId) => selectAnswer(question.id, choiceId)}
      onNext={goToNextQuestion}
    />
  );
}
