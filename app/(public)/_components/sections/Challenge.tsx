"use client";

import React, { useEffect, useRef } from "react";

const TheChallengeSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the browser supports IntersectionObserver
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Swap classes to reveal element smoothly
            entry.target.classList.remove("opacity-0", "translate-y-10");
            entry.target.classList.add("opacity-100", "translate-y-0");

            // 2. Stop observing so the animation only runs ONCE
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% is visible
        rootMargin: "0px 0px -50px 0px",
      },
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="overflow-hidden bg-gradient-to-b from-violet-100 via-violet-50 to-white py-32 sm:py-48">
      <div ref={scrollRef} className="mx-auto max-w-7xl px-8 lg:px-12">
        {/* Header Section */}
        <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 ease-out will-change-transform max-w-3xl">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
            The Reality
          </h2>
          <h3 className="mt-10 text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl">
            The gender gap in leadership <br className="hidden md:block" />
            <span className="font-semibold text-[#8b5cf6]">still exists.</span>
          </h3>
          <p className="mt-12 max-w-2xl text-xl font-light leading-9 text-zinc-500">
            Despite progress, structural barriers continue to limit workplace
            inclusion and career advancement for marginalized genders.
          </p>
        </div>

        {/* Issues Grid */}
        <div className="mt-32 grid grid-cols-1 gap-x-24 gap-y-24 lg:grid-cols-2">
          {/* Issue 01 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out will-change-transform flex flex-col border-t border-zinc-100 pt-12">
            <span className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
              01 / Opportunity
            </span>
            <h4 className="text-2xl font-medium tracking-tight text-zinc-900">
              Unequal Access
            </h4>
            <p className="mt-6 font-light leading-8 text-zinc-500">
              Leadership access and high-impact mentorship remain unevenly
              distributed. The &quot;broken rung&quot; still prevents qualified
              talent from reaching the first level of management.
            </p>
          </div>

          {/* Issue 02 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out will-change-transform flex flex-col border-t border-zinc-100 pt-12">
            <span className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
              02 / Environment
            </span>
            <h4 className="text-2xl font-medium tracking-tight text-zinc-900">
              Culture & Belonging
            </h4>
            <p className="mt-6 font-light leading-8 text-zinc-500">
              Organizations struggle to move beyond &quot;diversity
              numbers&quot; to build environments where every individual feels a
              genuine sense of psychological safety.
            </p>
          </div>
        </div>

        {/* Bottom statement */}
        <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-700 ease-out will-change-transform mt-32 flex items-center gap-x-6 text-zinc-400">
          <div className="h-px w-16 bg-[#8b5cf6]" />
          <p className="text-sm font-light tracking-wide">
            This gap impacts innovation, retention, and long-term organizational
            growth.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TheChallengeSection;
