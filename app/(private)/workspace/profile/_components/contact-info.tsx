"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";

interface ContactInfoProps {
  initialData?: ProfileData;
}

export default function ContactInfo({ initialData }: ContactInfoProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    phone: "",
    address_line: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        phone: initialData.phone || "",
        address_line: initialData.address_line || "",
        city: initialData.city || "",
        state: initialData.state || "",
        country: initialData.country || "",
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
      const response = await apiFetch("/api/user/profile/contact-update", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Failed to update contact details.");
      }

      showToast("Contact information saved successfully!", "success");
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">
            Phone Number
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-zinc-600">
            Street Address
          </label>
          <input
            type="text"
            name="address_line"
            value={formData.address_line}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">
            State / Province
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">
            Postal / ZIP Code
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-zinc-100 pt-5">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? "Saving Changes..." : "Save Contact Info"}</span>
        </button>
      </div>
    </form>
  );
}
