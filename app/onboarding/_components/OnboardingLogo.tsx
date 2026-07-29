"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import logoIcon from "@/app/assets/logo.ico";

/**
 * Brand mark shown on every onboarding step. Wrapped in a Link so users
 * can bail out to the marketing site / home page at any point.
 */
export function OnboardingLogo() {
  return (
    <Link
      href="/"
      className="absolute top-8 left-8 flex items-center gap-3 group"
    >
      <div className="relative h-7 w-7">
        <Image
          src={logoIcon.src}
          alt="GADvance Logo"
          fill
          className="object-contain"
        />
      </div>
      <span className="text-lg font-semibold tracking-tight text-zinc-900 group-hover:text-[#8b5cf6] transition-colors">
        GADvance
      </span>
    </Link>
  );
}
