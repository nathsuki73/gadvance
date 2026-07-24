"use client";

import React, { useEffect, useRef } from "react";
import image1 from "@/app/(public)/assets/hero.png";
import Image from "next/image";

const TheVisionSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Swap classes to reveal element
            entry.target.classList.remove("opacity-0", "translate-y-10");
            entry.target.classList.add("opacity-100", "translate-y-0");

            // 2. Stop observing so it only animates ONCE
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="overflow-hidden bg-zinc-50 py-32 sm:py-48">
      <div ref={scrollRef} className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="flex flex-col gap-24 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Content Area */}
          <div className="max-w-2xl lg:sticky lg:top-24">
            {/* Main Header Animation */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 ease-out will-change-transform">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                The Vision
              </h2>
              <h3 className="mt-10 text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl">
                Moving from <span className="italic">awareness</span> <br />
                <span className="font-semibold">to action.</span>
              </h3>

              <p className="mt-12 text-xl font-light leading-9 text-zinc-500">
                GADVance helps organizations and individuals bridge the gap
                between intent and impact through practical education and
                leadership development.
              </p>
            </div>

            <div className="mt-16 space-y-16">
              {/* Feature 01 - Staggered Delay */}
              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out will-change-transform max-w-md">
                <h4 className="text-lg font-semibold uppercase tracking-wider text-zinc-900">
                  For Organizations
                </h4>
                <p className="mt-4 font-light leading-7 text-zinc-500">
                  Develop healthier workplace cultures, stronger collaboration,
                  and more inclusive leadership systems that drive retention and
                  innovation.
                </p>
              </div>

              {/* Feature 02 - Staggered Delay */}
              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out will-change-transform max-w-md">
                <h4 className="text-lg font-semibold uppercase tracking-wider text-zinc-900">
                  For Individuals
                </h4>
                <p className="mt-4 font-light leading-7 text-zinc-500">
                  Build the confidence and leadership readiness needed to
                  navigate and thrive in modern professional environments.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Large Visual - Different transition for a "Reveal" effect */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-[1500ms] delay-200 ease-out will-change-transform relative aspect-[4/5] w-full overflow-hidden rounded-sm lg:max-w-xl">
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
              <Image
                src={image1}
                width={1200}
                height={1200}
                alt="Vision illustration"
                className="pointer-events-none h-full w-full object-cover transition-transform duration-[3000ms] hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheVisionSection;
