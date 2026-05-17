// app/(learning)/learn/[moduleId]/actions.ts
"use server";

import { getApi } from "./service"; // path to your api helper

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
