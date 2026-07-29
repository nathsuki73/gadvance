"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useToast } from "@/app/components/context/ToastContext";
import { StepHeader } from "../_components/StepHeader";
import { OnboardingActions } from "../_components/OnboardingActions";
import {
  OnboardingP3,
  ONBOARDING_CACHE_KEYS,
  getOnboardingCache,
  setOnboardingCache,
  clearOnboardingCache,
  saveOnboardingProfile,
} from "../service";

interface CustomSessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  status?: string;
}

export default function AvatarAndBio() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const [bio, setBio] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore cached bio & avatar preview on mount
  useEffect(() => {
    const p3 = getOnboardingCache<OnboardingP3>(ONBOARDING_CACHE_KEYS.p3);
    if (p3?.bio) setBio(p3.bio);
    if (p3?.avatarPreviewUrl) setAvatarPreview(p3.avatarPreviewUrl);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (JPG or PNG).", "warning");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBack = (): void => {
    setOnboardingCache<OnboardingP3>(ONBOARDING_CACHE_KEYS.p3, {
      bio,
      avatarPreviewUrl: avatarPreview || undefined,
    });
    router.back();
  };

  const handleFinalSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await saveOnboardingProfile(bio, avatarFile);

      if (!response.success) {
        showToast(
          response.message || "Failed to finalize profile setup.",
          "error",
        );
        setLoading(false);
        return;
      }

      showToast("Profile set up successfully!", "success");
      clearOnboardingCache();

      // Update NextAuth session status to active
      const updatedUser: CustomSessionUser = {
        ...(session?.user as CustomSessionUser),
        status: "active",
      };
      await update({ user: updatedUser });

      window.location.href = "/workspace";
    } catch (error: unknown) {
      console.error("Onboarding Submit Error:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StepHeader
        step={3}
        title="Avatar & Bio"
        subtitle="Finalize your profile setup."
      />

      <form className="space-y-6" onSubmit={handleFinalSubmit}>
        {/* Profile Photo Section */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest">
            Profile Photo
          </label>

          <div className="flex items-center gap-5">
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

        <OnboardingActions
          onBack={handleBack}
          nextLabel="Finish Profile Setup"
          loading={loading}
          loadingLabel="Saving Profile..."
        />
      </form>
    </>
  );
}
