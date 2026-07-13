"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";

const OnboardingPageOne = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Local state to hold form values for "Back" button persistence
  const [persistedData, setPersistedData] = useState<any>(null);

  // Custom Dropdown UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedStatus = session?.user?.status?.trim().toLowerCase();
  const shouldShowRedirecting =
    isRedirecting ||
    (status === "authenticated" && normalizedStatus === "active");

  // Load data from LocalStorage if user is coming back from Page 2
  useEffect(() => {
    const savedData = localStorage.getItem("onboarding_p1");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setPersistedData(parsed);
      if (parsed.gender) {
        setSelectedGender(parsed.gender);
      }
    }
  }, []);

  // Handle clicking outside to close custom dropdown panel safely
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && normalizedStatus === "active") {
      router.replace("/workspace");
    }
  }, [status, normalizedStatus, router]);

  if (status === "loading" || shouldShowRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
            verifying session...
          </p>
        </div>
      </div>
    );
  }

  const googleFirst = persistedData?.firstName || session?.user?.name || "";
  const googleLast = persistedData?.lastName || session?.user?.name || "";

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // If gender wasn't picked, prevent submission
    if (!selectedGender) {
      alert("Please select your gender.");
      return;
    }

    const pageOneData = {
      firstName: formData.get("firstName"),
      middleName: formData.get("middleName"),
      lastName: formData.get("lastName"),
      age: formData.get("age"),
      gender: selectedGender,
      birthday: formData.get("birthday"),
    };

    localStorage.setItem("onboarding_p1", JSON.stringify(pageOneData));
    router.push("/onboarding/contact-location");
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <img src={logoIcon.src} alt="GADvance" className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-10">
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">
              step 01 / 03
            </span>
            <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">
              Personal Identity 
            </h1>
            <p className="text-zinc-400 text-sm font-light mt-2">
              Let's start with your basic information.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleNext}>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name" 
                name="firstName"
                defaultValue={googleFirst}
                required
              />
              <InputField
                label="Last Name"
                name="lastName"
                defaultValue={googleLast}
                required
              />
            </div>

            <InputField
              label="Middle Name"
              name="middleName"
              defaultValue={persistedData?.middleName || ""}
              placeholder="Optional"
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Age"
                name="age"
                type="number"
                defaultValue={persistedData?.age || ""}
                required
              />
              
              {/* 🎯 FIX: CUSTOM TAILWIND DROPDOWN MENU ENGINE */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                  Gender
                  <span className="text-red-500 ml-1">*</span>
                </label>
                
                {/* Clickable Display Container Frame */}
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3.5 rounded-xl border transition-all text-sm cursor-pointer flex items-center justify-between select-none ${
                    isDropdownOpen 
                      ? "border-primary ring-4 ring-violet-50/50 bg-white text-zinc-800" 
                      : "border-zinc-100 bg-zinc-50/50 text-zinc-600"
                  }`}
                >
                  <span>{selectedGender || "Select Gender"}</span>
                  
                  {/* Custom SVG arrow element indicator */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#a1a1aa" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {/* Completely Custom Floating Options Panel Overlay */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <div
                      onClick={() => {
                        setSelectedGender("Male");
                        setIsDropdownOpen(false);
                      }}
                      className="px-4 py-3 text-sm text-zinc-600 hover:bg-violet-50/60 hover:text-primary cursor-pointer transition-colors"
                    >
                      Male
                    </div>
                    <div
                      onClick={() => {
                        setSelectedGender("Female");
                        setIsDropdownOpen(false);
                      }}
                      className="px-4 py-3 text-sm text-zinc-600 border-t border-zinc-50 hover:bg-violet-50/60 hover:text-primary cursor-pointer transition-colors"
                    >
                      Female
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                Date of Birth
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="birthday"
                type="date"
                required
                defaultValue={persistedData?.birthday || ""}
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-primary transition-all text-zinc-600 bg-zinc-50/50 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] mt-4"
            >
              Continue to Address
            </button>
          </form>
        </div>
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 text-white relative"
        style={{ clipPath: "ellipse(100% 100% at 100% 50%)" }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Tell us about <br />
            <span className="font-semibold italic font-serif">
              who you are.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Your identity is the foundation of your journey here. We use this to
            personalize your curriculum and verify your certifications.
          </p>
        </div>
        <div className="absolute bottom-12 text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required = false,
}: any) => (
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
      className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-primary transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm"
    />
  </div>
);

export default OnboardingPageOne;