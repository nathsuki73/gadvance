import { apiFetch } from "@/app/lib/api-client";
import {
  AssessmentViewData,
  Choice,
  Question,
  AssessmentSettings,
} from "../types";

export type PollDistributionItem = {
  votes: number;
  percentage: number;
};

export type PollViewData = AssessmentViewData & {
  user_voted_map: Record<string, string>;
  draft_answers?: Record<string, string>;
  current_index?: number;
};

export function normalizePollData(payload: any, id: string): PollViewData {
  const data = payload?.data ?? payload;
  const settingsObj = data.settings || {};

  const settings: AssessmentSettings = {
    title: data.title || settingsObj.title || "Untitled Poll",
    instructions: data.instructions || settingsObj.instructions || "",
    type: "poll",
    passingScore: 0,
    timeLimitMinutes: null,
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    showFeedbackImmediately: false,
    allowReview: true,
    requirePassingToProceed: false,
    enableAdaptiveMapping: false,
    showFinalResults: true,
    showRemediation: false,
    showAnswerStats: true,
    status: data.status || "active",
  };

  const rawQuestions: any[] = data.questions || [];
  const mappedQuestions: Question[] = rawQuestions.map(
    (q: any, idx: number) => {
      const rawOptions = q.options || q.choices || [];
      const mappedChoices: Choice[] = rawOptions.map(
        (o: any, cIdx: number) => ({
          id: o.id || `choice-${cIdx}`,
          text: o.optionText || o.option_text || o.text || "",
          isCorrect: false,
          explanation: "",
          votes: o.votes ?? 0,
          percentage: o.percentage ?? 0,
        }),
      );

      return {
        id: q.id,
        text: q.questionText || q.question_text || q.text || "",
        type: "poll",
        points: 0,
        bloomLevel: 1,
        explanation: "",
        choices: mappedChoices,
        correctChoiceId: null,
        isPoll: true,
      };
    },
  );

  return {
    id: data.id || id,
    title: settings.title,
    instructions: settings.instructions,
    type: "poll",
    settings,
    questions: mappedQuestions,
    updatedAt: data.updated_at,
    user_voted_map: data.user_voted_map || {},
    draft_answers: data.draft_answers || {},
    current_index: data.current_index ?? 0,
  };
}

export async function getPollViewData(
  id: string,
  sectionItemId?: string,
  moduleId?: string,
): Promise<PollViewData> {
  const queryParams = new URLSearchParams();
  if (sectionItemId) queryParams.append("section_item_id", sectionItemId);
  if (moduleId) queryParams.append("module_id", moduleId);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const res = await apiFetch(`/api/polls/${id}${queryStr}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res || !res.ok) {
    const errorJson = await res?.json().catch(() => null);
    throw new Error(errorJson?.message || `Poll #${id} not found.`);
  }

  const rawData = await res.json();
  return normalizePollData(rawData, id);
}

export async function submitPollVote(
  assessmentId: string,
  itemId: string,
  questionId: string,
  choiceId: string,
  moduleId?: string,
): Promise<{
  success: boolean;
  poll_distributions?: Record<string, PollDistributionItem>;
  message?: string;
  error?: string;
}> {
  try {
    const res = await apiFetch(`/api/polls/${assessmentId}/vote`, {
      method: "POST",
      body: JSON.stringify({
        section_item_id: itemId,
        module_id: moduleId,
        question_id: questionId,
        choice_id: choiceId,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res || !res.ok) return { success: false, error: json?.message };

    return {
      success: json.success ?? res.ok,
      poll_distributions: json.poll_distributions,
      message: json.message,
    };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
