"use client";

import React, { useEffect, useRef } from "react";

const WhyItMattersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Reveal element smoothly
            entry.target.classList.remove(
              "opacity-0",
              "translate-y-10",
              "scale-[0.98]",
            );
            entry.target.classList.add(
              "opacity-100",
              "translate-y-0",
              "scale-100",
            );

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
    <section className="overflow-hidden bg-white py-32 sm:py-48">
      <div ref={scrollRef} className="mx-auto max-w-7xl px-8 lg:px-12">
        {/* Section Label */}
        <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out will-change-transform mb-16 flex items-center gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            WHY IT MATTERS
          </h2>
        </div>

        {/* Main Argument */}
        <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out will-change-transform grid grid-cols-1 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 md:text-6xl">
              Equity is not just a <br />
              <span className="font-serif italic font-bold text-primary">
                social goal.
              </span>
            </h2>
          </div>

          <div className="self-end lg:col-span-5 lg:col-start-8">
            <p className="text-xl font-light leading-9 text-zinc-500">
              In the Philippines, organizations that prioritize gender
              advancement report
              <span className="font-medium text-zinc-900">
                {" "}
                significantly higher revenue growth{" "}
              </span>
              and talent retention in 2026.
            </p>
          </div>
        </div>

        {/* Data Points - Staggered list */}
        <div className="mt-32 grid grid-cols-1 gap-16 border-t border-zinc-100 pt-16 md:grid-cols-3">
          {/* Stat 01 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out will-change-transform">
            <span className="text-5xl font-light text-primary">44%</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              Higher Growth
            </h4>
            <p className="mt-4 font-light leading-7 text-zinc-500">
              Local companies with gender-equal initiatives are nearly twice as
              likely to outperform industry benchmarks in the Philippine market.
            </p>
          </div>

          {/* Stat 02 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out will-change-transform">
            <span className="text-5xl font-light text-primary">28%</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              The Visibility Gap
            </h4>
            <p className="mt-4 font-light leading-7 text-zinc-500">
              Only 28% of Filipino employees see senior leaders as visible role
              models, marking a massive opportunity for brand differentiation.
            </p>
          </div>

          {/* Stat 03 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-700 ease-out will-change-transform">
            <span className="text-5xl font-light text-primary">Top 25</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              Global Standing
            </h4>
            <p className="mt-4 font-light leading-7 text-zinc-500">
              The Philippines remains a regional leader in gender parity, yet
              cultural &quot;double burdens&quot; still hinder full economic
              participation.
            </p>
          </div>
        </div>

        {/* Closing "Why" Block - Smooth zoom/fade */}
        <div className="scroll-anim opacity-0 translate-y-10 scale-[0.98] transition-all duration-[1200ms] delay-500 ease-out will-change-transform relative -mx-8 mt-40 overflow-hidden bg-sky-50/50 px-8 py-24 sm:mx-0 sm:rounded-[40px] sm:py-32">
          {/* soft ambient light */}
          <div className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,_rgba(0,174,239,0.08)_0%,_transparent_70%)]" />

          <div className="relative mx-auto max-w-4xl text-center">
            {/* minimal accent line */}
            <div className="mx-auto mb-12 h-1.5 w-1.5 rounded-full bg-primary" />

            <p className="text-3xl font-light italic leading-[1.2] tracking-tight text-zinc-800 md:text-5xl">
              &quot;when we advance gender equity, we don&apos;t just fix a
              workplace—we{" "}
              <span className="font-semibold italic font-serif text-primary">
                modernize the philippine economy
              </span>{" "}
              for the next generation of leaders.&quot;
            </p>

            <p className="mt-12 text-sm font-medium lowercase tracking-[0.2em] text-zinc-400">
              — the gadvance mission
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMattersSection;
