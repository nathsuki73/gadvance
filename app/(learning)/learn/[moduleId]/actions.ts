// app/(learning)/learn/[moduleId]/actions.ts
"use server";

import { getApi } from "./service"; // path to your api helper

/* ---------------------------------------------
 * COMPLETE BLOCK
 * -------------------------------------------*/

export async function completeBlockAction(blockId: string) {
  try {
    const api = await getApi();

    await api.post(`/learn/blocks/${blockId}/complete`);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Complete Block Error:", error);

    return {
      success: false,
      error: error?.response?.data?.message || "Failed to complete block.",
    };
  }
}

export async function fetchSurveyAction(surveyId: string) {
  try {
    const api = await getApi();
    const res = await api.get(`/surveys/${surveyId}`);
    return {
      success: true,
      data: res.data.data,
      hasSubmitted: res.data.has_submitted,
    };
  } catch (error: any) {
    console.error("Fetch Survey Action Error:", error);
    return {
      success: false,
      error: error?.message || "Unable to load survey.",
    };
  }
}

export async function submitSurveyAction(
  surveyId: string,
  answers: Array<{ question_id: string; option_id: string }>,
) {
  try {
    const api = await getApi();
    await api.post(`/surveys/${surveyId}/submit`, { answers });
    return { success: true };
  } catch (error: any) {
    console.error("Submit Survey Action Error:", error);
    return {
      success: false,
      error: error?.message || "Failed to submit survey.",
    };
  }
}

export async function fetchSurveyResultsAction(surveyId: string) {
  try {
    const api = await getApi();

    const res = await api.get(`/surveys/${surveyId}/results`);

    return {
      success: true,
      data: res.data,
    };
  } catch (error: any) {
    console.error("Fetch Survey Results Error:", error);

    return {
      success: false,
      error:
        error?.response?.data?.message || "Failed to fetch survey results.",
    };
  }
}

/* ---------------------------------------------
 * QUIZ / ASSESSMENT ACTIONS
 * -------------------------------------------*/

/**
 * Start a new quiz attempt session or load an ongoing incomplete attempt
 */
export async function startQuizAttemptAction(lessonId: string) {
  try {
    const api = await getApi();
    const res = await api.post(`/quiz/lessons/${lessonId}/attempt`);

    return {
      success: true,
      attempt: res.data.attempt,
    };
  } catch (error: any) {
    console.error("Start Quiz Attempt Error:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message || "Failed to initialize quiz attempt.",
    };
  }
}

/**
 * Save an individual question response answer and auto-advance the current index tracking state
 */
export async function saveQuizAnswerAction(
  attemptId: string,
  payload: {
    quiz_block_id: string;
    selected_option: string;
    is_correct: boolean;
    next_index: number;
  },
) {
  try {
    const api = await getApi();
    const res = await api.post(`/quiz/attempts/${attemptId}/answer`, payload);

    return {
      success: true,
      currentQuestionIndex: res.data.current_question_index,
    };
  } catch (error: any) {
    console.error("Save Quiz Answer Error:", error);
    return {
      success: false,
      error: error?.response?.data?.message || "Failed to save answer metrics.",
    };
  }
}

/**
 * Finalize the overall quiz attempt session, compile score metrics, and lock row modifications
 */
export async function submitQuizAttemptAction(attemptId: string) {
  try {
    const api = await getApi();
    const res = await api.post(`/quiz/attempts/${attemptId}/submit`);

    return {
      success: true,
      data: res.data, // Contains score, correct_answers, total_questions
    };
  } catch (error: any) {
    console.error("Submit Quiz Attempt Error:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        "Failed to evaluate assessment calculations.",
    };
  }
}
