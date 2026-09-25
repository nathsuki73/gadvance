import { apiFetch } from "@/app/lib/api-client";
import {
  AssessmentViewData,
  Question,
  Choice,
  AssessmentMode,
  AssessmentSettings,
} from "../types";

export type AnswerPayload = {
  question_id: string;
  choice_id: string;
  time_spent_seconds?: number;
  answered_at?: string;
};

export type SubmissionResultData = {
  attempt_id?: string;
  score?: number;
  total_points?: number;
  score_percentage?: number;
  passed?: boolean;
  has_passed?: boolean;
  passing_score?: number;
  remedial_suggestions?: Array<{
    page_id: string;
    block_id: string;
    review_url: string;
  }>;
};

export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  score?: number;
  total_points?: number;
  score_percentage?: number;
  has_passed?: boolean;
  passing_score?: number;
  answers?: any;
  remedial_suggestions?: Array<{
    page_id: string;
    block_id: string;
    review_url: string;
  }>;
};

export function normalizeAssessmentData(
  payload: any,
  id: string,
): AssessmentViewData & {
  draft_answers?: Record<string, string>;
} {
  const data = payload?.data ?? payload;
  const settingsObj = data.settings || {};
  const mode: AssessmentMode = settingsObj.type || data.type || "quiz";

  const settings: AssessmentSettings = {
    title: data.title || settingsObj.title || "Untitled Assessment",
    instructions: data.instructions || settingsObj.instructions || "",
    type: mode,
    passingScore: Number(settingsObj.passingScore ?? data.passing_score ?? 70),
    timeLimitMinutes: data.time_limit_minutes
      ? Number(data.time_limit_minutes)
      : null,
    maxAttempts: data.max_attempts ? Number(data.max_attempts) : null,
    shuffleQuestions: false,
    shuffleOptions: false,
    showFeedbackImmediately: Boolean(data.show_feedback_immediately ?? true),
    allowReview: Boolean(data.allow_review ?? true),
    requirePassingToProceed: Boolean(data.require_passing_to_proceed ?? false),
    enableAdaptiveMapping: Boolean(data.enable_adaptive_mapping ?? true),
    showFinalResults: true,
    showRemediation: true,
    showAnswerStats: true,
    status: data.status || "draft",
  };

  const rawQuestions: any[] = data.questions || [];
  const mappedQuestions: Question[] = rawQuestions.map(
    (q: any, idx: number) => {
      const rawOptions = q.options || q.choices || [];
      const mappedChoices: Choice[] = rawOptions.map(
        (o: any, cIdx: number) => ({
          id: o.id || `choice-${cIdx}`,
          text: o.optionText || o.option_text || o.text || "",
          isCorrect: Boolean(o.isCorrect ?? o.is_correct),
          explanation: o.explanation || "",
        }),
      );

      const correctChoice = mappedChoices.find((c) => c.isCorrect);

      return {
        id: q.id,
        text: q.questionText || q.question_text || q.text || "",
        type: q.type || "multiple_choice",
        points: q.points ?? 1,
        bloomLevel: (q.bloomsLevel || q.blooms_level || 1) as any,
        explanation: q.explanation || "",
        choices: mappedChoices,
        correctChoiceId: correctChoice
          ? correctChoice.id
          : (q.correctChoiceId ?? null),
        isPoll: false,
      };
    },
  );

  return {
    id: data.id || id,
    title: settings.title,
    instructions: settings.instructions,
    type: mode,
    settings,
    questions: mappedQuestions,
    updatedAt: data.updated_at || data.updatedAt,
    previous_attempt: data.previous_attempt,
    user_has_completed: data.user_has_completed,
    draft_answers: data.draft_answers || {},
    current_index: data.current_index ?? 0,
  };
}

export async function getAssessmentViewData(
  id: string,
  sectionItemId?: string,
  moduleId?: string,
): Promise<AssessmentViewData> {
  const queryParams = new URLSearchParams();
  if (sectionItemId) queryParams.append("section_item_id", sectionItemId);
  if (moduleId) queryParams.append("module_id", moduleId);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const res = await apiFetch(`/api/assessments/${id}${queryStr}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res || !res.ok) {
    const errorJson = await res?.json().catch(() => null);
    throw new Error(errorJson?.message || `Assessment #${id} not found.`);
  }

  const rawData = await res.json();
  return normalizeAssessmentData(rawData, id);
}

export async function submitAssessment(payload: {
  assessmentId: string;
  moduleId: string;
  sectionId?: string;
  sectionItemId: string;
  answers: AnswerPayload[];
}): Promise<ServiceResponse<SubmissionResultData & { answers?: any }>> {
  try {
    const res = await apiFetch(
      `/api/assessments/${payload.assessmentId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({
          module_id: payload.moduleId,
          section_id: payload.sectionId,
          section_item_id: payload.sectionItemId,
          answers: payload.answers,
        }),
      },
    );

    if (!res) {
      return { success: false, error: "Network error: No response received." };
    }

    const json = await res.json().catch(() => ({}));

    // Log the exact raw response received from the submit endpoint
    console.log("SUBMIT API RAW RESPONSE:", json);

    if (!res || !res.ok) return { success: false, error: json?.message };

    return {
      success: json.success ?? res.ok,
      data: json.data ?? json,
      score: json.score,
      total_points: json.total_points,
      score_percentage: json.score_percentage,
      has_passed: json.has_passed,
      passing_score: json.passing_score,
      remedial_suggestions: json.remedial_suggestions,
      answers: json.answers ?? json.data?.answers,
      message: json.message,
    };
  } catch (error: any) {
    console.error("SUBMIT API ERROR:", error);
    return { success: false, error: error?.message };
  }
}

export async function retakeAssessment(
  assessmentId: string,
  sectionItemId: string,
  moduleId?: string,
): Promise<
  ServiceResponse<{ attempt_id?: string; assessment?: AssessmentViewData }>
> {
  try {
    const res = await apiFetch(`/api/assessments/${assessmentId}/retake`, {
      method: "POST",
      body: JSON.stringify({
        section_item_id: sectionItemId,
        module_id: moduleId,
      }),
    });

    if (!res) {
      return { success: false, error: "Network error: No response received." };
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, error: json?.message };

    const normalizedAssessment = json.data
      ? normalizeAssessmentData(json.data, assessmentId)
      : undefined;

    return {
      success: json.success ?? res.ok,
      data: {
        attempt_id: json.attempt_id ?? json.data?.id,
        assessment: normalizedAssessment,
      },
      message: json.message,
    };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
