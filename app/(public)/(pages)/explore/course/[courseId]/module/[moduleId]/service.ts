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
  } catch {
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
 * Public: Get all modules (Strictly filtered for published status)
 */
export async function getModules() {
  const res = await request<ModuleResponse[]>("/modules?portal=student", {
    requiresAuth: false,
  });

  if (res.success && Array.isArray(res.data)) {
    return {
      ...res,
      data: res.data.filter((module) => module.status === "published"),
    };
  }

  return res;
}

/**
 * Public: Get single module (Guarded for published status)
 */
export async function getModule(moduleId: string) {
  const res = await request<ModuleResponse>(
    `/modules/${moduleId}?portal=student`,
    {
      requiresAuth: false,
    },
  );

  if (res.success && res.data) {
    if (res.data.status !== "published") {
      return {
        success: false,
        error: "Module is not published",
      };
    }
  }

  return res;
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
  const res = await request<
    ModuleResponse & {
      progress?: ModuleProgressResponse;
    }
  >(`/learn/modules/${moduleId}`);

  if (res.success && res.data && res.data.status !== "published") {
    return {
      success: false,
      error: "Module is not published",
    };
  }

  return res;
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
