import { apiFetch } from "@/app/lib/api-client";
import type { ContactLocationData } from "./contact-location/service";

// --- TypeScript Interfaces ---

export interface OnboardingP1 {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  birthday?: string;
}

// Step 2 is exactly what contact-location/service.ts persists (PSGC region /
// province / municipality-city / barangay codes) — aliased here so the rest
// of the onboarding flow has one shared name for it instead of a second,
// diverging shape.
export type OnboardingP2 = ContactLocationData;

export interface OnboardingP3 {
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

// --- LocalStorage cache helpers (DRY across all onboarding steps) ---

export const ONBOARDING_CACHE_KEYS = {
  p1: "onboarding_p1",
  p2: "onboarding_p2",
  p3: "onboarding_p3",
} as const;

export function getOnboardingCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to parse ${key} cache:`, error);
    return null;
  }
}

export function setOnboardingCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function clearOnboardingCache(): void {
  if (typeof window === "undefined") return;
  Object.values(ONBOARDING_CACHE_KEYS).forEach((key) =>
    localStorage.removeItem(key),
  );
}

// --- Shared date-of-birth helper (used for both live calculation and
// final-submit validation) ---

export function computeAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// --- Final submission ---

export async function saveOnboardingProfile(
  bio: string,
  avatarFile: File | null,
): Promise<SaveProfileResult> {
  const p1 = getOnboardingCache<OnboardingP1>(ONBOARDING_CACHE_KEYS.p1) || {};
  const p2 =
    getOnboardingCache<OnboardingP2>(ONBOARDING_CACHE_KEYS.p2) ||
    ({} as OnboardingP2);

  // IMPORTANT: these fields must mirror OnboardingP1 / OnboardingP2 (i.e.
  // ContactLocationData) exactly, since that's what's actually persisted by
  // the earlier steps. This previously drifted — the old service sent
  // country/stateProvince/city/address/postalCode while the real cached
  // data used region/province/municipality-city/barangay PSGC codes, so the
  // location fields were silently dropped from every submission.
  const formData = new FormData();

  formData.append("firstName", p1.firstName || "");
  formData.append("middleName", p1.middleName || "");
  formData.append("lastName", p1.lastName || "");
  formData.append("age", p1.age || "");
  formData.append("gender", p1.gender || "");
  formData.append("birthday", p1.birthday || "");

  formData.append("country", p2.country || "Philippines");
  formData.append("regionCode", p2.regionCode || "");
  formData.append("regionName", p2.regionName || "");
  formData.append("provinceCode", p2.provinceCode || "");
  formData.append("provinceName", p2.provinceName || "");
  formData.append("munCityCode", p2.munCityCode || "");
  formData.append("munCityName", p2.munCityName || "");
  formData.append("barangayCode", p2.barangayCode || "");
  formData.append("barangayName", p2.barangayName || "");
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
