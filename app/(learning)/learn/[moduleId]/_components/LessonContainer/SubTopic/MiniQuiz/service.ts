import { LessonQuizResponse, Question, Quiz } from "./types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function fetchMiniQuiz(lessonBlockId: string): Promise<Quiz> {
  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonBlockId}/mini-quiz`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message ?? `Failed to fetch mini quiz: ${response.status}`,
    );
  }

  const payload: LessonQuizResponse = await response.json();

  const formattedQuestions: Question[] = payload.data
    .sort((a, b) => a.order_index - b.order_index)
    .map((question) => ({
      id: question.id,
      question: question.question_text,
      choices: question.options.map((option) => ({
        id: option.id,
        text: option.option_text,
      })),
      correctAnswer:
        question.options.find((option) => option.is_correct)?.id ?? "",
    }));

  return {
    id: lessonBlockId,
    title: "Mini Quiz",
    description: "Test what you've learned before continuing.",
    questions: formattedQuestions,
  };
}
