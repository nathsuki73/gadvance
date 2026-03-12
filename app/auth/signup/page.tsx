"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    university: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validation Logic
  const isStep1Valid = formData.fullName.length > 2 && formData.gender !== "";
  const isStep2Valid = formData.university.length > 3;
  const isStep3Valid =
    formData.email.includes("@") &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword;

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

          {/* Progress Bar (Reference Image Style) */}
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

          {/* Form Phases with Micro-animations */}
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <h1 className="text-3xl font-black">
                    Tell us about <br />
                    <span className="text-teal-500">yourself.</span>
                  </h1>
                  <input
                    name="fullName"
                    placeholder="Full Name"
                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                    onChange={handleInputChange}
                  />
                  <select
                    name="gender"
                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 outline-none focus:ring-2 focus:ring-teal-500/20 text-zinc-500"
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    disabled={!isStep1Valid}
                    onClick={nextStep}
                    className="w-full py-4 bg-[#00A8CC] text-white rounded-xl font-bold disabled:opacity-30 transition-all shadow-lg shadow-teal-100"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <h1 className="text-3xl font-black">
                    Where do you <br />
                    <span className="text-orange-500">study?</span>
                  </h1>
                  <input
                    name="university"
                    placeholder="University Name"
                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    onChange={handleInputChange}
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={prevStep}
                      className="w-1/3 py-4 border border-zinc-200 rounded-xl font-bold text-zinc-400"
                    >
                      Back
                    </button>
                    <button
                      disabled={!isStep2Valid}
                      onClick={nextStep}
                      className="w-2/3 py-4 bg-[#FF7A00] text-white rounded-xl font-bold disabled:opacity-30 shadow-lg shadow-orange-100"
                    >
                      Next Phase
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <h1 className="text-3xl font-black">
                    Secure your <br />
                    <span className="text-teal-500">account.</span>
                  </h1>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50"
                    onChange={handleInputChange}
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Password (8+ chars)"
                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50"
                    onChange={handleInputChange}
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full p-4 rounded-xl border border-zinc-200 bg-zinc-50/50"
                    onChange={handleInputChange}
                  />

                  {formData.password !== "" &&
                    formData.password === formData.confirmPassword && (
                      <p className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Passwords match
                      </p>
                    )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={prevStep}
                      className="w-1/3 py-4 border border-zinc-200 rounded-xl font-bold text-zinc-400"
                    >
                      Back
                    </button>
                    <button
                      disabled={!isStep3Valid}
                      className="w-2/3 py-4 bg-[#00A8CC] text-white rounded-xl font-bold disabled:opacity-30 shadow-lg shadow-teal-100"
                    >
                      Complete Sign Up
                    </button>
                  </div>
                </motion.div>
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
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-black mb-6">
                Start your <br />
                journey.
              </h2>
              <p className="opacity-80 font-medium leading-relaxed">
                Unlock specialized courses, community insights, and global
                networking designed for the next generation of leaders.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
