import { apiFetch } from "@/app/lib/api-client";
import {
  AssessmentViewData,
  Question,
  Choice,
  AssessmentMode,
  AssessmentSettings,
} from "./types";

export type AnswerPayload = {
  question_id: string;
  choice_id: string;
  time_spent_seconds?: number;
  answered_at?: string;
};

export type AssessmentStateData = {
  attempt_id: string | null;
  status: "not_started" | "in_progress" | "completed" | "expired";
  draft_answers: Record<string, string> | AnswerPayload[];
  question_order: string[];
  current_index: number;
  remaining_seconds: number | null;
  time_limit_minutes: number | null;
  is_poll: boolean;
  poll_distributions: Record<string, { votes: number; percentage: number }>;
  voted_question_ids: string[];
};

export type PollDistributionItem = {
  votes: number;
  percentage: number;
};

export type SubmissionResultData = {
  attempt_id?: string;
  score?: number;
  total_points?: number;
  score_percentage?: number;
  passed?: boolean;
  has_passed?: boolean;
  passing_score?: number;
  is_poll?: boolean;
  poll_distributions?: Record<string, PollDistributionItem>;
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
  poll_distributions?: Record<string, PollDistributionItem>;
  remedial_suggestions?: Array<{
    page_id: string;
    block_id: string;
    review_url: string;
  }>;
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function normalizeAssessmentData(
  payload: any,
  id: string,
): AssessmentViewData & {
  user_voted_map?: Record<string, string>;
  draft_answers?: Record<string, string>;
} {
  const data = payload?.data ?? payload;
  const settingsObj = data.settings || {};
  const mode: AssessmentMode =
    settingsObj.type || data.type || data.assessment_type || "quiz";

  const rawMaxAttempts = settingsObj.maxAttempts ?? data.max_attempts;
  const parsedMaxAttempts =
    rawMaxAttempts !== null &&
    rawMaxAttempts !== undefined &&
    rawMaxAttempts !== ""
      ? Number(rawMaxAttempts)
      : null;

  const rawTimeLimit = settingsObj.timeLimitMinutes ?? data.time_limit_minutes;
  const parsedTimeLimit =
    rawTimeLimit !== null && rawTimeLimit !== undefined && rawTimeLimit !== ""
      ? Number(String(rawTimeLimit).replace(/[^0-9]/g, "")) || null
      : null;

  const settings: AssessmentSettings = {
    title: data.title || settingsObj.title || "Untitled Assessment",
    instructions: data.instructions || settingsObj.instructions || "",
    type: mode,
    passingScore: Number(settingsObj.passingScore ?? data.passing_score ?? 70),
    timeLimitMinutes: parsedTimeLimit,
    maxAttempts: parsedMaxAttempts,
    shuffleQuestions: false,
    shuffleOptions: false,
    showFeedbackImmediately: Boolean(
      settingsObj.showFeedbackImmediately ??
      data.show_feedback_immediately ??
      mode === "quiz",
    ),
    allowReview: Boolean(settingsObj.allowReview ?? data.allow_review ?? true),
    requirePassingToProceed: Boolean(
      settingsObj.requirePassingToProceed ??
      data.require_passing_to_proceed ??
      false,
    ),
    enableAdaptiveMapping: Boolean(
      settingsObj.enableAdaptiveMapping ?? data.enable_adaptive_mapping ?? true,
    ),
    showFinalResults: true,
    showRemediation: mode === "quiz",
    showAnswerStats: true,
    status: data.status || settingsObj.status || "draft",
  };

  const rawQuestions: any[] = data.questions || [];

  const mappedQuestions: Question[] = rawQuestions.map((q: any) => {
    const rawOptions = q.options || q.choices || [];

    const mappedChoices: Choice[] = rawOptions.map((o: any, idx: number) => ({
      id: o.id || `choice-${idx}`,
      text: o.optionText || o.option_text || o.text || "",
      isCorrect: Boolean(o.isCorrect ?? o.is_correct),
      explanation: o.explanation || "",
      votes: o.votes ?? 0, // 👈 Preserves backend vote counts
      percentage: o.percentage ?? 0, // 👈 Preserves backend percentage
    }));

    const correctChoice = mappedChoices.find((c) => c.isCorrect);

    return {
      id: q.id,
      text: q.questionText || q.question_text || q.text || "Untitled Question",
      type: q.type || "multiple_choice",
      points: q.points ?? 1,
      bloomLevel: (q.bloomsLevel || q.blooms_level || q.bloomLevel || 1) as any,
      explanation: q.explanation || "",
      choices: mappedChoices,
      correctChoiceId: correctChoice
        ? correctChoice.id
        : (q.correctChoiceId ?? null),
      isPoll: mode === "poll" || Boolean(q.isPoll),
    };
  });

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
    user_voted_map: data.user_voted_map || {}, // 👈 Required for reload hydration
    draft_answers: data.draft_answers || {}, // 👈 Required for draft hydration
    current_index: data.current_index ?? 0,
  };
}

/**
 * 1. Fetch Assessment Content and Settings
 */
