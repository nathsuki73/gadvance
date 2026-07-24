"use client";

import React from "react";
import { ArrowUpRight, Clock3, Users } from "lucide-react";

import { useRouter } from "next/navigation";
import type { LearningPlan } from "../types";

type CourseCardProps = {
  module: LearningPlan;
};

const CourseCard = ({ module }: CourseCardProps) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/explore/course/${module.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-purple-100 bg-purple-50 p-6 sm:p-7 text-left shadow-[0_1px_2px_rgba(24,24,27,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_24px_48px_-12px_rgba(139,92,246,0.18)] cursor-pointer select-none active:scale-[0.99] active:translate-y-0 w-full max-w-md mx-auto"
    >
      {/* Signature: ambient glow that blooms on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Header */}
      <div className="relative flex items-start justify-end">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-200 bg-white/60 text-zinc-400 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-white">
          <ArrowUpRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>

      {/* Content: Updated with fluid typography tracking */}
      <div className="relative flex-1">
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight sm:leading-snug tracking-tight text-zinc-900 transition-colors duration-200 group-hover:text-primary wrap-break-word">
          {module.title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-600 line-clamp-2">
          {module.description ||
            "Structured learning modules and guided activities."}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-purple-100" />

      {/* Footer: meta + CTA */}
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3.5 text-[11px] sm:text-xs font-medium text-zinc-500">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Clock3 size={13} strokeWidth={2} className="text-primary/60" />
            {module.duration || "0h"}
          </span>
          <span className="h-1 w-1 rounded-full bg-purple-300 shrink-0" />
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Users size={13} strokeWidth={2} className="text-primary/60" />
            {module.enrolled || 0}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-primary/80 transition-colors duration-200 group-hover:text-primary whitespace-nowrap">
          view course
        </span>
      </div>
    </article>
  );
};

export default CourseCard;
