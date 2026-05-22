"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, Phone, MapPin } from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export default function ContactInfo() {
  const { data: session, status } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    address_line: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
  });

  // Fetch initial database entries on mount
  useEffect(() => {
    const fetchContactData = async () => {
      if (status !== "authenticated" || !apiBaseUrl || !session?.laravelJwt) return;

      try {
        const response = await fetch(`${apiBaseUrl}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${session.laravelJwt}`,
          },
        });

        if (response.ok) {
          const dbData = await response.json();
          setFormData({
            phone: dbData.phone || "",
            address_line: dbData.address_line || "",
            city: dbData.city || "",
            state: dbData.state || "",
            country: dbData.country || "",
            postal_code: dbData.postal_code || "",
          });
        }
      } catch (error) {
        console.error("Error loading contact data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [status, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/user/profile/contact-update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session?.laravelJwt}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorText = result.message || "Failed to update contact parameters.";
        throw new Error(errorText);
      }

      setMessage({ type: "success", text: "Contact information saved successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Something went wrong." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-sm text-zinc-400">Loading details...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      {message && (
        <div className={`rounded-xl p-4 text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Phone Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">Phone Number</label>
          <div className="relative">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
            />
          </div>
        </div>

        {/* Address Line Input */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-zinc-600">Street Address</label>
          <input
            type="text"
            name="address_line"
            value={formData.address_line}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        {/* City Input */}
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

        {/* State / Province Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">State / Province</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
          />
        </div>

        {/* Country Input */}
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

        {/* Postal Code Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-600">Postal / ZIP Code</label>
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
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00a9d1]/20 hover:bg-primary-hover transition-all disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Contact Info
            </>
          )}
        </button>
      </div>
    </form>
  );
}