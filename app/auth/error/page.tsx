"use client";

import React, { use } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import logoIcon from "@/app/assets/logo.ico";

const ERROR_COPY: Record<string, { title: string; description: string }> = {
  AccessDenied: {
    title: "Sign-in Blocked",
    description:
      "Your Google account could not be verified with our backend. Please try signing in again or contact support if the issue persists.",
  },
  Configuration: {
    title: "Configuration Error",
    description:
      "Authentication is temporarily unavailable due to a server configuration issue.",
  },
  Verification: {
    title: "Verification Expired",
    description:
      "Your verification request expired or was already used. Please start again.",
  },
  Default: {
    title: "Unable to Sign In",
    description:
      "We could not complete your sign-in right now. Please try again later.",
  },
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Use the React 'use' hook to unwrap the searchParams promise safely in a Client Component
  const params = use(searchParams);
  const errorCode = params.error || "Default";
  const errorMessage = ERROR_COPY[errorCode] || ERROR_COPY.Default;

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Left Side: Error Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <img src={logoIcon.src} alt="GADvance" className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-10">
            <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <AlertCircle size={24} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
              {errorMessage.title}
            </h1>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              {errorMessage.description}
            </p>
          </div>

          {/* Error Code Badge */}
          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50/50 px-4 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Reference: {errorCode}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/auth/signin"
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              try signing in again
            </Link>

            <Link
              href="/"
              className="w-full border border-zinc-100 hover:bg-zinc-50 text-zinc-400 px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Home size={14} />
              return home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side: Decorative Ellipse Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{
          clipPath: "ellipse(100% 100% at 100% 50%)",
        }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Security & <br />
            <span className="font-semibold italic font-serif">
              Handshake Protocols.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            We only allow access after a successful identity verification with
            our backend to ensure the integrity of our workspace.
          </p>
        </div>

        {/* Footer Text */}
        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. protection active.
        </div>
      </div>
    </div>
  );
}
