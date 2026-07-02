"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import logoIcon from "@/app/assets/logo.ico";

const ContactLocation = () => {
  const router = useRouter();
  const [persistedData, setPersistedData] = useState<any>(null);
  
  // Custom Dropdown UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Philippines");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_p2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPersistedData(parsed);
        if (parsed.country) {
          setSelectedCountry(parsed.country);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const pageTwoData = {
      phone: formData.get("phone"),
      addressLine: formData.get("addressLine"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"), // Reads from hidden input field seamlessly
      postalCode: formData.get("postalCode"),
    };
    
    localStorage.setItem("onboarding_p2", JSON.stringify(pageTwoData));
    router.push("/onboarding/icon-bio");
  };

  const handleBack = () => {
    const form = document.getElementById("contactLocationForm") as HTMLFormElement | null;
    if (form) {
      const fd = new FormData(form);
      const pageTwoData = {
        phone: fd.get("phone"),
        addressLine: fd.get("addressLine"),
        city: fd.get("city"),
        state: fd.get("state"),
        country: fd.get("country"),
        postalCode: fd.get("postalCode"),
      };

      localStorage.setItem("onboarding_p2", JSON.stringify(pageTwoData));
    }

    router.back();
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <img src={logoIcon.src} alt="logo" className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-10">
            <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">step 02 / 03</span>
            <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">Contact & Location</h1>
            <p className="text-zinc-400 text-sm font-light mt-2">Where can we reach you?</p>
          </div>

          <form id="contactLocationForm" className="space-y-5" onSubmit={handleNext}>
            {/* Phone Number */}
            <InputField 
              label="Phone Number" 
              name="phone" 
              placeholder="+63 9xx xxx xxxx" 
              required 
              defaultValue={persistedData?.phone || ""}
            />

            {/* Address Line */}
            <InputField 
              label="Address Line" 
              name="addressLine" 
              placeholder="House No., Street, Subdivision" 
              required 
              defaultValue={persistedData?.addressLine || ""}
            />

            {/* City and State Grid */}
            <div className="grid grid-cols-2 gap-4">
               <InputField label="City" name="city" placeholder="e.g. San Pablo" required defaultValue={persistedData?.city || ""} />
               <InputField label="State / Province" name="state" placeholder="e.g. Laguna" required defaultValue={persistedData?.state || ""} />
            </div>

            {/* Country and Postal Grid */}
            <div className="grid grid-cols-2 gap-4">
               {/* Custom Polished Dropdown UI */}
               <div className="relative text-left" ref={dropdownRef}>
                 <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                   Country <span className="text-red-500 ml-1">*</span>
                 </label>
                 
                 {/* 🎯 HIDDEN INPUT FOR FORMDATA GRABS */}
                 <input type="hidden" name="country" value={selectedCountry} />

                 <button
                   type="button"
                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   className="flex w-full items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 text-sm text-zinc-600 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all text-left"
                 >
                   <div className="flex items-center gap-3">
                     <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                     <span className="font-normal text-zinc-600">{selectedCountry}</span>
                   </div>
                   <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
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

               <InputField label="Postal Code" name="postalCode" placeholder="e.g. 4000" required defaultValue={persistedData?.postalCode || ""} />
            </div>

            {/* Navigation Buttons */}
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
        </div>
      </div>

      {/* RIGHT SIDE: DECORATIVE PANEL */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{
          clipPath: 'ellipse(100% 100% at 100% 50%)'
        }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Connecting you to <br />
            <span className="font-semibold italic font-serif">the network.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Providing your location helps us connect you with local partners 
            and nearby community events in your region.
          </p>
        </div>

        <div className="absolute bottom-12 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

/* Reusable Input Component */
const InputField = ({ label, name, type = "text", placeholder, defaultValue, required = false }: any) => (
  <div>
      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    <input
      name={name}
      type={type}
      required={required}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm"
    />
  </div>
);

export default ContactLocation;