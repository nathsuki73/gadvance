"use client";

import { useToast } from "@/app/components/context/ToastContext";
import {
  getAssessmentViewData,
  getAssessmentState,
  submitAssessment,
  submitPollVote,
  retakeAssessment,
} from "../_components/AssessmentContainer/assessmentService"; // Path to your service file

export function useAssessmentActions() {
  const { showToast } = useToast();

  const handleFetchViewData = async (
    id: string,
    sectionItemId?: string,
    moduleId?: string,
  ) => {
    try {
      return await getAssessmentViewData(id, sectionItemId, moduleId);
    } catch (error: any) {
      const message = error?.message || "Failed to load assessment details.";
      showToast(message, "error");
      throw error;
    }
  };

  const handleFetchState = async (
    assessmentId: string,
    sectionItemId: string,
    moduleId?: string,
  ) => {
    const res = await getAssessmentState(assessmentId, sectionItemId, moduleId);
    if (!res.success) {
      showToast(res.error || "Failed to fetch assessment state.", "error");
    }
    return res;
  };

  const handleSubmit = async (payload: {
    assessmentId: string;
    moduleId: string;
    sectionId?: string;
    sectionItemId: string;
    answers: any[];
  }) => {
    const res = await submitAssessment(payload);
    if (!res.success) {
      showToast(res.error || "Failed to submit assessment.", "error");
    } else {
      showToast("Assessment submitted successfully!", "success");
    }
    return res;
  };

  const handlePollVote = async (
    assessmentId: string,
    itemId: string,
    questionId: string,
    choiceId: string,
    moduleId?: string,
  ) => {
    const res = await submitPollVote(
      assessmentId,
      itemId,
      questionId,
      choiceId,
      moduleId,
    );
    if (!res.success) {
      showToast(res.error || "Failed to submit vote.", "error");
    } else {
      showToast("Vote recorded!", "success");
    }
    return res;
  };

  const handleRetake = async (
    assessmentId: string,
    sectionItemId: string,
    moduleId?: string,
  ) => {
    const res = await retakeAssessment(assessmentId, sectionItemId, moduleId);
    if (!res.success) {
      showToast(res.error || "Failed to reset assessment.", "error");
    } else {
      showToast("Assessment restarted.", "success");
    }
    return res;
  };

  return {
    handleFetchViewData,
    handleFetchState,
    handleSubmit,
    handlePollVote,
    handleRetake,
  };
}
