"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import { handleSignIn } from "../../lib/auth";
import { handleRegistration } from "./actions";
import { z } from "zod";
import { signOut, useSession } from "next-auth/react";
import { useToast } from "@/app/components/context/ToastContext";
import { OnboardingLogo } from "@/app/onboarding/_components/OnboardingLogo";
import { Eye, EyeOff } from "lucide-react";

const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address (e.g., name@example.com)"),
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
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const { showToast } = useToast();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // ⏱️ Cooldown state in seconds
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ⏱️ Handle Button Cooldown Countdown Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (status === "authenticated") {
      const justLoggedOut = searchParams.get("loggedOut") === "1";
      if (justLoggedOut) {
        signOut({ redirect: false }).finally(() => {
          window.location.href = "/auth/signin";
        });
        return;
      }
      if (session?.user?.status === "onboarding") {
        router.push("/onboarding");
      } else if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/workspace");
      }
    }
  }, [status, session, router, searchParams, callbackUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Disallow capital casing on email as user types
    const processedValue = name === "email" ? value.toLowerCase() : value;
    setFormData({ ...formData, [name]: processedValue });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || cooldown > 0) return;

    setErrors({});

    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);

      const firstErrorMessage = result.error.issues[0]?.message;
      showToast(firstErrorMessage || "Please check the form inputs.", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await handleRegistration(
        formData.email.trim(),
        formData.password,
        formData.confirmPassword,
      );

      if (response?.success) {
        showToast(
          "Verification link sent! Please check your inbox.",
          "success",
        );

        const cleanEmail = formData.email.trim();

        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("magic_link_expiry_")) {
            sessionStorage.removeItem(key);
          }
        });

        sessionStorage.setItem("pending_verification_email", cleanEmail);

        const callbackParam = callbackUrl
          ? `&callbackUrl=${encodeURIComponent(callbackUrl)}`
          : "";

        router.push(
          `/auth/verify-link?email=${encodeURIComponent(cleanEmail)}${callbackParam}`,
        );
      } else {
        setLoading(false);
        const errorMessage = response?.error || "Registration failed.";

        // ⏱️ Extract the exact remaining seconds from Laravel's rate limit error message
        const secondsMatch = errorMessage.match(/(\d+)\s*seconds?/i);
        if (secondsMatch) {
          const exactSeconds = parseInt(secondsMatch[1], 10);
          setCooldown(exactSeconds);
        } else if (
          errorMessage.toLowerCase().includes("seconds") ||
          errorMessage.toLowerCase().includes("too many")
        ) {
          setCooldown(60); // Fallback to 60s if no number is matched
        }

        setErrors({ form: errorMessage });
        showToast(errorMessage, "error");
      }
    } catch (err) {
      setLoading(false);
      console.error("Registration Error:", err);
      const networkErrorMessage =
        "Connection failed. Please check your network.";
      setErrors({ form: networkErrorMessage });
      showToast(networkErrorMessage, "error");
    }
  };

  const signInHref = callbackUrl
    ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/signin";

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Left Side: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <OnboardingLogo />
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {status === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-0">
              <div className="w-6 h-6 mb-4"></div>
              <p className="text-sm text-transparent font-medium tracking-tight">
                Loading...
              </p>
            </div>
          ) : session ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                Welcome!
              </h1>
              <p className="text-zinc-400 mb-10 text-sm lowercase font-light">
                Redirecting to your workspace...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-8 tracking-tight">
                Create Account
              </h1>
              <p className="text-zinc-400 mb-8 text-sm font-light">
                Fill in the details to secure your account
              </p>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    Email Address
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="sample@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.email ? "border-red-400" : "border-zinc-100"
                    } focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50`}
                  />
                  {errors.email && (
                    <p className="text-[9px] text-red-500 font-bold mt-1.5 uppercase tracking-wider">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                      Password
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                          errors.password ? "border-red-400" : "border-zinc-100"
                        } focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                      Confirm Password
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                          errors.confirmPassword
                            ? "border-red-400"
                            : "border-zinc-100"
                        } focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {(errors.password || errors.confirmPassword) && (
                  <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">
                    {errors.password || errors.confirmPassword}
                  </p>
                )}

                {/* Submit Button with Dynamic Cooldown Countdown text */}
                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
                >
                  {loading
                    ? "Creating Account..."
                    : cooldown > 0
                      ? `Try again in ${cooldown}s`
                      : "Create account"}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="grow border-t border-zinc-100"></div>
                  <span className="shrink mx-4 text-zinc-300 text-[12px] uppercase tracking-[0.2em] font-bold">
                    Or
                  </span>
                  <div className="grow border-t border-zinc-100"></div>
                </div>

                <GoogleButton onClick={handleSignIn} />
              </form>
            </>
          )}

          {!session && status !== "loading" && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-8 text-center">
              Already have an account?{" "}
              <Link
                href={signInHref}
                className="text-[#8b5cf6] hover:underline transition-colors"
              >
                sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Side: Decorative Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{ clipPath: "ellipse(100% 100% at 100% 50%)" }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Become a part of the <br />
            <span className="font-semibold italic font-serif text-white">
              equitable future.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Your journey starts here. join our community of leaders and learners
            dedicated to reshaping the philippine workplace, one module at a
            time.
          </p>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. all rights reserved.
        </div>
      </div>
    </div>
  );
};

export default SignUp;
