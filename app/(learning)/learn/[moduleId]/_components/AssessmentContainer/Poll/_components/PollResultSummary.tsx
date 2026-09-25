"use client";

import React from "react";
import { CheckCircle2, ChevronRight, BarChart3 } from "lucide-react";

interface PollResultsSummaryProps {
  totalQuestions: number;
  onRetake: () => void;
  onContinue: () => void;
  isLastItem?: boolean;
}

export function PollResultsSummary({
  totalQuestions,
  onRetake,
  onContinue,
  isLastItem = false,
}: PollResultsSummaryProps) {
  return (
    <div className="overflow-hidden p-2 space-y-6 flex flex-col items-center text-center w-full max-w-md mx-auto">
      <div className="w-full rounded-2xl border border-purple-200/85 bg-purple-50/50 p-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#8b5cf6]">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="text-sm font-bold text-[#8b5cf6]">
          Thank you for participating!
        </h3>
        <p className="text-xs text-[#8b5cf6] max-w-md mx-auto leading-relaxed">
          Your votes have been recorded and factored into the live class
          metrics. You have completed all {totalQuestions} questions.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full pt-2 shrink-0">
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-purple-100 hover:bg-purple-200 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#8b5cf6] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <BarChart3 size={16} />
          <span>View Poll Responses</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#8b5cf6]/20 transition-all cursor-pointer hover:bg-[#7c3aed] active:scale-[0.98]"
        >
          <span>{isLastItem ? "Complete Module" : "Continue"}</span>
          {isLastItem ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}
