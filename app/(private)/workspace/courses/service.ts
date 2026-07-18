"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Course } from "./type";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// 🔒 Internal request engine matching your secure system
async function secureRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  params?: Record<string, string>,
) {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return { success: false, error: "Unauthorized" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${session.laravelJwt}`,
  };

  try {
    // Construct URL with query parameters if present
    let url = `${API_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const res = await fetch(url, {
      method,
      headers,
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
  } catch (error) {
    console.error(`Fetch error at ${endpoint}:`, error);
    return { success: false, error: "Network connection error" };
  }
}

// 📚 1. Securely fetch personal enrolled courses
export async function getEnrolledCourses(): Promise<Course[]> {
  const response = await secureRequest<Course[]>(
    "/user/enrolled-courses",
    "GET",
  );

  if (!response.success || !response.data) {
    console.error("Error fetching enrolled courses:", response.error);
    return [];
  }

  return response.data;
}

// 🔍 2. Securely search courses
export async function searchCourses(query: string): Promise<Course[]> {
  const response = await secureRequest<Course[]>("/learning-plans", "GET", {
    search: query,
  });

  if (!response.success || !response.data) {
    console.error("Error searching courses:", response.error);
    return [];
  }

  return response.data;
}
