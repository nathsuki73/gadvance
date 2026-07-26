"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Save, Loader2, User, Upload } from "lucide-react";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

interface PersonalityInfoProps {
  initialData?: ProfileData;
}

export default function PersonalityInfo({ initialData }: PersonalityInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setBio(initialData.bio || "");
      const avatarPath = initialData.avatar;
      if (avatarPath) {
        const fullAvatarUrl = avatarPath.startsWith("http")
          ? avatarPath
          : avatarPath.startsWith("/")
            ? `${apiBaseUrl}${avatarPath}`
            : `${apiBaseUrl}/storage/${avatarPath}`;
        setAvatarPreview(fullAvatarUrl);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const dataPayload = new FormData();
      dataPayload.append("bio", bio);
      if (avatarFile) dataPayload.append("avatar", avatarFile);

      const response = await apiFetch("/api/user/profile/personality-update", {
        method: "POST",
        body: dataPayload,
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update personality configurations.",
        );
      }

      showToast("Profile updated successfully!", "success");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
          {avatarPreview ? (
            <Image
              src={avatarPreview}
              alt="Avatar profile"
              fill
              sizes="96px"
              className="object-cover"
              unoptimized={avatarPreview.startsWith("blob:")}
            />
          ) : (
            <User className="h-10 w-10 text-zinc-300" />
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-semibold text-zinc-800">
            Profile Picture
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all"
          >
            <Upload className="h-3.5 w-3.5" /> Upload Image File
          </button>
          <p className="text-[11px] text-zinc-400">
            Supports JPG, PNG, or WebP formats.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-600">
          Biography / Short Summary
        </label>
        <textarea
          name="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a bit about your journey..."
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
        />
      </div>

      <div className="flex items-center justify-end border-t border-zinc-100 pt-5">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? "Saving Personality..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}
