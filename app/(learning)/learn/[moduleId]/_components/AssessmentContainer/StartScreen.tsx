"use client";

import React from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { AssessmentViewData } from "./types"; // Or a shared type interface

interface StartScreenProps {
  title?: string;
  instructions?: string;
  totalItems: number;
  buttonText?: string;
  onStart: () => void;
}

export function StartScreen({
  title,
  instructions,
  totalItems,
  buttonText = "Start Assessment",
  onStart,
}: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center">
      {/* Item Count Badge */}
      <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50/60 px-3.5 py-1 text-xs font-semibold text-[#8b5cf6]">
        <HelpCircle size={14} />
        <span>
          {totalItems} {totalItems === 1 ? "Question" : "Questions"}
        </span>
      </div>

      {/* Title */}
      <h1 className="max-w-xl text-2xl font-extrabold tracking-tight text-zinc-900 leading-snug sm:text-3xl">
        {title || "Untitled Content"}
      </h1>

      {/* Instructions */}
      {instructions && (
        <p className="mt-4 max-w-lg text-xs font-normal leading-relaxed text-zinc-500 sm:text-sm">
          {instructions}
        </p>
      )}

      {/* Start Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className="group relative inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-8 py-3 text-xs font-semibold text-white shadow-md shadow-[#8b5cf6]/20 transition-all duration-200 cursor-pointer hover:bg-[#7c3aed] active:scale-[0.98] sm:text-sm"
        >
          <span>{buttonText}</span>
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
}
