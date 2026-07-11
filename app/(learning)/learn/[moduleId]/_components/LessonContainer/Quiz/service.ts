"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import {
  LessonQuizOptionResponse,
  LessonQuizQuestionResponse,
  LessonQuizResponse,
  Question,
  Quiz,
  SaveAnswerResponse,
} from "./types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

/**
 * Shared helper to securely inject the logged-in user's JWT bearer token
 * into headers without code duplication.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getServerSession(authOptions);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (session?.laravelJwt) {
    headers["Authorization"] = `Bearer ${session.laravelJwt}`;
  }

  return headers;
}

// 1. SECURE FETCH ACTION FOR LESSON QUIZ
export async function fetchLessonQuiz(lessonBlockId: string): Promise<Quiz> {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonBlockId}/quiz`,
    {
      method: "GET",
      headers: authHeaders,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `Failed to fetch quiz: ${response.status}`,
    );
  }

  const json = await response.json();
  const serverData = json.data; // Targets the unified backend inner payload block

  const formattedQuestions: Question[] = (serverData.questions || []).map(
    (question: LessonQuizQuestionResponse) => ({
      id: question.id,
      question: question.question_text,
      choices: (question.options || []).map(
        (option: LessonQuizOptionResponse) => ({
          id: option.id,
          text: option.option_text,
        }),
      ),
      correctAnswer:
        question.options.find(
          (option: LessonQuizOptionResponse) => option.is_correct,
        )?.id ?? "",
    }),
  );

  return {
    id: lessonBlockId,
    title: "Lesson Quiz",
    description: "Answer all questions before continuing.",
    questions: formattedQuestions,

    // Extracted directly from the serverData tracker payload block
    attemptId: serverData.attempt_id,
    currentIndex: serverData.current_index ?? 0,
    status: serverData.status ?? "started",
    previouslySavedAnswers: serverData.previously_saved_answers ?? {},
    score: serverData.score ?? 0,
  };
}

// 2. SECURE PROGRESS SAVE ACTION FOR LESSON QUIZ
export async function saveLessonQuizProgress(
  attemptId: string,
  payload: {
    question_id: string;
    selected_choice_id: string;
    current_index: number;
  },
): Promise<SaveAnswerResponse> {
  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/main-quiz-attempts/${attemptId}/save-answer`,
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          result.message || `Failed to sync answer state: ${response.status}`,
      };
    }

    return {
      success: true,
      data: result.data, // Forwards the backend nested data wrapper object (score, quiz_status, etc)
    };
  } catch (error: unknown) {
    console.error("Quiz submission error pipeline:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Network transaction error",
    };
  }
}
