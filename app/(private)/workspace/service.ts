"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { UserProfile } from "./types";
import { ApiResponse } from "./api-response-type";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const getUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const session = await getServerSession(authOptions);

  if (!session?.laravelJwt) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.laravelJwt}`,
      },
    });

    const result = await response.json();
    const profileData = result?.data ?? result;

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Request failed",
      };
    }

    if (!profileData || typeof profileData !== "object") {
      return {
        success: false,
        error: "Profile data missing",
      };
    }

    return {
      success: true,
      data: profileData as UserProfile,
    };
  } catch (error) {
    console.error("Profile fetch error:", error);

    return {
      success: false,
      error: "Network error",
    };
  }
};
