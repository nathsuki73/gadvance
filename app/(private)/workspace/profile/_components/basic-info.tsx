"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2 } from "lucide-react";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

import { DatePickerField } from "@/app/onboarding/_components/DatePickerField";
import { GenderSelect } from "@/app/onboarding/_components/GenderSelect";

interface BasicInfoProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

// Helper to compute age from birthdate string
const computeAge = (birthDateStr: string): number => {
  if (!birthDateStr) return -1;
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function BasicInfo({ initialData, onSuccess }: BasicInfoProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
  });

  const [birthday, setBirthday] = useState<string>("");
  const [calculatedAge, setCalculatedAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      const profileObj =
        initialData.profile || initialData.user_profile || initialData;
      setFormData({
        firstName: initialData.first_name || "",
        middleName: initialData.middle_name || "",
        lastName: initialData.last_name || "",
      });

      const bDay = initialData.date_of_birth || initialData.birthday || "";
      setBirthday(bDay);

      if (bDay) {
        const age = computeAge(bDay);
        if (age >= 0) setCalculatedAge(age.toString());
      } else if (initialData.age) {
        setCalculatedAge(initialData.age.toString());
      }

      setGender(profileObj.gender || initialData.gender || "");
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBirthdayChange = (dateStr: string) => {
    setBirthday(dateStr);
    const age = computeAge(dateStr);
    if (age >= 0) setCalculatedAge(age.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast("Please enter your first and last name.", "error");
      return;
    }

    if (!birthday) {
      showToast("Please select your date of birth.", "error");
      return;
    }

    const birthDateObj = new Date(birthday);
    if (birthDateObj > new Date()) {
      showToast("Date of birth cannot be in the future.", "error");
      return;
    }

    const ageNumber = computeAge(birthday);
    if (ageNumber < 13) {
      showToast("You must be at least 13 years old.", "error");
      return;
    }

    if (!gender.trim()) {
      showToast("Please select your gender.", "error");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        birthday,
        date_of_birth: birthday,
        age: ageNumber.toString(),
        gender: gender.trim(),
      };

      const response = await apiFetch("/api/user/profile/update", {
        method: "PUT",
        body: JSON.stringify(payload),
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
    <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
          Middle Name
        </label>
        <input
          id="middleName"
          name="middleName"
          type="text"
          value={formData.middleName}
          onChange={handleChange}
          placeholder="Optional"
          className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DatePickerField value={birthday} onChange={handleBirthdayChange} />

        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={calculatedAge}
            readOnly
            placeholder="Auto-calculated"
            required
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
          />
        </div>
      </div>

      <GenderSelect value={gender} onChange={setGender} />

      <div className="mt-6 flex items-center justify-end border-t border-zinc-100 pt-5 sm:mt-8">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-70 active:scale-[0.98]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              SAVE BASIC INFO
            </>
          )}
        </button>
      </div>
    </form>
  );
}
