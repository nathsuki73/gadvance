"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import { handleSignIn } from "../../lib/auth";
import { handleRegistration } from "./actions";
import { z } from "zod";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle auto-redirect if session exists
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.status === "onboarding") {
        router.push("/onboarding");
      } else {
        router.push("/workspace/module");
      }
    }
  }, [status, session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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
      const response = await handleRegistration(formData.email);
      if (response.success) {
        setLoading(false);
        router.push(
          `/auth/verify-otp?context=signup&email=${encodeURIComponent(formData.email)}`,
        );
      } else {
        setLoading(false);
        if (process.env.NODE_ENV !== "production") {
          console.error("Registration failed:", {
            statusCode: response.statusCode,
            error: response.error,
            debug: response.debug,
          });
        }
        setErrors({ form: response.error || "An error occurred" });
      }
    } catch (err) {
      setLoading(false);
      console.error("Registration Error:", err);
      setErrors({ form: "Connection failed. Check your network." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-zinc-900">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[650px] border border-zinc-100">
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

            {/* --- ADDED LOADING STATE START --- */}
            {status === "loading" ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-400 font-medium">
                  Verifying session...
                </p>
              </div>
            ) : status === "authenticated" ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  Welcome back!
                </h1>
                <p className="text-gray-400 mb-10 text-sm">
                  Redirecting you to your workspace...
                </p>
              </div>
            ) : (
              /* --- ADDED LOADING STATE END --- */
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  Create <br />{" "}
                  <span className="text-teal-500">New Account</span>
                </h1>
                <p className="text-gray-400 mb-8 text-sm">
                  Please fill in the details below to secure your account.
                </p>

                {errors.form && (
                  <p className="text-xs text-red-500 font-semibold mb-3">
                    {errors.form}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 rounded-xl border ${
                        errors.email ? "border-red-400" : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 rounded-xl border ${
                        errors.password ? "border-red-400" : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
                    />
                    {errors.password && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 ml-2 uppercase tracking-wider">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 rounded-xl border ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-gray-200"
                      } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50`}
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
              </>
            )}
          </div>

          {!session && status !== "loading" && (
            <p className="text-sm text-gray-500 mt-8">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-teal-600 font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          )}
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
