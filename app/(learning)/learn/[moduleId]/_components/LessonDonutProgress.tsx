"use client";

import React from "react";

type LessonDonutProgressProps = {
  totalSteps: number;
  completedSteps: number;
  size?: number;
  strokeWidth?: number;
};

export const LessonDonutProgress = ({
  totalSteps,
  completedSteps,
  size = 20,
  strokeWidth = 2.5,
}: LessonDonutProgressProps) => {
  // Guard against division by zero if a lesson is empty
  if (totalSteps === 0)
    return <div className="w-5 h-5 rounded-full border border-zinc-200" />;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Constrain percentage between 0 and 100
  const percentage = Math.min(
    100,
    Math.max(0, (completedSteps / totalSteps) * 100),
  );
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isComplete = percentage === 100;
  const activeRingClass = isComplete ? "text-emerald-500" : "text-[#8b5cf6]";
  const checkColorClass = isComplete ? "text-emerald-600" : "text-[#8b5cf6]";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="rotate-[-90deg]" width={size} height={size}>
        {/* Background Track Ring */}
        <circle
          className="text-zinc-200"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Active Progress Ring */}
        <circle
          className={`${activeRingClass} transition-all duration-500 ease-out`}
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Absolute Micro Inner Text Indicator when completed */}
      {percentage === 100 && (
        <span className={`absolute text-[8px] font-bold ${checkColorClass}`}>✓</span>
      )}
    </div>
  );
};
