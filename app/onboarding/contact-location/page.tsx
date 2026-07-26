"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { InputField } from "../_components/InputField";

interface ContactLocationData {
  phone?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

const ContactLocation = () => {
  const router = useRouter();

  // 1. Lazy state initialization: reads localStorage once before initial render
  const [persistedData] = useState<ContactLocationData | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("onboarding_p2");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as ContactLocationData;
    } catch (e) {
      console.error("Failed to parse onboarding_p2 cache:", e);
      return null;
    }
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    () => persistedData?.country || "Philippines",
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const pageTwoData: ContactLocationData = {
      phone: (formData.get("phone") as string) || "",
      addressLine: (formData.get("addressLine") as string) || "",
      city: (formData.get("city") as string) || "",
      state: (formData.get("state") as string) || "",
      country: (formData.get("country") as string) || "",
      postalCode: (formData.get("postalCode") as string) || "",
    };

    localStorage.setItem("onboarding_p2", JSON.stringify(pageTwoData));
    router.push("/onboarding/icon-bio");
  };

  const handleBack = () => {
    const form = document.getElementById(
      "contactLocationForm",
    ) as HTMLFormElement | null;
    if (form) {
      const fd = new FormData(form);
      const pageTwoData: ContactLocationData = {
        phone: (fd.get("phone") as string) || "",
        addressLine: (fd.get("addressLine") as string) || "",
        city: (fd.get("city") as string) || "",
        state: (fd.get("state") as string) || "",
        country: (fd.get("country") as string) || "",
        postalCode: (fd.get("postalCode") as string) || "",
      };

      localStorage.setItem("onboarding_p2", JSON.stringify(pageTwoData));
    }

    router.back();
  };

  return (
    <>
      <div className="mb-10">
        <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">
          step 02 / 03
        </span>
        <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">
          Contact & Location
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-2">
          Where can we reach you?
        </p>
      </div>

      <form
        id="contactLocationForm"
        className="space-y-5"
        onSubmit={handleNext}
      >
        <InputField
          label="Phone Number"
          name="phone"
          placeholder="+63 9xx xxx xxxx"
          required
          defaultValue={persistedData?.phone || ""}
        />

        <InputField
          label="Address Line"
          name="addressLine"
          placeholder="House No., Street, Subdivision"
          required
          defaultValue={persistedData?.addressLine || ""}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="City"
            name="city"
            placeholder="e.g. San Pablo"
            required
            defaultValue={persistedData?.city || ""}
          />
          <InputField
            label="State / Province"
            name="state"
            placeholder="e.g. Laguna"
            required
            defaultValue={persistedData?.state || ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative text-left" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Country <span className="text-red-500 ml-1">*</span>
            </label>

            <input type="hidden" name="country" value={selectedCountry} />

            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 text-sm text-zinc-600 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-normal text-zinc-600">
                  {selectedCountry}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountry("Philippines");
                    setIsDropdownOpen(false);
                  }}
                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-[#8b5cf6] bg-violet-50/70 text-left"
                >
                  Philippines
                </button>
              </div>
            )}
          </div>

          <InputField
            label="Postal Code"
            name="postalCode"
            placeholder="e.g. 4000"
            required
            defaultValue={persistedData?.postalCode || ""}
          />
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="w-1/3 border border-zinc-100 text-zinc-400 px-6 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-2/3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98]"
          >
            Continue to Bio
          </button>
        </div>
      </form>
    </>
  );
};

export default ContactLocation;
