import { apiFetch } from "@/app/lib/api-client";
import { Course } from "./type";

// 📚 1. Securely fetch personal enrolled courses
export async function getEnrolledCourses(): Promise<Course[]> {
  try {
    const res = await apiFetch("/api/user/enrolled-courses");
    if (!res || !res.ok) {
      return [];
    }
    const result = await res.json();
    return result.data ?? result;
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return [];
  }
}

// 🔍 2. Securely search courses
export async function searchCourses(query: string): Promise<Course[]> {
  try {
    const res = await apiFetch(
      `/api/learning-plans?search=${encodeURIComponent(query)}`,
    );
    if (!res || !res.ok) {
      return [];
    }
    const result = await res.json();
    return result.data ?? result;
  } catch (error) {
    console.error("Error searching courses:", error);
    return [];
  }
}
