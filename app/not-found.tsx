import React from "react";
import Link from "next/link";
import Image from "next/image";
import image2 from "@/app/(public)/assets/error.png";

export default function NotFound() {
  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-white via-violet-50 to-violet-50 px-4 py-8 sm:px-8 lg:px-12">
      <div className="grid w-full max-w-7xl grid-cols-1 items-center justify-items-center gap-8 text-center md:grid-cols-2 md:text-left">
        {/* Text & Button Column */}
        <div className="flex flex-col items-center justify-center space-y-4 md:items-start md:space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold tracking-tight text-[#8b5cf6] sm:text-7xl lg:text-8xl">
              404
            </h1>

            <h2 className="text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl lg:text-5xl">
              Page <span className="text-[#8b5cf6]">Not Found.</span>
            </h2>

            <p className="max-w-xs text-xs text-zinc-600 sm:max-w-md sm:text-sm lg:max-w-lg lg:text-base">
              The page or resource you are looking for does not exist or has
              been removed. Let&apos;s get you back on track!
            </p>
          </div>

          <div>
            <Link
              href="/"
              className="inline-block rounded-md bg-[#8b5cf6] px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#7c3aed] sm:px-8 sm:py-3 sm:text-base"
            >
              Return to Home
            </Link>
          </div>
        </div>

        {/* Large Image Graphic Column */}
        <div className="flex w-full items-center justify-center">
          <Image
            src={image2}
            alt="404 illustration"
            priority
            loading="eager"
            unoptimized
            className="h-auto w-full max-w-xs object-contain pointer-events-none opacity-90 sm:max-w-md md:max-w-lg lg:max-w-xl"
          />
        </div>
      </div>
    </section>
  );
}
