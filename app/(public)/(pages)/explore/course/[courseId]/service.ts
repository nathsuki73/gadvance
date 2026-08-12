import { apiFetch } from "@/app/lib/api-client";
import { EnrollmentResponse, LearningPlan } from "./types";

/**
 * Standardized response contract returned by the client functions
 */
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Helper wrapper to handle apiFetch execution and JSON parsing with built-in logging
 */
async function clientRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ServiceResponse<T>> {
  try {
    const res = await apiFetch(endpoint, options);

    if (!res) {
      console.warn(
        `[clientRequest] Unauthorized or null response for: ${endpoint}`,
      );
      return { success: false, error: "Unauthorized" };
    }

    const result = await res.json();

    // 🔍 Print raw response logs to inspect the data structure and progress percentage
    console.log(`[API Response Logs] Endpoint: ${endpoint}`, result);

    if (!res.ok) {
      return {
        success: false,
        error: result.message || "Request failed",
      };
    }

    return {
      success: true,
      data: (result.data ?? result) as T,
    };
  } catch (error) {
    console.error(`Fetch error at ${endpoint}:`, error);
    return {
      success: false,
      error: "Network connection error",
    };
  }
}

/**
 * Public/Protected: Get single learning plan details with nested modules and calculated progress
 */
export async function getLearningPlanDetails(courseId: string) {
  return clientRequest<LearningPlan>(
    `/api/learning-plans/${courseId}?portal=student`,
  );
}

/**
 * Protected: Get current user's enrollment for a specific learning plan
 */
export async function getMyEnrollment(learningPlanId: string) {
  return clientRequest<EnrollmentResponse>(
    `/api/learning-plans/${learningPlanId}/enrollment`,
  );
}

/**
 * Protected: Create enrollment
 */
export async function enrollLearningPlan(learningPlanId: string) {
  return clientRequest<EnrollmentResponse>("/api/enrollments", {
    method: "POST",
    body: JSON.stringify({
      learning_plan_id: learningPlanId,
    }),
  });
}

/**
 * Protected: Get all enrollments
 */
export async function getEnrollments() {
  return clientRequest<EnrollmentResponse[]>("/api/enrollments");
}

/**
 * Protected: Get single enrollment
 */
export async function getEnrollment(id: string) {
  return clientRequest<EnrollmentResponse>(`/api/enrollments/${id}`);
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
  return clientRequest<EnrollmentResponse>(`/api/enrollments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Protected: Delete enrollment
 */
export async function deleteEnrollment(id: string) {
  return clientRequest<EnrollmentResponse>(`/api/enrollments/${id}`, {
    method: "DELETE",
  });
}

/**
 * Protected: Unenroll learning plan
 */
export async function unenrollLearningPlan(enrollmentId: string) {
  return clientRequest<EnrollmentResponse>(`/api/enrollments/${enrollmentId}`, {
    method: "DELETE",
  });
}
