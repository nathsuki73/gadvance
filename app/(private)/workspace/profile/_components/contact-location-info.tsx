"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2 } from "lucide-react";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

interface ContactLocationInfoProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

export default function ContactLocationInfo({
  initialData,
  onSuccess,
}: ContactLocationInfoProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    phone: "",
    address_line: "",
    city: "",
    state: "",
    country: "Philippines",
    postal_code: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        phone: initialData.phone || "",
        address_line: initialData.address_line || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "Philippines",
        postal_code: initialData.postal_code || "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await apiFetch("/api/user/profile/update", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update contact & location details.",
        );
      }

      showToast("Contact details updated successfully!", "success");
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="country"
            className="text-xs font-semibold text-zinc-700"
          >
            Country
          </label>
          <input
            id="country"
            name="country"
            type="text"
            value={formData.country}
            onChange={handleChange}
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="state"
            className="text-xs font-semibold text-zinc-700"
          >
            State / Province
          </label>
          <input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={handleChange}
            placeholder="e.g. Laguna"
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="city" className="text-xs font-semibold text-zinc-700">
            City / Municipality
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. San Pablo"
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <label
            htmlFor="postal_code"
            className="text-xs font-semibold text-zinc-700"
          >
            Postal Code
          </label>
          <input
            id="postal_code"
            name="postal_code"
            type="text"
            value={formData.postal_code}
            onChange={handleChange}
            placeholder="e.g. 4000"
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="address_line"
            className="text-xs font-semibold text-zinc-700"
          >
            Address Line
          </label>
          <input
            id="address_line"
            name="address_line"
            type="text"
            value={formData.address_line}
            onChange={handleChange}
            placeholder="House No., Street, Subdivision"
            className="w-full min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="phone"
            className="text-xs font-semibold text-zinc-700"
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+63 9xx xxx xxxx"
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
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Location Details
            </>
          )}
        </button>
      </div>
    </form>
  );
}
