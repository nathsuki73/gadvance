"use client";

import React from "react";

interface OnboardingActionsProps {
  onBack?: () => void;
  showBack?: boolean;
  backLabel?: string;
  nextLabel: string;
  loading?: boolean;
  loadingLabel?: string;
}

/**
 * Bottom action row (Back / Continue) shared by every onboarding step.
 * Step one has no Back button, so `showBack` collapses the layout to a
 * single full-width submit button.
 */
export function OnboardingActions({
  onBack,
  showBack = true,
  backLabel = "Back",
  nextLabel,
  loading = false,
  loadingLabel,
}: OnboardingActionsProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-1/3 border border-zinc-100 text-zinc-400 py-3.5 sm:py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-violet-50 hover:text-[#8b5cf6] transition-all disabled:opacity-50"
        >
          {backLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full ${
          showBack ? "sm:w-2/3" : ""
        } bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3.5 sm:py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70`}
      >
        {loading && loadingLabel ? loadingLabel : nextLabel}
      </button>
    </div>
  );
}
