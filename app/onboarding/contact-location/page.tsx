"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";

const ContactLocation = () => {
  const router = useRouter();
  const [persistedData, setPersistedData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("onboarding_p2");
    if (saved) {
      try {
        setPersistedData(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Create the data object for this step
    const pageTwoData = {
      phone: formData.get("phone"),
      addressLine: formData.get("addressLine"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"),
      postalCode: formData.get("postalCode"),
    };
    
    // Store in localStorage to persist across file navigation
    localStorage.setItem("onboarding_p2", JSON.stringify(pageTwoData));
    
    // Navigate to Page 3 (Final Step)
    router.push("/onboarding/icon-bio");
  };

  const handleBack = () => {
    // Save current form values before navigating back
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
            <span className="text-[10px] font-bold text-[#00A8CC] uppercase tracking-[0.4em]">step 02 / 03</span>
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
               <InputField label="Country" name="country" defaultValue={persistedData?.country || "Philippines"} required />
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
                className="w-2/3 bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-100 active:scale-[0.98]"
              >
                Continue to Bio
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE: DECORATIVE PANEL */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-[#00A8CC] flex-col items-center justify-center p-12 text-white relative"
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
    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">{label}</label>
    <input
      name={name}
      type={type}
      required={required}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-sky-50/50 focus:border-[#00A8CC] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm"
    />
  </div>
);

export default ContactLocation;
