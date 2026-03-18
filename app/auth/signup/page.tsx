"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import { handleSignIn } from "../../lib/auth";

const SignUp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    // Logic: 1. Lookup in DB -> 2. Password Verify -> 3. SMTP OTP Send
    setTimeout(() => {
      setLoading(false);
      router.push("/auth/verify-otp");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[650px] border border-zinc-100">
        {/* Left Side: Form Content */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-black">G</span>
              </div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">
                Gadvance
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
              Create <br /> <span className="text-teal-500">New Account</span>
            </h1>
            <p className="text-gray-400 mb-8 text-sm">
              Please fill in the details below to secure your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <input
                required
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleInputChange}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
              />

              {/* Password */}
              <input
                required
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleInputChange}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
              />

              {/* Confirm Password */}
              <input
                required
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleInputChange}
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-300 text-[10px] uppercase tracking-widest font-bold">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* Google Only SSO */}
              <GoogleButton onClick={handleSignIn} />
            </form>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-teal-600 font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Right Side: Decorative Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Focus on your growth.</h2>
            <p className="opacity-80 font-light leading-relaxed">
              Join thousands of students and professionals building the future
              of SaaS with Gadvance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
