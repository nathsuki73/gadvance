"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import { changeForgotPassword } from "../forgot-password/actions";

type FormErrors = {
  password?: string;
  confirmPassword?: string;
  form?: string;
};

const NewPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const resetToken = searchParams.get("reset_token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const canSubmit = useMemo(() => {
    return (
      email.length > 0 &&
      resetToken.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      !loading
    );
  }, [confirmPassword, email, loading, password, resetToken]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!/[A-Z]/.test(password)) {
      nextErrors.password =
        "Password must include at least one uppercase letter.";
    }

    if (!/[0-9]/.test(password)) {
      nextErrors.password = "Password must include at least one number.";
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

    if (!email || !resetToken) {
      setErrors({
        form: "Missing reset session. Restart the forgot password flow.",
      });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await changeForgotPassword(
        email,
        resetToken,
        password,
        confirmPassword,
      );

      if (!result.success) {
        setErrors({ form: result.error || "Failed to change password." });
        return;
      }

      setSuccessMessage(result.message || "Password changed successfully.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/auth/signin");
      }, 1200);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isFlowInvalid = !email || !resetToken;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[620px] border border-zinc-100">
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-black">G</span>
              </div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">
                Gadvance
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
              Set <br /> <span className="text-teal-500">New Password</span>
            </h1>
            <p className="text-gray-400 mb-8 text-sm max-w-sm font-medium">
              Create a strong password for your account. This will replace your
              old password immediately.
            </p>

            {isFlowInvalid ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
                <p className="text-sm font-semibold text-rose-700">
                  Missing reset session. Please request a new OTP first.
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="mt-3 inline-flex text-sm font-bold text-teal-600 hover:underline"
                >
                  Go to Forgot Password
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {errors.form}
                  </p>
                )}

                {successMessage && (
                  <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {successMessage}
                  </p>
                )}

                <div>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={20}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1 ml-2 uppercase tracking-wider">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <KeyRound
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                      size={20}
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1 ml-2 uppercase tracking-wider">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2 active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Sign In
            </Link>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
              <KeyRound size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Password updated safely.
            </h2>
            <p className="opacity-80 font-light leading-relaxed max-w-xs">
              Your reset session is validated before password change, protecting
              your account from unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordContent />
    </Suspense>
  );
}
