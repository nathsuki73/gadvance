"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2 } from "lucide-react";
import Image from "next/image";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

// Helper function identical to AuthHeader's avatar resolver
function resolveAvatarSrc(avatar?: string | null): string | null {
  if (!avatar) return null;

  const trimmed = avatar.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const storagePath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_BASE_URL}${storagePath}`;
}

interface AvatarBioInfoProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

export default function AvatarBioInfo({
  initialData,
  onSuccess,
}: AvatarBioInfoProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setBio(initialData.bio || "");
      if (initialData.avatar) {
        // Resolve the raw database URL to an absolute URL
        setAvatarPreview(resolveAvatarSrc(initialData.avatar));
      }
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (JPG or PNG).", "error");
      return;
    }

    setAvatarFile(file);
    // Create local object URL for instant preview
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("bio", bio);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await apiFetch("/api/user/profile/update", {
        method: "POST",
        body: formData,
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update profile image and bio.",
        );
      }

      showToast("Avatar & Bio updated successfully!", "success");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", session?.user?.email],
      });

      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Profile Photo Upload */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-zinc-700 block">
          Profile Photo
        </label>

        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-zinc-100 border border-zinc-200/80 flex items-center justify-center overflow-hidden shrink-0">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                fill
                unoptimized={true} // Bypasses Next.js loader domain restrictions
                className="object-cover"
              />
            ) : (
              <span className="text-[10px] font-bold text-zinc-300 uppercase text-center px-2">
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
                className="bg-violet-50 hover:bg-violet-100 text-[#8b5cf6] font-semibold text-xs px-4 py-2 rounded-full transition-colors active:scale-95"
              >
                Choose File
              </button>
              <span className="text-xs text-zinc-500 truncate max-w-[150px] sm:max-w-xs">
                {avatarFile ? avatarFile.name : "No new file chosen"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">JPG or PNG accepted.</p>
          </div>
        </div>
      </div>

      {/* Short Bio */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-xs font-semibold text-zinc-700">
          Short Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell us a bit about yourself..."
          className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50 resize-none"
        />
      </div>

      <div className="mt-6 flex items-center justify-end border-t border-zinc-100 pt-5 sm:mt-8">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Avatar & Bio
            </>
          )}
        </button>
      </div>
    </form>
  );
}
