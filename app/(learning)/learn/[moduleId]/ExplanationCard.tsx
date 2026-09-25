"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { RemedialContent, QuizQuestion } from "../../aiRemedialService";

export type FollowUpId = "simplify" | "tagalog" | "quiz";

export interface FollowUpOption {
  id: FollowUpId;
  label: string;
  prompt: string;
}

const FOLLOW_UP_OPTIONS: FollowUpOption[] = [
  {
    id: "simplify",
    label: "Simplify this",
    prompt:
      "Explain this concept in plain, simple terms using an everyday student context in 2 concise sentences.",
  },
  {
    id: "tagalog",
    label: "Explain in Tagalog",
    prompt:
      "Ipaliwanag ang konseptong ito gamit ang natural, diretso, at madaling maintindihang Tagalog o Taglish para sa mga mag-aaral sa loob ng dalawa hanggang tatlong pangungusap.",
  },
  {
    id: "quiz",
    label: "Test my understanding",
    prompt: "",
  },
];

type ExplanationPage =
  | { kind: "base"; label: string }
  | { kind: "followup"; label: string; text: string }
  | { kind: "quiz"; label: string; quiz: QuizQuestion | null };

export interface NoteVariant {
  accent: string;
  tag: string;
  mark: string;
}

interface ExplanationCardProps {
  paragraphId: string;
  remedialContent: RemedialContent;
  masteryProbability: number;
  variant: NoteVariant;
  onRequestFollowUp: (
    paragraphId: string,
    prompt: string,
    onChunk: (textSoFar: string) => void,
  ) => Promise<string>;
  onRequestQuiz: (paragraphId: string) => Promise<QuizQuestion>;
  onGoToAssessment?: () => void;
}

