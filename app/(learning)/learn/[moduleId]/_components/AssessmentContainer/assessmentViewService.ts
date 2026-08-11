import { getSession } from "next-auth/react";
import {
  AssessmentViewData,
  Question,
  Choice,
  AssessmentMode,
  AssessmentSettings,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

function generateMockPercentages(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [100];

  const raw = Array.from(
    { length: count },
    () => Math.floor(Math.random() * 40) + 10,
  );
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((val) => Math.round((val / sum) * 100));
}

function normalizeAssessmentData(payload: any, id: string): AssessmentViewData {
  // 🔑 Unpack data wrapper if present
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
    const pollPercentages = generateMockPercentages(rawOptions.length);

    let mappedChoices: Choice[] = rawOptions.map((o: any, idx: number) => ({
      id: o.id || `choice-${idx}`,
      text: o.optionText || o.option_text || o.text || "",
      isCorrect: Boolean(o.isCorrect ?? o.is_correct),
      explanation: o.explanation || "",
      percentage: pollPercentages[idx] || 0,
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
  };
}

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
  const res = await fetch(`${API_BASE_URL}/api/assessments/${id}`, {
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
