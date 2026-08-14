import { getSession } from "next-auth/react";
import {
  AssessmentViewData,
  Question,
  Choice,
  AssessmentMode,
  AssessmentSettings,
} from "./types";

// Safe API Base URL resolution (prevents double '/api/api' path issues)
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = `${rawBaseUrl.replace(/\/$/, "")}/api`;

export type AnswerPayload = {
  question_id: string;
  choice_id: string;
};

export type AssessmentStateData = {
  attempt_id: string;
  status: "in_progress" | "completed" | "expired";
  draft_answers: AnswerPayload[];
  remaining_seconds: number | null;
  time_limit_minutes: number | null;
};

export type PollDistributionItem = {
  votes: number;
  percentage: number;
};

export type SubmissionResultData = {
  attempt_id?: string;
  score?: number;
  total_points?: number;
  percentage?: number;
  passed?: boolean;
  passing_score?: number;
  is_poll?: boolean;
  poll_distributions?: Record<string, PollDistributionItem | number>;
};

export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  is_poll?: boolean;
  poll_distributions?: Record<string, PollDistributionItem | number>;
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  try {
    const session = await getSession();
    const token = (session as any)?.laravelJwt;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("[AssessmentViewService] Auth error:", error);
  }

  return headers;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function normalizeAssessmentData(payload: any, id: string): AssessmentViewData {
  // Unpack data wrapper if present
  const data = payload?.data ?? payload;
  const settingsObj = data.settings || {};
  const mode: AssessmentMode =
    settingsObj.type || data.type || data.assessment_type || "quiz";

  const shuffleQuestions = Boolean(
    settingsObj.shuffleQuestions ?? data.shuffle_questions,
  );
  const shuffleOptions = Boolean(
    settingsObj.shuffleOptions ?? data.shuffle_options,
  );

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
    shuffleQuestions,
    shuffleOptions,
    showFeedbackImmediately: Boolean(
      settingsObj.showFeedbackImmediately ??
      data.show_feedback_immediately ??
      mode === "quiz",
    ),
    allowReview: Boolean(settingsObj.allowReview ?? data.allow_review ?? true),
    enableAdaptiveMapping: Boolean(
      settingsObj.enableAdaptiveMapping ?? data.enable_adaptive_mapping ?? true,
    ),
    showFinalResults: true,
    showRemediation: mode === "quiz",
    showAnswerStats: true,
    status: data.status || settingsObj.status || "draft",
  };

  const rawQuestions: any[] = data.questions || [];

  let mappedQuestions: Question[] = rawQuestions.map((q: any) => {
    const rawOptions = q.options || q.choices || [];

    let mappedChoices: Choice[] = rawOptions.map((o: any, idx: number) => ({
      id: o.id || `choice-${idx}`,
      text: o.optionText || o.option_text || o.text || "",
      isCorrect: Boolean(o.isCorrect ?? o.is_correct),
      explanation: o.explanation || "",
      votes: o.votes ?? 0, // 🔑 Map true vote count from backend DB
      percentage: o.percentage ?? 0, // 🔑 Map true percentage from backend DB
    }));

    if (shuffleOptions) {
      mappedChoices = shuffleArray(mappedChoices);
    }

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

  if (shuffleQuestions) {
    mappedQuestions = shuffleArray(mappedQuestions);
  }

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
  };
}

/**
 * 1. Fetch Assessment Content and Settings
 */
export async function getAssessmentViewData(
  id: string,
): Promise<AssessmentViewData> {
  if (typeof window !== "undefined") {
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

  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/assessments/${id}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error(
      `Assessment #${id} not found or inaccessible (HTTP ${res.status}).`,
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
): Promise<ServiceResponse<AssessmentStateData>> {
  const headers = await getAuthHeaders();

  try {
    const res = await fetch(
      `${API_BASE_URL}/assessments/${assessmentId}/state?section_item_id=${sectionItemId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("[AssessmentViewService] Fetch state error:", error);
    return {
      success: false,
      error: "Network error fetching assessment state.",
    };
  }
}

/**
 * 3. Auto-Save Choice Selections as Draft
 */
export async function saveAssessmentDraft(
  assessmentId: string,
  sectionItemId: string,
  answers: AnswerPayload[],
  questionOrder: string[] = [],
  currentIndex: number = 0,
): Promise<ServiceResponse<void>> {
  const headers = await getAuthHeaders();

  try {
    const res = await fetch(
      `${API_BASE_URL}/assessments/${assessmentId}/save-draft`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          section_item_id: sectionItemId,
          answers,
          question_order: questionOrder,
          current_index: currentIndex,
        }),
      },
    );

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("[AssessmentViewService] Save draft error:", error);
    return { success: false, error: "Network error saving draft." };
  }
}

/**
 * 4. Submit Assessment, Evaluate Grade, and Fill DonutProgress
 */
export async function submitAssessment(payload: {
  assessmentId: string;
  moduleId: string;
  sectionId: string;
  sectionItemId: string;
  answers: AnswerPayload[];
}): Promise<
  ServiceResponse<SubmissionResultData & { remedial_suggestions?: any[] }>
> {
  const headers = await getAuthHeaders();

  try {
    const res = await fetch(
      `${API_BASE_URL}/assessments/${payload.assessmentId}/submit`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          module_id: payload.moduleId,
          section_id: payload.sectionId,
          section_item_id: payload.sectionItemId,
          answers: payload.answers,
        }),
      },
    );

    const json = await res.json();

    // 🔑 FIX: Ensure Laravel's returned root 'data' or top-level properties are accessible
    return {
      success: json.success ?? res.ok,
      data: json.data ?? json,
      poll_distributions: json.poll_distributions,
      message: json.message,
    };
  } catch (error) {
    console.error("[AssessmentViewService] Submission error:", error);
    return { success: false, error: "Network error submitting assessment." };
  }
}

/**
 * 5. Reset Assessment Attempt for Retake
 */
export async function retakeAssessment(
  assessmentId: string,
  sectionItemId: string,
): Promise<ServiceResponse<void>> {
  const headers = await getAuthHeaders();

  try {
    const res = await fetch(
      `${API_BASE_URL}/assessments/${assessmentId}/retake`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ section_item_id: sectionItemId }),
      },
    );

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("[AssessmentViewService] Retake error:", error);
    return { success: false, error: "Network error resetting assessment." };
  }
}
