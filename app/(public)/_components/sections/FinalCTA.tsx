"use client";

import React, { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

const FinalCTA = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Reveal element smoothly (handling scale and opacity)
            entry.target.classList.remove(
              "opacity-0",
              "translate-y-10",
              "scale-95",
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
    <section className="relative overflow-hidden bg-white py-32 sm:py-56">
      {/* soft background glow */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-50/40 blur-[140px]" />

      <div
        ref={scrollRef}
        className="relative mx-auto max-w-5xl px-8 text-center"
      >
        {/* Label Animation */}
        <h2 className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out will-change-transform mb-12 text-sm font-bold uppercase tracking-[0.4em] text-primary">
          take the next step
        </h2>

        {/* Main Heading Animation */}
        <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out will-change-transform text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
          be part of the <br />
          <span className="font-serif font-semibold italic text-primary">
            equitable future
          </span>{" "}
          <br />
          of the philippines.
        </p>

        {/* Description Animation */}
        <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out will-change-transform mx-auto mt-12 max-w-2xl text-xl font-light leading-relaxed text-zinc-500">
          whether you are an institution looking to transform your culture or a
          student ready to lead, gadvance provides the roadmap to get there.
        </p>

        {/* Buttons Animation - Scale and Fade */}
        <div className="scroll-anim opacity-0 translate-y-10 scale-95 transition-all duration-1000 delay-700 ease-out will-change-transform mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <button className="group relative flex w-full items-center justify-center gap-3 rounded-full bg-primary px-10 py-5 text-white transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-sky-100 active:scale-95 sm:w-auto">
            <span className="text-lg font-medium lowercase">
              start your enrollment
            </span>
            <ArrowUpRight
              size={20}
              // className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </button>

          {/* <button className="w-full rounded-full border border-zinc-200 bg-white px-10 py-5 text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95 sm:w-auto">
            <span className="text-lg font-medium lowercase">
              contact our partnership team
            </span>
          </button> */}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
