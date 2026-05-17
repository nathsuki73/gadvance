"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { ApiOptions, EnrollmentResponse } from "./types";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Added a configuration option to flag whether an endpoint requires authentication
interface ExtendedApiOptions extends ApiOptions {
  requiresAuth?: boolean;
}

async function request<T>(endpoint: string, options: ExtendedApiOptions = {}) {
  // Default endpoints to require authentication unless explicitly turned off
  const requiresAuth = options.requiresAuth ?? true;
  const session = await getServerSession(authOptions);

  // Guard protected endpoints safely
  if (requiresAuth && !session?.laravelJwt) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  // Construct headers dynamically depending on authentication requirements
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (session?.laravelJwt) {
    headers["Authorization"] = `Bearer ${session.laravelJwt}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Request failed",
      };
    }

    return {
      success: true,
      data: result.data as T,
    };
  } catch (error: unknown) {
    console.error(`Fetch error at ${endpoint}:`, error);
    return {
      success: false,
      error: "Network connection error",
    };
  }
}

/**
 * Public: Count enrollments of a learning plan
 * Crucial fix: explicitly sets requiresAuth to false so logged out users can fetch it.
 */
export async function getEnrollmentCount(learningPlanId: string) {
  return request<{
    total_enrolled: number;
  }>(`/learning-plans/${learningPlanId}/enrollments/count`, {
    requiresAuth: false, // <--- ALLOWS ANONYMOUS ACCESS
  });
}

/**
 * Protected: Get current user's enrollment for a specific learning plan
 */
export async function getMyEnrollment(learningPlanId: string) {
  return request<EnrollmentResponse>(
    `/learning-plans/${learningPlanId}/enrollment`,
  );
}

/**
 * Protected: Create enrollment
 */
export async function enrollLearningPlan(learningPlanId: string) {
  return request<EnrollmentResponse>("/enrollments", {
    method: "POST",
    body: {
      learning_plan_id: learningPlanId,
    },
  });
}

/**
 * Protected: Get all enrollments
 */
export async function getEnrollments() {
  return request<EnrollmentResponse[]>("/enrollments");
}

/**
 * Protected: Get single enrollment
 */
export async function getEnrollment(id: string) {
  return request<EnrollmentResponse>(`/enrollments/${id}`);
}

/**
 * Protected: Update enrollment
 */
export async function updateEnrollment(
  id: string,
  payload: {
    status?: "inactive" | "in_progress" | "completed";
    progress_percentage?: number;
  },
) {
  return request<EnrollmentResponse>(`/enrollments/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

/**
 * Protected: Delete enrollment
 */
export async function deleteEnrollment(id: string) {
  return request<EnrollmentResponse>(`/enrollments/${id}`, {
    method: "DELETE",
  });
}

/**
 * Protected: Unenroll learning plan
 */
export async function unenrollLearningPlan(enrollmentId: string) {
  return request<EnrollmentResponse>(`/enrollments/${enrollmentId}`, {
    method: "DELETE",
  });
}
