import { apiFetch } from "@/app/lib/api-client";
import { UserProfile } from "./types";
import { ApiResponse } from "./api-response-type";

export interface JoinedOrganization {
  id: string;
  name: string;
  title?: string;
  description: string;
  role_name?: string;
  members_count?: number;
  membersCount?: number;
}

export type StudentCertificate = {
  id: string;
  verify_code: string;
  azure_file_path: string;
  created_at: string;
  learning_plan?: {
    title: string;
  };
  template?: any;
};

export const getUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  try {
    const response = await apiFetch("/api/profile", { method: "GET" });

    if (!response) {
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

export const getJoinedOrganizations = async (): Promise<
  ApiResponse<JoinedOrganization[]>
> => {
  try {
    const response = await apiFetch("/api/organizations", { method: "GET" });

    if (!response) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to fetch organizations",
      };
    }

    const orgs = Array.isArray(result) ? result : result.data || [];
    return { success: true, data: orgs };
  } catch (error) {
    console.error("Joined organizations fetch error:", error);
    return { success: false, error: "Network error" };
  }
};

export const leaveOrganization = async (
  organizationId: string,
): Promise<ApiResponse<null>> => {
  try {
    const response = await apiFetch("/api/organizations/leave", {
      method: "POST",
      body: JSON.stringify({ organization_id: organizationId }),
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

export const getStudentCertificates = async (): Promise<
  ApiResponse<StudentCertificate[]>
> => {
  try {
    const response = await apiFetch("/api/certificates", { method: "GET" });

    if (!response) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to fetch certificates",
      };
    }

    const certs = Array.isArray(result) ? result : result.data || [];
    return { success: true, data: certs };
  } catch (error) {
    console.error("Student certificates fetch error:", error);
    return { success: false, error: "Network error" };
  }
};

export const sendCertificateEmail = async (
  certificateId: string,
): Promise<ApiResponse<null>> => {
  try {
    const response = await apiFetch(
      `/api/certificates/${certificateId}/email`,
      {
        method: "POST",
      },
    );

    if (!response) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || "Failed to send certificate email",
      };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error("Send certificate email error:", error);
    return { success: false, error: "Network error" };
  }
};
