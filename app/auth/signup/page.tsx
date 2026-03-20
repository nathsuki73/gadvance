"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import { handleSignIn } from "../../lib/auth";
import { handleRegistration } from "./actions";
import { z } from "zod"; // 1. Import Zod
import { useSession } from "next-auth/react";

// 2. Define the validation schema
const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [errors, setErrors] = useState<Record<string, string>>({}); // State for errors
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      // Check the status we stored in the JWT
      if (session?.user?.status === "onboarding") {
        router.push("/onboarding");
      } else {
        router.push("/workspace/module");
      }
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for a field when the user starts typing again
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // 3. Validate using Zod
    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);

    try {
      // Call the Server Action we just made
      const response = await handleRegistration(formData.email);

      if (response.success) {
        setLoading(false);
        // Move to the OTP page and pass the email so it can be displayed
        router.push(
          `/auth/verify-otp?context=signup&email=${encodeURIComponent(formData.email)}`,
        );
      } else {
        setLoading(false);
        // Show the server error (e.g., SMTP failure) in your Zod error state
        setErrors({ email: response.error || "An error occurred" });
      }
    } catch (err) {
      setLoading(false);
      setErrors({ email: "Connection failed. Check your network." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-zinc-900">
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
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 rounded-xl border ${errors.email ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 rounded-xl border ${errors.password ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
                />
                {errors.password && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 rounded-xl border ${errors.confirmPassword ? "border-red-400" : "border-gray-200"} focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
                />
                {errors.confirmPassword && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>

              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-300 text-[10px] uppercase tracking-widest font-bold">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

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
