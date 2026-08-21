"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { changeForgotPassword } from "../forgot-password/actions";
import logoIcon from "@/app/assets/logo.ico";
import { useToast } from "@/app/components/context/ToastContext";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const resetId = searchParams.get("reset") || "";
  const token = searchParams.get("token") || "";
  const hasValidLinkParams = resetId.length > 0 && token.length > 0;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const canSubmit = useMemo(() => {
    return (
      hasValidLinkParams &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      !loading
    );
  }, [confirmPassword, hasValidLinkParams, loading, password]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!/[0-9]/.test(password)) {
      nextErrors.password = "Password must contain at least one number.";
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    if (!hasValidLinkParams) {
      const err = "Invalid or missing reset link. Please request a new one.";
      setErrors({ form: err });
      showToast(err, "error");
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErr = Object.values(validationErrors)[0];
      if (firstErr) showToast(firstErr, "error");
      return;
    }

    setLoading(true);

    try {
      const result = await changeForgotPassword(
        resetId,
        token,
        password,
        confirmPassword,
      );

      if (!result?.success) {
        const err = result?.error || "Failed to reset password.";
        setErrors({ form: err });
        showToast(err, "error");
        return;
      }

      const msg =
        result?.message || "Password changed successfully! Redirecting...";
      setSuccessMessage(msg);
      showToast(msg, "success");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/auth/signin");
      }, 1500);
    } catch {
      const err =
        "Something went wrong. Please check your network and try again.";
      setErrors({ form: err });
      showToast(err, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Left Side: Main Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <Link
          href="/auth/signin"
          className="absolute top-8 left-8 flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative h-7 w-7">
            <Image
              src={logoIcon.src}
              alt="GADvance logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </Link>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {!hasValidLinkParams ? (
            /* Invalid Link State matching VerifyEmail error style */
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm">
                <AlertCircle size={30} strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-zinc-500 text-sm font-light leading-relaxed mb-6">
                This password reset link is missing a valid security token or
                has already expired.
              </p>

              <div className="w-full rounded-2xl border border-red-100 bg-red-50/70 p-5 mb-8 text-left shadow-sm">
                <p className="text-xs text-red-700 leading-relaxed font-light">
                  For your security, password reset links have a strict time
                  limit and can only be used once. Please request a fresh link
                  to continue.
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Link
                  href="/auth/forgot-password"
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Request New Reset Link
                </Link>

                <Link
                  href="/auth/signin"
                  className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 px-8 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-center"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Main Valid Reset Form */
            <>
              <div className="mb-6">
                <div className="h-16 w-16 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center text-[#8b5cf6] mb-6 shadow-sm">
                  <KeyRound size={30} strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                  Create New Password
                </h1>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">
                  Please enter your new password below. Once confirmed, your old
                  password will be updated immediately.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.form && (
                  <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 text-left flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-xs text-red-700 font-medium leading-relaxed">
                      {errors.form}
                    </p>
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-left flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600 shrink-0"
                    />
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      {successMessage}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    New Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }));
                      }}
                      placeholder="Enter new password"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${
                        errors.password ? "border-red-400" : "border-zinc-100"
                      } focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-700 placeholder-zinc-300 bg-zinc-50/50`}
                    />
                    <Lock
                      size={18}
                      className="absolute left-4 text-zinc-300 pointer-events-none"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-wider">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    Confirm New Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword)
                          setErrors((prev) => ({
                            ...prev,
                            confirmPassword: undefined,
                          }));
                      }}
                      placeholder="Re-enter new password"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-zinc-100"
                      } focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-700 placeholder-zinc-300 bg-zinc-50/50`}
                    />
                    <KeyRound
                      size={18}
                      className="absolute left-4 text-zinc-300 pointer-events-none"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase tracking-wider">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="w-full pt-2">
                  <Link
                    href="/auth/signin"
                    className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 px-8 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </Link>
                </div>
              </form>
            </>
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
            Security updated <br />
            <span className="font-semibold italic font-serif">
              effortlessly.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Your security is our top priority. Resetting your password
            invalidates all active sessions to keep your profile protected.
          </p>
        </div>
        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. all rights reserved.
        </div>
      </div>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans text-sm">
          Loading reset session...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
