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
            HOW GADVANCE ADAPTS
          </h2>
        </div>

        {/* Main Argument */}
        <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out will-change-transform grid grid-cols-1 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 md:text-6xl">
              Learning that responds to <br />
              <span className="font-serif italic font-bold text-primary">
                every answer.
              </span>
            </h3>
          </div>

          <div className="self-end lg:col-span-5 lg:col-start-8">
            <p className="text-xl font-light leading-9 text-zinc-500">
              GADvance estimates how well you understand each topic using
              <span className="font-medium text-zinc-900">
                {" "}
                Bayesian Knowledge Tracing (BKT){" "}
              </span>
              and updates that estimate after every response you give.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-32 grid grid-cols-1 gap-16 border-t border-zinc-100 pt-16 md:grid-cols-3">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out will-change-transform">
            <span className="text-5xl font-light text-primary">01</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              Mastery tracking
            </h4>
            <p className="mt-4 font-light leading-7 text-zinc-500">
              Each answer updates your estimated mastery of the topic, taking
              into account the chance of a lucky guess or a careless slip.
            </p>
          </div>

          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out will-change-transform">
            <span className="text-5xl font-light text-primary">02</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              Personalized difficulty
            </h4>
            <p className="mt-4 font-light leading-7 text-zinc-500">
              Checkpoint quizzes choose the next question at a Bloom&apos;s
              Taxonomy level that matches your current estimate, from
              remembering concepts to evaluating real situations.
            </p>
          </div>

          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-700 ease-out will-change-transform">
            <span className="text-5xl font-light text-primary">03</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              Targeted review
            </h4>
            <p className="mt-4 font-light leading-7 text-zinc-500">
              When a topic needs more work, GADvance points you back to the
              related lesson content so you can review before moving on.
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
              Gender and Development learning should meet people{" "}
              <span className="font-semibold italic font-serif text-primary">
                where they are
              </span>
              , and help them grow from there.
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
