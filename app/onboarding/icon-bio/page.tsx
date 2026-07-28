"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/app/lib/api-client";
import Image from "next/image";

// --- TypeScript Interfaces ---

interface OnboardingP1 {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  birthday?: string;
}

interface OnboardingP2 {
  country?: string;
  stateProvince?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  phoneDialCode?: string;
  phoneNumber?: string;
}

interface OnboardingP3Cache {
  bio?: string;
  avatarPreviewUrl?: string;
}

interface CustomSessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  status?: string;
}

interface ApiResponse {
  message?: string;
  [key: string]: unknown;
}

// --- Onboarding Service Helper ---

async function saveOnboardingProfile(
  bio: string,
  avatarFile: File | null,
): Promise<{ success: boolean; message?: string }> {
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

// --- Main UI Component ---

export default function AvatarAndBio() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [bio, setBio] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore cached bio & avatar state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedP3 = localStorage.getItem("onboarding_p3");
    if (savedP3) {
      try {
        const p3 = JSON.parse(savedP3) as OnboardingP3Cache;
        if (p3.bio) setBio(p3.bio);
        if (p3.avatarPreviewUrl) setAvatarPreview(p3.avatarPreviewUrl);
      } catch (e) {
        console.error("Failed to parse onboarding_p3 cache:", e);
      }
    }
  }, []);

  // Handle avatar file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG or PNG).");
      return;
    }

    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleBack = (): void => {
    localStorage.setItem(
      "onboarding_p3",
      JSON.stringify({ bio, avatarPreviewUrl: avatarPreview }),
    );
    router.back();
  };

  const handleFinalSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // REMOVED: Frontend bio validation check so empty bio is accepted
    setLoading(true);

    try {
      const response = await saveOnboardingProfile(bio, avatarFile);

      if (!response.success) {
        alert(response.message || "Failed to finalize profile setup.");
        setLoading(false);
        return;
      }

      // Cleanup LocalStorage on success
      localStorage.removeItem("onboarding_p1");
      localStorage.removeItem("onboarding_p2");
      localStorage.removeItem("onboarding_p3");

      // Update NextAuth session status to active
      const updatedUser: CustomSessionUser = {
        ...(session?.user as CustomSessionUser),
        status: "active",
      };

      await update({ user: updatedUser });

      window.location.href = "/workspace";
    } catch (error: unknown) {
      console.error("Onboarding Submit Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">
          step 03 / 03
        </span>

        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Avatar & Bio
          </h1>
        </div>

        <p className="text-zinc-400 text-xs sm:text-sm font-light mt-1">
          Finalize your profile setup.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleFinalSubmit}>
        {/* Profile Photo Section */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest">
            Profile Photo
          </label>

          <div className="flex items-center gap-5">
            {/* Circle Avatar Preview */}
            <div className="relative h-24 w-24 rounded-full bg-zinc-100 border border-zinc-200/60 flex items-center justify-center overflow-hidden shrink-0">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile Avatar Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-zinc-300 uppercase text-center tracking-wider leading-tight px-2">
                  No Photo
                </span>
              )}
            </div>

            {/* Custom Upload Button & Hint */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-violet-50 hover:bg-violet-100 text-[#8b5cf6] font-semibold text-xs px-4 py-2.5 rounded-full transition-colors active:scale-95"
                >
                  Choose File
                </button>
                <span className="text-xs text-zinc-500 font-normal truncate max-w-[150px] sm:max-w-xs">
                  {avatarFile ? avatarFile.name : "No file chosen"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-light">
                JPG or PNG accepted.
              </p>
            </div>
          </div>
        </div>

        {/* Short Bio Field (Optional) */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Short Bio
          </label>
          <textarea
            value={bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setBio(e.target.value)
            }
            rows={5}
            placeholder="Tell us a bit about yourself..."
            className="w-full rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 text-sm text-zinc-800 placeholder-zinc-300 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="w-full sm:w-1/3 border border-zinc-100 text-zinc-400 py-3.5 sm:py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-2/3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3.5 sm:py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Saving Profile..." : "Finish Profile Setup"}
          </button>
        </div>
      </form>
    </>
  );
}
