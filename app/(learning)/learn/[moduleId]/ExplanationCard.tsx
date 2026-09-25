"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  X,
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
    label: "Quick check",
    prompt: "",
  },
];

type ExplanationPage =
  | { kind: "base"; label: string }
  | { kind: "followup"; label: string; text: string }
  | {
      kind: "quiz";
      label: string;
      quiz: QuizQuestion | null;
      selectedChoiceId: string | null; // 👈 Lifted state into page definition
    };

interface ExplanationCardProps {
  paragraphId: string;
  remedialContent: RemedialContent;
  masteryProbability: number;
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
  onRequestFollowUp,
  onRequestQuiz,
  onGoToAssessment,
}: ExplanationCardProps) {
  const [pages, setPages] = useState<ExplanationPage[]>([
    { kind: "base", label: "Concept Review" },
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
        {
          kind: "quiz",
          label: "Quick Check",
          quiz: null,
          selectedChoiceId: null,
        },
      ]);
      setPageIndex(1);
      try {
        const quiz = await onRequestQuiz(paragraphId);
        setPages((prev) => {
          const next = [...prev];
          next[1] = {
            kind: "quiz",
            label: "Quick Check",
            quiz,
            selectedChoiceId: null,
          };
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

  const handleSelectQuizAnswer = (choiceId: string) => {
    setPages((prev) =>
      prev.map((page, idx) =>
        idx === pageIndex && page.kind === "quiz"
          ? { ...page, selectedChoiceId: choiceId }
          : page,
      ),
    );
  };

  return (
    <div className="w-full border-l-2 sm:border-l-[3px] border-[#8b5cf6] pl-4 sm:pl-5 py-2 my-5 space-y-3.5 bg-transparent font-sans">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8b5cf6]">
            {currentPage.label}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="rounded-lg border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-600">
            Mastery: {masteryPercent}%
          </span>
        </div>

        {/* Pager */}
        {pages.length > 1 && (
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-0.5">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:text-zinc-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous step"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="w-7 text-center text-xs font-mono font-bold tabular-nums text-zinc-600">
              {pageIndex + 1}/{pages.length}
            </span>
            <button
              type="button"
              disabled={!canGoForward}
              onClick={() =>
                setPageIndex((i) => Math.min(pages.length - 1, i + 1))
              }
              className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 hover:bg-white hover:text-zinc-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next step"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      {currentPage.kind === "base" && (
        <div className="space-y-2.5">
          <p className="text-sm sm:text-base font-bold text-zinc-900 leading-snug">
            {remedialContent.summary}
          </p>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {remedialContent.explanation}
          </p>

          <div className="border-l-2 border-purple-200 bg-purple-50/40 p-3 text-xs sm:text-sm text-purple-900 leading-relaxed">
            <span className="font-semibold text-[#8b5cf6]">
              Real-world analogy:{" "}
            </span>
            {lowerFirst(remedialContent.analogy)}
          </div>
        </div>
      )}

      {currentPage.kind === "followup" && (
        <div className="min-h-[50px] text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {currentPage.text || (
            <div className="flex items-center gap-2 py-3 text-xs font-medium text-zinc-400">
              <Loader2 className="animate-spin text-[#8b5cf6]" size={15} />
              <span>Generating concept explanation…</span>
            </div>
          )}
        </div>
      )}

      {currentPage.kind === "quiz" && (
        <MiniQuiz
          quiz={currentPage.quiz}
          selectedId={currentPage.selectedChoiceId}
          onSelect={handleSelectQuizAnswer}
        />
      )}

      {/* Right-Aligned Button Group */}
      <div className="flex items-center justify-end gap-2 flex-wrap pt-2.5 border-t border-zinc-100">
        {!hasUsedFollowUp ? (
          <>
            {FOLLOW_UP_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleChipClick(option)}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:border-[#8b5cf6] hover:text-[#8b5cf6] active:scale-[0.98] transition-all cursor-pointer"
              >
                {option.label}
              </button>
            ))}

            {onGoToAssessment && (
              <button
                type="button"
                onClick={onGoToAssessment}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white hover:bg-[#7c3aed] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Back to assessment</span>
                <ArrowRight size={13} />
              </button>
            )}
          </>
        ) : (
          <>
            {pageIndex !== 0 && (
              <button
                type="button"
                onClick={() => setPageIndex(0)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Original note</span>
              </button>
            )}

            {onGoToAssessment && (
              <button
                type="button"
                onClick={onGoToAssessment}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white hover:bg-[#7c3aed] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Back to assessment</span>
                <ArrowRight size={13} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MiniQuiz({
  quiz,
  selectedId,
  onSelect,
}: {
  quiz: QuizQuestion | null;
  selectedId: string | null;
  onSelect: (choiceId: string) => void;
}) {
  if (!quiz) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs font-medium text-zinc-400">
        <Loader2 className="animate-spin text-[#8b5cf6]" size={15} />
        <span>Preparing quick check…</span>
      </div>
    );
  }

  const revealed = selectedId !== null;

  return (
    <div className="space-y-2.5 py-1">
      <p className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
        {quiz.question}
      </p>

      <div className="space-y-1.5">
        {quiz.choices.map((choice) => {
          const isSelected = selectedId === choice.id;
          const isCorrect = choice.id === quiz.correctChoiceId;

          let style =
            "border-zinc-200 bg-white hover:border-[#8b5cf6] hover:bg-purple-50/20 text-zinc-700";

          if (revealed && isSelected && isCorrect)
            style =
              "border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold";
          if (revealed && isSelected && !isCorrect)
            style = "border-rose-300 bg-rose-50 text-rose-800 font-semibold";
          if (revealed && !isSelected && isCorrect)
            style =
              "border-emerald-300 bg-emerald-50/60 text-emerald-800 font-semibold";

          return (
            <button
              key={choice.id}
              type="button"
              disabled={revealed}
              onClick={() => onSelect(choice.id)}
              className={`w-full flex items-center justify-between gap-3 rounded-xl border p-3 text-xs sm:text-sm text-left transition-all active:scale-[0.99] cursor-pointer disabled:cursor-default ${style}`}
            >
              <span>{choice.text}</span>
              {revealed && isSelected && isCorrect && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              {revealed && isSelected && !isCorrect && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                  <X size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
