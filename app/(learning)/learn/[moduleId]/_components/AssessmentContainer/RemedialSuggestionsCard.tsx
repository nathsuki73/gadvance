"use client";

import React from "react";
import { ExternalLink, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RemedialSuggestionItem {
  page_id: string;
  block_id: string;
  review_url?: string;
}

interface RemedialSuggestionsCardProps {
  suggestions: RemedialSuggestionItem[];
  moduleId: string;
  onRetry: () => void;
  onNext: () => void;
  hasAttemptsRemaining: boolean;
}

export function RemedialSuggestionsCard({
  suggestions,
  moduleId,
  onRetry,
  onNext,
  hasAttemptsRemaining,
}: RemedialSuggestionsCardProps) {
  return (
    <div className="w-full max-w-md mx-auto text-left space-y-4">
      {/* Vertical List Stack */}
      <div className="space-y-2.5">
        {suggestions.slice(0, 3).map((item, idx) => {
          const reviewUrl = `/learn/${moduleId}?item=${item.page_id}#${item.block_id}`;
          return (
            <Link
              key={idx}
              href={reviewUrl}
              className="group flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-xs font-semibold text-zinc-800 transition-all hover:border-[#8b5cf6] hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-[11px] font-bold text-[#8b5cf6]">
                  {idx + 1}
                </span>
                <span className="text-zinc-800 group-hover:text-[#8b5cf6] transition-colors">
                  Concept Review Module #{idx + 1}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3.5 py-2 text-xs font-bold text-[#8b5cf6] group-hover:bg-[#8b5cf6] group-hover:text-white transition-all">
                <span>Review Section</span>
                <ExternalLink size={13} />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Action Buttons (Try Again / Continue) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {hasAttemptsRemaining && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-purple-100 hover:bg-purple-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#8b5cf6] transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#8b5cf6]/20 transition-all hover:bg-[#7c3aed] cursor-pointer"
        >
          <span>Continue</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
