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
      className="flex shrink-0 items-center gap-2.5 transition-transform active:scale-95"
    >
      <Image
        src={logoIcon}
        alt="GADvance Logo"
        width={32}
        height={32}
        priority
      />
      <span className="text-xl font-bold tracking-tight text-zinc-900 block">
        GADvance
      </span>
    </Link>
  );
}
