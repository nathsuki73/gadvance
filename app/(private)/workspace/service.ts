import { apiFetch } from "@/app/lib/api-client";
import { UserProfile } from "./types";
import { ApiResponse } from "./api-response-type";

export const getUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  try {
    const response = await apiFetch("/api/profile", { method: "GET" });

    if (!response) {
      // apiFetch already handled the 401 (signed out + redirected)
      return { success: false, error: "Unauthorized" };
    }

    const result = await response.json();
    const profileData = result?.data ?? result;

    if (!response.ok) {
      return { success: false, error: result.message || "Request failed" };
    }

    if (!profileData || typeof profileData !== "object") {
      return { success: false, error: "Profile data missing" };
    }

    return { success: true, data: profileData as UserProfile };
  } catch (error) {
    console.error("Profile fetch error:", error);
    return { success: false, error: "Network error" };
  }
};

export const leaveOrganization = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await apiFetch("/api/organizations/leave", {
      method: "POST",
    });

    if (!response) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to leave organization",
      };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Leave organization error:", error);
    return { success: false, error: "Network error" };
  }
};
