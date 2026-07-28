import { apiFetch } from "@/app/lib/api-client";

// --- TypeScript Interfaces ---

export interface OnboardingP1 {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  birthday?: string;
}

export interface OnboardingP2 {
  country?: string;
  stateProvince?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  phoneDialCode?: string;
  phoneNumber?: string;
}

export interface OnboardingP3Cache {
  bio?: string;
  avatarPreviewUrl?: string;
}

export interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}

export interface SaveProfileResult {
  success: boolean;
  message?: string;
}

// --- Onboarding Service Helper ---

export async function saveOnboardingProfile(
  bio: string,
  avatarFile: File | null,
): Promise<SaveProfileResult> {
  const savedP1 = localStorage.getItem("onboarding_p1");
  const savedP2 = localStorage.getItem("onboarding_p2");

  const p1: OnboardingP1 = savedP1 ? (JSON.parse(savedP1) as OnboardingP1) : {};
  const p2: OnboardingP2 = savedP2 ? (JSON.parse(savedP2) as OnboardingP2) : {};

  // Construct FormData for multipart API submission
  const formData = new FormData();
  formData.append("firstName", p1.firstName || "");
  formData.append("middleName", p1.middleName || "");
  formData.append("lastName", p1.lastName || "");
  formData.append("age", p1.age || "");
  formData.append("gender", p1.gender || "");
  formData.append("birthday", p1.birthday || "");

  formData.append("country", p2.country || "Philippines");
  formData.append("stateProvince", p2.stateProvince || "");
  formData.append("city", p2.city || "");
  formData.append("address", p2.address || "");
  formData.append("postalCode", p2.postalCode || "");
  formData.append(
    "phone",
    `${p2.phoneDialCode || "+63"}${p2.phoneNumber || ""}`,
  );

  formData.append("bio", bio);

  if (avatarFile) {
    formData.append("avatar", avatarFile);
  }

  const res = await apiFetch("/api/onboarding", {
    method: "POST",
    body: formData,
  });

  if (!res) {
    return {
      success: false,
      message: "Authentication required or request canceled.",
    };
  }

  const result = (await res.json()) as ApiResponse;

  if (!res.ok) {
    return {
      success: false,
      message: result.message || "Failed to finalize profile setup.",
    };
  }

  return { success: true };
}