function lowerFirst(text: string) {
  if (!text) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function ExplanationCard({
  paragraphId,
  remedialContent,
  masteryProbability,
  variant,
  onRequestFollowUp,
  onRequestQuiz,
  onGoToAssessment,
}: ExplanationCardProps) {
  const [pages, setPages] = useState<ExplanationPage[]>([
    { kind: "base", label: "Concept Refresher" },
  ]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasUsedFollowUp, setHasUsedFollowUp] = useState(false);
  const [loadingOptionId, setLoadingOptionId] = useState<FollowUpId | null>(
    null,
  );

  const currentPage = pages[pageIndex];
  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < pages.length - 1;
  const masteryPercent = Math.round(masteryProbability * 100);

  const handleChipClick = async (option: FollowUpOption) => {
    if (hasUsedFollowUp || loadingOptionId) return;
    setLoadingOptionId(option.id);
    setHasUsedFollowUp(true);

    if (option.id === "quiz") {
      setPages((prev) => [
        ...prev,
        { kind: "quiz", label: "Quick Check", quiz: null },
      ]);
      setPageIndex(1);
      try {
        const quiz = await onRequestQuiz(paragraphId);
        setPages((prev) => {
          const next = [...prev];
          next[1] = { kind: "quiz", label: "Quick Check", quiz };
          return next;
        });
      } finally {
        setLoadingOptionId(null);
      }
      return;
    }

    setPages((prev) => [
      ...prev,
      { kind: "followup", label: option.label, text: "" },
    ]);
    setPageIndex(1);

    try {
      await onRequestFollowUp(paragraphId, option.prompt, (textSoFar) => {
        setPages((prev) => {
          const next = [...prev];
          next[1] = { kind: "followup", label: option.label, text: textSoFar };
          return next;
        });
      });
    } finally {
      setLoadingOptionId(null);
    }
  };

  return (
    <div
      className={`w-full rounded-2xl border-l-4 ${variant.accent} bg-zinc-50/80 p-4 sm:p-5 shadow-xs transition-all space-y-3`}
    >
      {/* Header & Pager */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${variant.tag}`}
          >
            {currentPage.label}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            Est. Mastery: {masteryPercent}%
          </span>
        </div>

        {pages.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              className="h-6 w-6 flex items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] font-bold text-zinc-500 tabular-nums w-7 text-center">
              {pageIndex + 1}/{pages.length}
            </span>
            <button
              type="button"
              disabled={!canGoForward}
              onClick={() =>
                setPageIndex((i) => Math.min(pages.length - 1, i + 1))
              }
              className="h-6 w-6 flex items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Page Content */}
      {currentPage.kind === "base" && (
        <div className="space-y-2.5">
          <p className="text-sm sm:text-[15px] font-semibold text-zinc-900 leading-snug">
            {remedialContent.summary}
          </p>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {remedialContent.explanation}
          </p>
          <p
            className={`text-xs italic ${variant.mark} leading-relaxed font-medium`}
          >
            💡 Analogy: {lowerFirst(remedialContent.analogy)}
          </p>
        </div>
      )}

      {currentPage.kind === "followup" && (
        <div className="min-h-[50px] text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {currentPage.text || (
            <span className="inline-flex items-center gap-2 text-zinc-400 py-1">
              <Loader2 className="animate-spin text-[#8b5cf6]" size={14} />
              Generating tailored explanation…
            </span>
          )}
        </div>
      )}

      {currentPage.kind === "quiz" && <MiniQuiz quiz={currentPage.quiz} />}

      {/* Suggestion Chips & Navigation Button */}
      {!hasUsedFollowUp ? (
        <div className="pt-2 border-t border-zinc-200/50">
          <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Ask AI Follow-Up (Pick One)
          </span>
          <div className="flex flex-wrap gap-2">
            {FOLLOW_UP_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleChipClick(option)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-[11px] font-semibold text-zinc-700 hover:border-[#8b5cf6] hover:text-[#8b5cf6] hover:shadow-xs transition-all cursor-pointer"
              >
                <Sparkles size={11} className="text-[#8b5cf6]" />
                {option.label}
              </button>
            ))}

            {/* Same suggestion button look for returning back to the assessment */}
            {onGoToAssessment && (
              <button
                type="button"
                onClick={onGoToAssessment}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#8b5cf6]/30 bg-purple-50 text-[11px] font-bold text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white hover:border-[#8b5cf6] hover:shadow-xs transition-all cursor-pointer"
              >
                <ArrowRight size={12} />
                Back to assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 size={14} />
              Refresher active
            </span>
            {pageIndex !== 0 && (
              <button
                type="button"
                onClick={() => setPageIndex(0)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
                Original note
              </button>
            )}
          </div>

          {onGoToAssessment && (
            <button
              type="button"
              onClick={onGoToAssessment}
              className="inline-flex items-center gap-1 rounded-lg bg-[#8b5cf6] px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#7c3aed] active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <span>Back to assessment</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MiniQuiz({ quiz }: { quiz: QuizQuestion | null }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!quiz) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400 py-3">
        <Loader2 className="animate-spin text-[#8b5cf6]" size={14} />
        Preparing a 1-question check…
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
        {quiz.question}
      </p>
      <div className="space-y-1.5">
        {quiz.choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          const isCorrect = choice.id === quiz.correctChoiceId;
          const revealed = selectedId !== null;

          let style =
            "border-zinc-200 bg-white hover:border-[#8b5cf6]/60 text-zinc-700";
          if (revealed && isSelected && isCorrect)
            style = "border-emerald-300 bg-emerald-50 text-emerald-800";
          if (revealed && isSelected && !isCorrect)
            style = "border-rose-300 bg-rose-50 text-rose-800";
          if (revealed && !isSelected && isCorrect)
            style = "border-emerald-200 bg-emerald-50/50 text-emerald-700";

          return (
            <button
              key={choice.id}
              type="button"
              disabled={revealed}
              onClick={() => setSelectedId(choice.id)}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-medium text-left transition-all cursor-pointer disabled:cursor-default ${style}`}
            >
              <span>{choice.text}</span>
              {revealed && isSelected && isCorrect && (
                <Check size={14} className="text-emerald-600 shrink-0" />
              )}
              {revealed && isSelected && !isCorrect && (
                <X size={14} className="text-rose-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
