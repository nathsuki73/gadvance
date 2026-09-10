"use client";

import { useEffect } from "react";
import Image from "next/image";
import image2 from "@/app/(public)/assets/error.png";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-white via-violet-50 to-violet-50 px-4 py-8 sm:px-8 lg:px-12">
      <div className="grid w-full max-w-7xl grid-cols-1 items-center justify-items-center gap-8 text-center md:grid-cols-2 md:text-left">
        {/* Text & Button Column */}
        <div className="flex flex-col items-center justify-center space-y-4 md:items-start md:space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-[#8b5cf6] sm:text-6xl lg:text-7xl">
              Oops!
            </h1>

            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
              Something went <span className="text-[#8b5cf6]">wrong.</span>
            </h2>

            <p className="max-w-xs text-xs text-zinc-600 sm:max-w-md sm:text-sm lg:max-w-lg lg:text-base">
              We encountered an unexpected issue loading this section. This page
              or resource might be temporarily unavailable because an
              administrator is currently updating its content.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md bg-[#8b5cf6] px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#7c3aed] sm:px-8 sm:py-3 sm:text-base shadow-sm"
            >
              Try again
            </button>
            <button
              onClick={() => {
                window.history.back();
                setTimeout(() => window.location.reload(), 50);
              }}
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-2.5 text-xs font-medium text-zinc-700 border border-zinc-200 transition-colors hover:bg-zinc-50 sm:px-8 sm:py-3 sm:text-base shadow-sm"
            >
              Go back
            </button>
          </div>
        </div>

        {/* Large Image Graphic Column */}
        <div className="flex w-full items-center justify-center">
          <Image
            src={image2}
            alt="Error illustration"
            priority
            loading="eager"
            unoptimized
            className="h-auto w-full max-w-xs object-contain pointer-events-none opacity-90 sm:max-w-md md:max-w-lg lg:text-xl"
          />
        </div>
      </div>
    </section>
  );
}
