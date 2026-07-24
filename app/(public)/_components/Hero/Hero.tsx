"use client";

import React, { useEffect, useRef } from "react";
import ProtectedButton from "../../../components/ProtectedButton";
import Image from "next/image";
import image2 from "@/app/(public)/assets/Subtract.png";

const Hero = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safety check for SSR/Older browsers
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Reveal element
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove(
              "opacity-0",
              "translate-y-10",
              "translate-y-20",
            );

            // 2. CRITICAL: Stop watching element to free up CPU/Memory
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-0 flex min-h-full max-w-full items-center justify-center overflow-hidden lg:pt-8 bg-gradient-to-b from-white via-violet-50 to-violet-50">
      <div
        ref={scrollRef}
        className="grid w-full grid-cols-1 items-center justify-items-center gap-12 text-center pt-10"
      >
        {/* Content Container */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="space-y-4">
            {/* 1. Header Animation */}
            <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 ease-out will-change-transform text-4xl font-medium leading-tight tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-[#8b5cf6]">Empower.</span> Educate. <br />
              Advance <span className="text-[#8b5cf6]">Gender Equality.</span>
            </h1>

            {/* 2. Paragraph Animation */}
            <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out will-change-transform mx-4 max-w-5xl text-base text-zinc-600 sm:text-lg">
              Join GADvance and turn learning into real change. Empower yourself
              with knowledge, build awareness, and take action toward a more
              equal and inclusive future.
            </p>
          </div>

          {/* 3. Button Animation */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out will-change-transform flex justify-center">
            <ProtectedButton
              onClick={() => {
                window.location.href = "/workspace";
              }}
              className="rounded-md bg-[#8b5cf6] px-8 py-3 text-base sm:text-lg font-medium text-white transition-colors hover:bg-[#7c3aed]"
              redirectUrl="/workspace"
            >
              Get Started
            </ProtectedButton>
          </div>

          {/* 4. Image Animation */}
          <div className="scroll-anim opacity-0 translate-y-20 transition-all duration-[1500ms] delay-700 ease-out will-change-transform">
            <Image
              src={image2}
              width={1200}
              height={1200}
              alt="Hero illustration"
              className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl object-contain -translate-y-10 sm:-translate-y-16 lg:-translate-y-24 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
