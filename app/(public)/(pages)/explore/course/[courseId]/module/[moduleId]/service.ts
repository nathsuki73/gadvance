"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import {
  ModuleProgressResponse,
  ModuleResponse,
  StaticTestResponse,
} from "./types";

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

interface ExtendedApiOptions extends ApiOptions {
  requiresAuth?: boolean;
}

async function request<T>(endpoint: string, options: ExtendedApiOptions = {}) {
  // 2. Define your API_URL inside the function so it reads dynamically at runtime!
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://13.229.44.51";
  const API_URL = `${baseUrl}/api`;

  const requiresAuth = options.requiresAuth ?? true;
  const session = await getServerSession(authOptions);

  /**
   * Protected route guard
   */
  if (requiresAuth && !session?.laravelJwt) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  /**
   * Headers
   */
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (session?.laravelJwt) {
    headers.Authorization = `Bearer ${session.laravelJwt}`;
  }

  try {
    // 3. Add a log statement here to track what Vercel is actually fetching!
    console.log(`SERVER ACTION FETCHING: ${API_URL}${endpoint}`);

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
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
      progress: result.progress,
    };
  } catch (error) {
    console.error(`Module API Error (${endpoint}):`, error);
    return {
      success: false,
      error: "Network connection error",
    };
  }
}

/* -------------------------------------------------------
 * PUBLIC MODULES
 * -----------------------------------------------------*/

/**
 * Public: Get all modules
 */
export async function getModules() {
  return request<ModuleResponse[]>("/modules", {
    requiresAuth: false,
  });
}

/**
 * Public: Get single module
 */
export async function getModule(moduleId: string) {
  return request<ModuleResponse>(`/modules/${moduleId}`, {
    requiresAuth: false,
  });
}

/* -------------------------------------------------------
 * LEARNING MODULES (Protected)
 * -----------------------------------------------------*/

/**
 * Protected:
 * Get learning module with
 * user progress tracking
 */
export async function getLearningModule(moduleId: string) {
  return request<
    ModuleResponse & {
      progress?: ModuleProgressResponse;
    }
  >(`/learn/modules/${moduleId}`);
}

/**
 * Protected:
 * Mark block as completed
 */
export async function completeBlock(blockId: string) {
  return request(`/learn/blocks/${blockId}/complete`, {
    method: "POST",
  });
}

/* -------------------------------------------------------
 * STATIC ASSESSMENT METHODS (Pre-test / Post-test)
 * -----------------------------------------------------*/

/**
 * Protected: Fetch a specific static pre-test or post-test diagnostic item bank.
 * Formats directly to: ${baseUrl}/api/modules/{moduleId}/static-test?type={type}
 */
export async function getStaticTest(
  moduleId: string,
  type: "pre_test" | "post_test",
) {
  return request<StaticTestResponse>(
    `/modules/${moduleId}/static-test?type=${type}`,
    {
      requiresAuth: true,
    },
  );
}
