"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { ApiOptions, StaticTest, LaravelQuizResponse, Question } from "./types";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

interface ExtendedApiOptions extends ApiOptions {
  requiresAuth?: boolean;
}

// 1. Keep your centralized base request engine working exactly as it is
async function request<T>(endpoint: string, options: ExtendedApiOptions = {}) {
  const requiresAuth = options.requiresAuth ?? true;
  const session = await getServerSession(authOptions);

  if (requiresAuth && !session?.laravelJwt) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (session?.laravelJwt) {
    headers["Authorization"] = `Bearer ${session.laravelJwt}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Request failed",
      };
    }

    return {
      success: true,
      data: result.data as T,
    };
  } catch (error: unknown) {
    console.error(`Fetch error at ${endpoint}:`, error);
    return {
      success: false,
      error: "Network connection error",
    };
  }
}

// 2. Refactored quiz fetch function leveraging your secure request engine
export async function fetchStaticTest(
  moduleId: string,
  type: "pre_test" | "post_test" = "pre_test",
): Promise<{ success: boolean; data?: StaticTest; error?: string }> {
  console.log("fetchStaticTest called securely on the server");

  const backendType = type === "pre_test" ? "pre_test" : "post_test";

  // Use the internal engine wrapper to automatically inject your laravelJwt string header!
  const response = await request<LaravelQuizResponse["data"]>(
    `/modules/${moduleId}/static-test?type=${backendType}`,
    {
      method: "GET",
      requiresAuth: true, // Forces token extraction checks
    },
  );

  // If authorization or backend queries failed, safely return the error upward
  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || "Failed to load test data",
    };
  }

  const serverData = response.data;

  // Format database entries cleanly into your React component props structure
  const formattedQuestions: Question[] = serverData.questions.map((q) => {
    const choices = Object.entries(q.options).map(([key, value]) => ({
      id: key,
      text: String(value),
    }));

    return {
      id: String(q.id),
      question: q.question_text,
      choices: choices,
      correctAnswer: q.correct_answer,
    };
  });

  return {
    success: true,
    data: {
      id: serverData.test_id,
      attemptId: serverData.attempt_id,
      title: `${serverData.test_type === "pre_test" ? "Pre-Test" : "Post-Test"} Assessment`,
      description: serverData.description || "Assessment Checklist",
      questions: formattedQuestions,
      currentIndex: serverData.current_index,
      previouslySavedAnswers: serverData.previously_saved_answers,

      status: serverData.status,
      score: serverData.score ?? 0,
    },
  };
}

export async function saveQuizProgress(
  attemptId: string,
  payload: {
    question_id: string;
    selected_choice_id: string;
    current_index: number;
  },
): Promise<{
  success: boolean;
  data?: LaravelQuizResponse["data"];
  error?: string;
}> {
  const response = await request<LaravelQuizResponse["data"]>(
    `/quiz-attempts/${attemptId}/save-answer`,
    {
      method: "POST",
      body: payload,
      requiresAuth: true,
    },
  );

  if (!response.success) {
    return {
      success: false,
      error: response.error || "Failed to save progress",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}
