import React from "react";

interface StepHeaderProps {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
}

/**
 * "step 0X / 03" + title + subtitle block. Previously duplicated (with
 * slightly different classNames) across page one, contact-location, and
 * icon-bio — now a single source of truth.
 */
export function StepHeader({
  step,
  totalSteps = 3,
  title,
  subtitle,
}: StepHeaderProps) {
  const stepStr = String(step).padStart(2, "0");
  const totalStr = String(totalSteps).padStart(2, "0");

  return (
    <div className="mb-6 sm:mb-8">
      <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">
        step {stepStr} / {totalStr}
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2 tracking-tight">
        {title}
      </h1>
      <p className="text-zinc-400 text-xs sm:text-sm font-light mt-1">
        {subtitle}
      </p>
    </div>
  );
}
