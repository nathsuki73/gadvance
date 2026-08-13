"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Safe API base URL resolution (prevents double '/api/api' path bugs)
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = rawApiUrl.replace(/\/$/, "").endsWith("/api")
  ? rawApiUrl.replace(/\/$/, "")
  : `${rawApiUrl.replace(/\/$/, "")}/api`;

export type SaveLearningProgressPayload = {
  module_id: string;
  section_id: string; // ➕ Added section_id to match backend validation
  learning_item_id: string;
  progress: number;
};

// Single item progress record
export type ProgressRecord = {
  id?: number;
  user_id?: string;
  module_id?: string;
  section_id?: string;
  learning_item_id: string;
  progress: number;
};

// Section summary metrics for DonutProgress
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
  data?: ProgressRecord[] | ProgressRecord;
  completed_item_ids?: string[];
  section_summaries?: SectionSummary[];
  course_progress?: number; // ➕ Dynamic overall course percentage calculated by Laravel
};

export const getLearningProgress = async (
  moduleId: string,
): Promise<LearningProgressResponse> => {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/learning-progress/${moduleId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.laravelJwt}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to fetch progress records",
      };
    }

    return {
      success: true,
      data: result.data || [],
      completed_item_ids: result.completed_item_ids || [],
      section_summaries: result.section_summaries || [],
    };
  } catch (error) {
    console.error("Fetch learning progress error:", error);
    return {
      success: false,
      error: "Network error",
    };
  }
};

export const saveLearningProgress = async (
  payload: SaveLearningProgressPayload,
): Promise<LearningProgressResponse> => {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/learning-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.laravelJwt}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to save learning progress",
      };
    }

    return {
      success: true,
      message: result.message,
      data: result.data,
      course_progress: result.course_progress, // ➕ Returns the newly calculated overall percentage to Next.js
    };
  } catch (error) {
    console.error("Save learning progress error:", error);

    return {
      success: false,
      error: "Network error",
    };
  }
};

