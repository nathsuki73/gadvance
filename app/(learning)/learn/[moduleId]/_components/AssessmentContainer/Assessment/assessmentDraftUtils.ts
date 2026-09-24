import { AssessmentViewData } from "../types";

export interface InitialDraftState {
  answers: Record<string, string>;
  currentIndex: number;
}

const getStorageKey = (assessmentId: string, sectionItemId?: string) =>
  `assessment_local_draft_${assessmentId}_${sectionItemId || "default"}`;

/**
 * Loads and validates local storage or server drafts, pruning any deleted/stale
 * question IDs and clamping the index to valid bounds.
 */
export function loadInitialAssessmentState(
  assessmentData: AssessmentViewData,
  assessmentId: string,
  sectionItemId?: string,
): InitialDraftState {
  const questionsList = assessmentData.questions || [];
  const validQuestionIds = new Set(questionsList.map((q) => q.id));
  const storageKey = getStorageKey(assessmentId, sectionItemId);

  const prunedAnswers: Record<string, string> = {};
  let targetIndex = assessmentData.current_index || 0;
  let hasLocalDraft = false;

  // 1. Try reading from localStorage first
  if (typeof window !== "undefined" && sectionItemId) {
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.answers) {
          // Only keep answers whose question IDs still exist in the current assessment
          Object.entries(parsed.answers).forEach(([qId, val]) => {
            if (validQuestionIds.has(qId)) {
              prunedAnswers[qId] = String(val);
            }
          });
          if (parsed.currentIndex !== undefined) {
            targetIndex = Number(parsed.currentIndex);
          }
          hasLocalDraft = Object.keys(prunedAnswers).length > 0;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  }

  // 2. Fallback to server draft or previous attempt if no valid local draft found
  if (!hasLocalDraft) {
    if (
      assessmentData.draft_answers &&
      Object.keys(assessmentData.draft_answers).length > 0
    ) {
      Object.entries(assessmentData.draft_answers).forEach(([qId, val]) => {
        if (validQuestionIds.has(qId)) {
          prunedAnswers[qId] = String(val);
        }
      });
    } else if (assessmentData.previous_attempt?.answers) {
      const prev = assessmentData.previous_attempt.answers;
      Object.entries(prev).forEach(([qId, val]: [string, any]) => {
        if (validQuestionIds.has(qId)) {
          prunedAnswers[qId] = String(
            val.selected_option_id || val.choice_id || val,
          );
        }
      });
    }
  }

  // 3. Ensure the index is safe and within bounds of the current question count
  const maxIndex = Math.max(0, questionsList.length - 1);
  const safeIndex = Math.min(Math.max(0, targetIndex), maxIndex);

  return {
    answers: prunedAnswers,
    currentIndex: safeIndex,
  };
}

export function saveLocalDraft(
  assessmentId: string,
  sectionItemId: string | undefined,
  answers: Record<string, string>,
  currentIndex: number,
) {
  if (typeof window === "undefined" || !sectionItemId) return;
  const storageKey = getStorageKey(assessmentId, sectionItemId);
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      answers,
      currentIndex,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function clearLocalDraft(assessmentId: string, sectionItemId?: string) {
  if (typeof window === "undefined" || !sectionItemId) return;
  const storageKey = getStorageKey(assessmentId, sectionItemId);
  localStorage.removeItem(storageKey);
}
