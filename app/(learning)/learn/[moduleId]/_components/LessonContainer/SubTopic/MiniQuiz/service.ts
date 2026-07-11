"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import {
  Question,
  Quiz,
  LessonQuizResponse,
  MiniQuizAttemptData,
  LessonQuizQuestionResponse,
  LessonQuizOptionResponse,
} from "./types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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

// Helper utility to safely guard whether our dynamic response is the attempt wrapper object
function isMiniQuizAttemptData(
  data: LessonQuizQuestionResponse[] | MiniQuizAttemptData,
): data is MiniQuizAttemptData {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "questions" in data
  );
}

// 🟢 FETCH ENGINE FOR MINI QUIZ
export async function fetchMiniQuiz(lessonBlockId: string): Promise<Quiz> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonBlockId}/mini-quiz`,
    {
      method: "GET",
      headers: authHeaders,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ?? `Failed to fetch mini quiz: ${response.status}`,
    );
  }

  const json: LessonQuizResponse = await response.json();
  const serverData = json.data;

  // Dynamically resolve where the questions list lives depending on response schema shape
  const rawQuestions: LessonQuizQuestionResponse[] = isMiniQuizAttemptData(
    serverData,
  )
    ? serverData.questions
    : serverData;

  const formattedQuestions: Question[] = (rawQuestions || []).map(
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

  const baseQuiz = {
    id: lessonBlockId,
    title: "Mini Quiz",
    description: "Test what you've learned before continuing.",
    questions: formattedQuestions,
  };

  // If the backend returned full structured object attempt logs, merge them into the contract
  if (isMiniQuizAttemptData(serverData)) {
    return {
      ...baseQuiz,
      attemptId: serverData.attempt_id,
      attempt_id: serverData.attempt_id,
      currentIndex: serverData.current_index,
      status: serverData.status,
      previouslySavedAnswers: serverData.previously_saved_answers,
      score: serverData.score,
    };
  }

  return baseQuiz;
}

export interface SaveMiniQuizSuccessPayload {
  message: string;
  quiz_status: "started" | "completed";
  current_index?: number;
}

export interface SaveMiniQuizResponse {
  success: boolean;
  data?: SaveMiniQuizSuccessPayload;
  error?: string;
}

// 🟢 PROGRESS SAVE ENGINE FOR MINI QUIZ
export async function saveMiniQuizProgress(
  attemptId: string,
  payload: {
    question_id: string;
    selected_choice_id: string;
    current_index: number;
  },
): Promise<SaveMiniQuizResponse> {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/mini-quiz-attempts/${attemptId}/save-answer`,
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
          result.message ||
          `Failed to sync mini-quiz answer: ${response.status}`,
      };
    }

    return {
      success: true,
      data: result.data as SaveMiniQuizSuccessPayload,
    };
  } catch (error: unknown) {
    console.error("Mini quiz persistence pipeline crash:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Network transaction error",
    };
  }
}
