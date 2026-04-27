"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";

const ERROR_COPY: Record<string, { title: string; description: string }> = {
  AccessDenied: {
    title: "Sign-in blocked",
    description:
      "Your Google account could not be verified with our backend. Please try again in a moment.",
  },
  Configuration: {
    title: "Configuration error",
    description:
      "Authentication is temporarily unavailable due to a server configuration issue.",
  },
  Verification: {
    title: "Verification expired",
    description:
      "Your verification request expired or was already used. Please start again.",
  },
  Default: {
    title: "Unable to sign in",
    description:
      "We could not complete your sign in right now. Please try again.",
  },
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorCode = searchParams.error || "Default";
  const errorMessage = ERROR_COPY[errorCode] || ERROR_COPY.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-zinc-900">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[600px] border border-zinc-100">
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="relative h-9 w-9 shrink-0">
                <img
                  src={logoIcon.src}
                  alt="GADVance logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight text-gray-800">
                GADVance
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
              {errorMessage.title}
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              {errorMessage.description}
            </p>

            <div className="mb-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              Error code: {errorCode}
            </div>

            <div className="flex gap-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center bg-[#00A8CC] hover:bg-[#0096b6] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 active:scale-[0.98]"
              >
                Back to Sign In
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Secure authentication.</h2>
            <p className="opacity-80 font-light leading-relaxed">
              We only allow sign in after successful identity handshake with the
              backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
