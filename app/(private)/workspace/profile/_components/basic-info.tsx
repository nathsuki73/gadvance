"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2 } from "lucide-react";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

const PREDEFINED_GENDERS = ["Male", "Female", "Prefer not to specify"];

interface BasicInfoProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

export default function BasicInfo({ initialData, onSuccess }: BasicInfoProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    birthday: "",
  });

  const [selectedGender, setSelectedGender] = useState<string>("");
  const [customGender, setCustomGender] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.first_name || "",
        middleName: initialData.middle_name || "",
        lastName: initialData.last_name || "",
        age: initialData.age?.toString() || "",
        birthday: initialData.date_of_birth || initialData.birthday || "",
      });

      const gender = initialData.gender || "";
      if (PREDEFINED_GENDERS.includes(gender)) {
        setSelectedGender(gender);
        setCustomGender("");
      } else if (gender) {
        setSelectedGender("Other");
        setCustomGender(gender);
      } else {
        setSelectedGender("");
        setCustomGender("");
      }
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedGender(val);
    if (val !== "Other") {
      setCustomGender("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGender) {
      showToast("Please select your gender.", "error");
      return;
    }

    if (selectedGender === "Other" && !customGender.trim()) {
      showToast("Please specify your gender.", "error");
      return;
    }

    const resolvedGender =
      selectedGender === "Other" ? customGender.trim() : selectedGender;

    setIsSaving(true);

    try {
      const response = await apiFetch("/api/user/profile/update", {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          gender: resolvedGender,
        }),
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile info.");
      }

      showToast("Profile updated successfully!", "success");
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5">
        <div className="flex min-w-0 flex-col gap-1.5">
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
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
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
            placeholder="Optional"
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
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
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
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
            required
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="gender"
            className="text-xs font-semibold text-zinc-700"
          >
            Gender 
          </label>
          <select
            id="gender"
            name="gender"
            value={selectedGender}
            onChange={handleGenderChange}
            required
            className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other (please specify)</option>
            <option value="Prefer not to specify">Prefer not to specify</option>
          </select>

          {selectedGender === "Other" && (
            <input
              type="text"
              value={customGender}
              onChange={(e) => setCustomGender(e.target.value)}
              placeholder="Please specify gender"
              required
              className="mt-1.5 w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50 bg-zinc-50/50"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
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
            required
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>
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
