"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import PhaseWrapper from "@/app/components/PhaseWrapper";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "",
    university: "",
    degree: "",
    yearLevel: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Data Constants
  const universities = ["Laguna State Polytechnic University"];
  const degrees = [
    "BS Computer Science",
    "BS Information Technology",
    "BS Information Systems",
    "BS Engineering",
    "BS Education",
    "BS Business Administration",
  ];
  const yearLevels = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "Irregular",
  ];

  // Password Strength Logic
  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };
  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  // Phase Validation
  const isStep1Valid =
    formData.firstName.length > 1 &&
    formData.lastName.length > 1 &&
    formData.gender !== "";
  const isStep2Valid =
    formData.university !== "" &&
    formData.degree !== "" &&
    formData.yearLevel !== "";
  const isStep3Valid =
    formData.email.includes("@") &&
    isPasswordStrong &&
    formData.password === formData.confirmPassword;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Reusable Tailwind classes for inputs
  const inputStyle =
    "w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 outline-none focus:ring-2 focus:ring-zinc-200 transition-all text-zinc-700 placeholder-zinc-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[650px] border border-zinc-100">
        {/* Left Side: Onboarding Content */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center text-white text-[10px] font-black">
              G
            </div>
            <span className="font-bold text-gray-800 tracking-tight">
              Gadvance
            </span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-12 relative px-4">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-100 -translate-y-1/2 z-0" />
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className="relative z-10 flex flex-col items-center gap-2 bg-white px-2"
              >
                {step > num ? (
                  <CheckCircle2
                    className="text-teal-500 bg-white rounded-full"
                    size={24}
                  />
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${step === num ? "border-teal-500 bg-teal-500 text-white" : "border-zinc-200 bg-white text-zinc-300"}`}
                  >
                    {step === num && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                )}
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${step === num ? "text-zinc-900" : "text-zinc-400"}`}
                >
                  Phase {num}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <PhaseWrapper
                  key="phase1"
                  title={
                    <>
                      Tell us about <br />
                      <span className="text-teal-500">yourself.</span>
                    </>
                  }
                  primaryButtonText="Continue"
                  isPrimaryDisabled={!isStep1Valid}
                  onPrimaryClick={nextStep}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="firstName"
                      placeholder="First Name"
                      className={inputStyle}
                      onChange={handleInputChange}
                    />
                    <input
                      name="lastName"
                      placeholder="Last Name"
                      className={inputStyle}
                      onChange={handleInputChange}
                    />
                  </div>
                  <input
                    name="middleName"
                    placeholder="Middle Name (Optional)"
                    className={inputStyle}
                    onChange={handleInputChange}
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    className={inputStyle}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </PhaseWrapper>
              )}

              {step === 2 && (
                <PhaseWrapper
                  key="phase2"
                  title={
                    <>
                      Your Academic <br />
                      <span className="text-orange-500">Profile.</span>
                    </>
                  }
                  primaryButtonText="Next Phase"
                  isPrimaryDisabled={!isStep2Valid}
                  onPrimaryClick={nextStep}
                  onBackClick={prevStep}
                  showBackButton
                >
                  <select
                    name="university"
                    value={formData.university}
                    className={inputStyle}
                    onChange={handleInputChange}
                  >
                    <option value="">Select University</option>
                    {universities.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <select
                    name="degree"
                    value={formData.degree}
                    className={inputStyle}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Course/Degree</option>
                    {degrees.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    name="yearLevel"
                    value={formData.yearLevel}
                    className={inputStyle}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Year Level</option>
                    {yearLevels.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </PhaseWrapper>
              )}

              {step === 3 && (
                <PhaseWrapper
                  key="phase3"
                  title={
                    <>
                      Secure your <br />
                      <span className="text-teal-500">account.</span>
                    </>
                  }
                  primaryButtonText="Complete Sign Up"
                  isPrimaryDisabled={!isStep3Valid}
                  onBackClick={prevStep}
                  showBackButton
                >
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className={inputStyle}
                    onChange={handleInputChange}
                  />
                  <div className="space-y-2">
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      className={inputStyle}
                      onChange={handleInputChange}
                    />
                    <div className="grid grid-cols-3 gap-2 px-1">
                      <div
                        className={`h-1 rounded-full ${passwordCriteria.length ? "bg-teal-500" : "bg-zinc-200"}`}
                      />
                      <div
                        className={`h-1 rounded-full ${passwordCriteria.uppercase ? "bg-teal-500" : "bg-zinc-200"}`}
                      />
                      <div
                        className={`h-1 rounded-full ${passwordCriteria.number ? "bg-teal-500" : "bg-zinc-200"}`}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      Must include 8+ chars, 1 uppercase, and 1 number
                    </p>
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    className={inputStyle}
                    onChange={handleInputChange}
                  />
                </PhaseWrapper>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs text-zinc-400 text-center mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-teal-600 font-black hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Right Side: Decorative Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <h2 className="text-4xl font-black mb-6">
              Start your <br />
              journey.
            </h2>
            <p className="opacity-80 font-medium leading-relaxed">
              Unlock specialized courses, community insights, and global
              networking designed for the next generation of leaders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