export async function getAssessmentViewData(
  id: string,
  sectionItemId?: string,
  moduleId?: string,
): Promise<AssessmentViewData> {
  // 🛑 Only use local preview storage if explicitly in preview mode (avoid student state override)
  if (
    typeof window !== "undefined" &&
    window.location.pathname.includes("/preview")
  ) {
    const cachedPreview = localStorage.getItem(`assessment_preview_${id}`);
    if (cachedPreview) {
      try {
        const parsed = JSON.parse(cachedPreview);
        return normalizeAssessmentData(parsed, id);
      } catch (e) {
        console.warn(
          "[AssessmentViewService] Could not parse local preview JSON.",
          e,
        );
      }
    }
  }

  const queryParams = new URLSearchParams();
  if (sectionItemId) queryParams.append("section_item_id", sectionItemId);
  if (moduleId) queryParams.append("module_id", moduleId);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const res = await apiFetch(`/api/assessments/${id}${queryStr}`, {
    method: "GET",
    cache: "no-store", // 👈 Ensure browser/Next.js doesn't cache the API fetch blindly
  });

  if (!res || !res.ok) {
    const errorJson = await res?.json().catch(() => null);
    if (res?.status === 403 && errorJson?.code === "MODULE_UNPUBLISHED") {
      const err = new Error(
        errorJson.message || "Module is currently unpublished.",
      );
      (err as any).code = "MODULE_UNPUBLISHED";
      throw err;
    }
    throw new Error(
      errorJson?.message ||
        `Assessment #${id} not found or inaccessible (HTTP ${res?.status ?? "unknown"}).`,
    );
  }

  const rawData = await res.json();
  return normalizeAssessmentData(rawData, id);
}

/**
 * 2. Fetch Active Attempt State, Draft Answers, and Remaining Timer
 */
export async function getAssessmentState(
  assessmentId: string,
  sectionItemId: string,
  moduleId?: string,
): Promise<ServiceResponse<AssessmentStateData>> {
  try {
    const queryParams = new URLSearchParams({ section_item_id: sectionItemId });
    if (moduleId) queryParams.append("module_id", moduleId);

    const res = await apiFetch(
      `/api/assessments/${assessmentId}/state?${queryParams.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!res) {
      return { success: false, error: "Network error: No response received." };
    }

    const json = await res.json().catch(() => ({}));

    if (!res || !res.ok) {
      return {
        success: false,
        code: json?.code,
        message: json?.message,
        error: json?.message || "Failed to fetch assessment state.",
      };
    }

    return json;
  } catch (error: any) {
    console.error("[AssessmentViewService] Fetch state error:", error);
    return {
      success: false,
      error: error?.message || "Network error fetching assessment state.",
    };
  }
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

    // 🔍 DEBUG LOG: Check what the backend is actually sending back on submit
    console.log("🔍 SUBMIT API RAW RESPONSE:", json);

    if (!res || !res.ok) {
      return {
        success: false,
        code: json?.code,
        message: json?.message,
        error: json?.message || "Failed to submit assessment.",
      };
    }

    return {
      success: json.success ?? res.ok,
      data: {
        ...(json.data ?? json),
        answers: json.answers ?? json.data?.answers,
      },
      score: json.score,
      total_points: json.total_points,
      score_percentage: json.score_percentage,
      has_passed: json.has_passed,
      passing_score: json.passing_score,
      poll_distributions: json.poll_distributions,
      remedial_suggestions: json.remedial_suggestions,
      message: json.message,
    };
  } catch (error: any) {
    console.error("[AssessmentViewService] Submission error:", error);
    return {
      success: false,
      error: error?.message || "Network error submitting assessment.",
    };
  }
}

/**
 * 4. Submit Individual Poll Vote
 */
export async function submitPollVote(
  assessmentId: string,
  itemId: string,
  questionId: string,
  choiceId: string,
  moduleId?: string,
): Promise<
  ServiceResponse<{
    poll_distributions: Record<string, PollDistributionItem>;
  }>
> {
  try {
    const res = await apiFetch(`/api/assessments/${assessmentId}/poll-vote`, {
      method: "POST",
      body: JSON.stringify({
        section_item_id: itemId,
        module_id: moduleId,
        question_id: questionId,
        choice_id: choiceId,
      }),
    });

    if (!res) {
      return { success: false, error: "Network error: No response received." };
    }

    const json = await res.json().catch(() => ({}));

    if (!res || !res.ok) {
      return {
        success: false,
        code: json?.code,
        message: json?.message,
        error: json?.message || "Failed to submit poll vote.",
      };
    }

    return {
      success: json.success ?? res.ok,
      data: json.data ?? json,
      poll_distributions: json.poll_distributions,
      message: json.message,
    };
  } catch (error: any) {
    console.error("[AssessmentViewService] Submit poll vote error:", error);
    return {
      success: false,
      error: error?.message || "Network error submitting poll vote.",
    };
  }
}

export type RetakeResponseData = {
  attempt_id?: string;
  assessment?: AssessmentViewData;
};

export async function retakeAssessment(
  assessmentId: string,
  sectionItemId: string,
  moduleId?: string,
): Promise<ServiceResponse<RetakeResponseData>> {
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

    if (!res || !res.ok) {
      return {
        success: false,
        code: json?.code,
        message: json?.message,
        error: json?.message || "Failed to reset assessment.",
      };
    }

    // 🎯 Normalize the fresh assessment payload returned directly by the retake endpoint
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
    console.error("[AssessmentViewService] Retake error:", error);
    return {
      success: false,
      error: error?.message || "Network error resetting assessment.",
    };
  }
}
