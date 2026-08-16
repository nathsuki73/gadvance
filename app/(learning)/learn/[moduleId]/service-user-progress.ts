"use client";

import { apiFetch } from "@/app/lib/api-client";

export type SaveLearningProgressPayload = {
  module_id: string;
  section_id: string;
  learning_item_id: string;
  progress: number;
};

export type ProgressRecord = {
  id?: number;
  user_id?: string;
  module_id?: string;
  section_id?: string;
  learning_item_id: string;
  progress: number;
};

export type SectionSummary = {
  section_id: string;
  total_items: number;
  completed_items: number;
  percentage: number;
};

export type LearningProgressResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: ProgressRecord[] | ProgressRecord | any;
  completed_item_ids?: string[];
  section_summaries?: SectionSummary[];
  course_progress?: number;
  certificate?: {
    azure_file_path: string;
    verify_code: string;
  } | null;
};

export const getLearningProgress = async (
  moduleId: string,
): Promise<LearningProgressResponse> => {
  try {
    // 🔑 Added /api/ prefix
    const response = await apiFetch(`/api/learning-progress/${moduleId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response || !response.ok) {
      return { success: false, error: "Failed to fetch progress records" };
    }

    const result = await response.json();

    return {
      success: true,
      data: result.data || [],
      completed_item_ids: result.completed_item_ids || [],
      section_summaries: result.section_summaries || [],
    };
  } catch (error) {
    console.error("Fetch learning progress error:", error);
    return { success: false, error: "Network error" };
  }
};

export const saveLearningProgress = async (
  payload: SaveLearningProgressPayload,
): Promise<LearningProgressResponse> => {
  try {
    // 🔑 Added /api/ prefix
    const response = await apiFetch(`/api/learning-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response || !response.ok) {
      return { success: false, error: "Failed to save learning progress" };
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message,
      data: result.data,
      course_progress: result.course_progress,
    };
  } catch (error) {
    console.error("Save learning progress error:", error);
    return { success: false, error: "Network error" };
  }
};

/**
 * 🚀 Milestone sync action: Recalculates plan progress and auto-issues certificate if 100%
 */
export const syncLearningPlanProgress = async (
  learningPlanId: string,
): Promise<LearningProgressResponse> => {
  try {
    // 🔑 Added /api/ prefix
    const response = await apiFetch(
      `/api/learning-plans/${learningPlanId}/sync-progress`,
      {
        method: "POST",
        cache: "no-store",
      },
    );

    if (!response || !response.ok) {
      return { success: false, error: "Failed to sync learning plan progress" };
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message,
      data: result.data,
      course_progress: result.data?.progress_percentage ?? 0,
      certificate: result.certificate || null,
    };
  } catch (error) {
    console.error("Sync learning plan progress error:", error);
    return { success: false, error: "Network error" };
  }
};
