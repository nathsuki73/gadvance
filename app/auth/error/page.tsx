"use client";

import React, { use } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import logoIcon from "@/app/assets/logo.ico";

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = use(searchParams);
  const errorCode = params.error || "Default";
  const customMessage = params.message;

  // Dynamic fallback titles based on error codes
  const getTitle = (code: string) => {
    switch (code) {
      case "AccessDenied":
        return "Sign-in Blocked";
      case "Configuration":
        return "Configuration Error";
      case "Verification":
        return "Verification Expired";
      default:
        return "Unable to Sign In";
    }
  };

  const errorTitle = getTitle(errorCode);

  // Default description if no custom message is present
  const defaultDescription = customMessage
    ? decodeURIComponent(customMessage)
    : "We could not complete your sign-in right now. Please try again later.";

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <img src={logoIcon.src} alt="GADvance" className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm">
              <AlertCircle size={30} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
              {errorTitle}
            </h1>

            {/* General instruction text */}
            <p className="text-zinc-500 text-sm font-light leading-relaxed mb-6">
              Please review the details below or try again using the options
              provided.
            </p>

            {/* Main error message highlighted inside the red alert box container (font-light to match verify/reset) */}
            <div className="w-full rounded-2xl border border-red-100 bg-red-50/70 p-5 mb-8 text-left shadow-sm">
              <p className="text-xs text-red-700 leading-relaxed font-light">
                {defaultDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/auth/signin"
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>

              <Link
                href="/"
                className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 px-8 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-center"
              >
                <Home size={14} />
                Return home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{ clipPath: "ellipse(100% 100% at 100% 50%)" }}
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
        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. protection active.
        </div>
      </div>
    </div>
  );
}
