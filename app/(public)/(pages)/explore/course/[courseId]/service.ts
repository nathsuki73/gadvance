"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { ApiOptions, EnrollmentResponse } from "./types";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

async function request<T>(endpoint: string, options: ApiOptions = {}) {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || "GET",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.laravelJwt}`,
      Accept: "application/json",
    },

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
}

/**
 * Create enrollment
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
 * Get all enrollments
 */
export async function getEnrollments() {
  return request<EnrollmentResponse[]>("/enrollments");
}

/**
 * Get single enrollment
 */
export async function getEnrollment(id: string) {
  return request<EnrollmentResponse>(`/enrollments/${id}`);
}

/**
 * Update enrollment
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
 * Delete enrollment
 */
export async function deleteEnrollment(id: string) {
  return request<EnrollmentResponse>(`/enrollments/${id}`, {
    method: "DELETE",
  });
}

/**
 * Get current user's enrollment
 * for a specific learning plan
 */
export async function getMyEnrollment(learningPlanId: string) {
  return request<EnrollmentResponse>(
    `/learning-plans/${learningPlanId}/enrollment`,
  );
}

export async function unenrollLearningPlan(enrollmentId: string) {
  return request<EnrollmentResponse>(`/enrollments/${enrollmentId}`, {
    method: "DELETE",
  });
}