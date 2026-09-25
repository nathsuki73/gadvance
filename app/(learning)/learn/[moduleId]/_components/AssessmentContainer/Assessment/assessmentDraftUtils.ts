import { AssessmentViewData } from "../types";

export interface InitialDraftState {
  answers: Record<string, string>;
  currentIndex: number;
  checkedQuestions: Record<string, boolean>;
  questionTimers: Record<string, number>;
  elapsedSeconds: number; // 👈 Track total elapsed time
}

const getStorageKey = (assessmentId: string, sectionItemId?: string) =>
  `assessment_local_draft_${assessmentId}_${sectionItemId || "default"}`;

export function loadInitialAssessmentState(
  assessmentData: AssessmentViewData,
  assessmentId: string,
  sectionItemId?: string,
): InitialDraftState {
  if (assessmentData.user_has_completed || assessmentData.previous_attempt) {
    if (typeof window !== "undefined" && sectionItemId) {
      clearLocalDraft(assessmentId, sectionItemId);
    }
    return {
      answers: {},
      currentIndex: 0,
      checkedQuestions: {},
      questionTimers: {},
      elapsedSeconds: 0,
    };
  }

  const questionsList = assessmentData.questions || [];
  const validQuestionIds = new Set(questionsList.map((q) => q.id));
  const storageKey = getStorageKey(assessmentId, sectionItemId);

  const prunedAnswers: Record<string, string> = {};
  const prunedChecked: Record<string, boolean> = {};
  const prunedTimers: Record<string, number> = {};
  let targetIndex = assessmentData.current_index || 0;
  let targetElapsed = 0;
  let hasLocalDraft = false;

  if (typeof window !== "undefined" && sectionItemId) {
    const local = localStorage.getItem(storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && parsed.answers) {
          Object.entries(parsed.answers).forEach(([qId, val]) => {
            if (validQuestionIds.has(qId)) {
              prunedAnswers[qId] = String(val);
            }
          });
          if (parsed.checkedQuestions) {
            Object.entries(parsed.checkedQuestions).forEach(
              ([qId, isChecked]) => {
                if (validQuestionIds.has(qId)) {
                  prunedChecked[qId] = Boolean(isChecked);
                }
              },
            );
          }
          if (parsed.questionTimers) {
            Object.entries(parsed.questionTimers).forEach(([qId, time]) => {
              if (validQuestionIds.has(qId)) {
                prunedTimers[qId] = Number(time) || 0;
              }
            });
          }
          if (parsed.elapsedSeconds !== undefined) {
            targetElapsed = Number(parsed.elapsedSeconds) || 0;
          }
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
    }
  }

  const maxIndex = Math.max(0, questionsList.length - 1);
  const safeIndex = Math.min(Math.max(0, targetIndex), maxIndex);

  return {
    answers: prunedAnswers,
    currentIndex: safeIndex,
    checkedQuestions: prunedChecked,
    questionTimers: prunedTimers,
    elapsedSeconds: targetElapsed,
  };
}

export function saveLocalDraft(
  assessmentId: string,
  sectionItemId: string | undefined,
  answers: Record<string, string>,
  currentIndex: number,
  checkedQuestions: Record<string, boolean>,
  questionTimers: Record<string, number>,
  elapsedSeconds: number, // 👈 Accept elapsedSeconds parameter
) {
  if (typeof window === "undefined" || !sectionItemId) return;
  const storageKey = getStorageKey(assessmentId, sectionItemId);
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      answers,
      currentIndex,
      checkedQuestions,
      questionTimers,
      elapsedSeconds, // 👈 Save elapsedSeconds to localStorage
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function clearLocalDraft(assessmentId: string, sectionItemId?: string) {
  if (typeof window === "undefined" || !sectionItemId) return;
  const storageKey = getStorageKey(assessmentId, sectionItemId);
  localStorage.removeItem(storageKey);
}
