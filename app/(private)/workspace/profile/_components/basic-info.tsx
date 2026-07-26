"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2 } from "lucide-react";
import { ProfileData, ProfileFormData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

interface BasicInfoProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

export default function BasicInfo({ initialData, onSuccess }: BasicInfoProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    gender: "",
    birthday: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.first_name || "",
        middleName: initialData.middle_name || "",
        lastName: initialData.last_name || "",
        age: initialData.age?.toString() || "",
        gender: initialData.gender || "",
        birthday: initialData.date_of_birth || initialData.birthday || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await apiFetch("/api/user/profile/update", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response) return; // 401 already handled — user is being signed out

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update profile parameters.",
        );
      }

      setMessage({
        type: "success",
        text: "Profile details updated successfully!",
      });
      showToast("Profile updated successfully!", "success");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", session?.user?.email],
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="firstName"
            className="text-xs font-semibold text-zinc-700"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="middleName"
            className="text-xs font-semibold text-zinc-700"
          >
            Middle Name
          </label>
          <input
            id="middleName"
            name="middleName"
            type="text"
            value={formData.middleName}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="lastName"
            className="text-xs font-semibold text-zinc-700"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="age" className="text-xs font-semibold text-zinc-700">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min="1"
            value={formData.age}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gender"
            className="text-xs font-semibold text-zinc-700"
          >
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="birthday"
            className="text-xs font-semibold text-zinc-700"
          >
            Birthday
          </label>
          <input
            id="birthday"
            name="birthday"
            type="date"
            value={formData.birthday}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>
      </div>

      {/* Button matches Contact & Personality forms */}
      <div className="mt-8 flex items-center justify-end border-t border-zinc-100 pt-5">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Basic Info
            </>
          )}
        </button>
      </div>
    </form>
  );
}
