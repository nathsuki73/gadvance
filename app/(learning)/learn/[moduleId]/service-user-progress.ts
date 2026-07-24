"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

type SaveLearningProgressPayload = {
  module_id: string;
  learning_item_id: string;
  progress: number;
};

// Represents a single progress record returned by the backend
export type ProgressRecord = {
  learning_item_id: string;
  progress: number;
};

// Strongly typed the generic data object
type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export const getLearningProgress = async (
  moduleId: string,
): Promise<ApiResponse<ProgressRecord[]>> => {
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

    return result as ApiResponse<ProgressRecord[]>;
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
): Promise<ApiResponse> => {
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
    };
  } catch (error) {
    console.error("Save learning progress error:", error);

    return {
      success: false,
      error: "Network error",
    };
  }
};
