"use client";

import React from "react";
import { CheckCircle2, XCircle, Check } from "lucide-react";
import { Question, BloomLevel } from "../../types";

const BLOOM_BADGES: Record<BloomLevel, { label: string; style: string }> = {
  1: {
    label: "L1: Remember",
    style: "bg-blue-50 text-blue-700 border-blue-200/60",
  },
  2: {
    label: "L2: Understand",
    style: "bg-sky-50 text-sky-700 border-sky-200/60",
  },
  3: {
    label: "L3: Apply",
    style: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  },
  4: {
    label: "L4: Analyze",
    style: "bg-amber-50 text-amber-700 border-amber-200/60",
  },
  5: {
    label: "L5: Evaluate",
    style: "bg-purple-50 text-purple-700 border-purple-200/60",
  },
  6: {
    label: "L6: Create",
    style: "bg-rose-50 text-rose-700 border-rose-200/60",
  },
};

interface ReviewQuestionCardProps {
  question: Question;
  index: number;
  selectedChoiceId?: string;
}

export function ReviewQuestionCard({
  question,
  index,
  selectedChoiceId,
}: ReviewQuestionCardProps) {
  // 🎯 Robust check: A choice is correct if its ID matches question.correctChoiceId,
  // or if its internal flag is true
  const isChoiceCorrectFunc = (choice: any) =>
    choice.id === question.correctChoiceId ||
    Boolean(choice.isCorrect || choice.is_correct);

  const isCorrect = question.choices.some(
    (c) => c.id === selectedChoiceId && isChoiceCorrectFunc(c),
  );

  const bloomInfo = question.bloomLevel
    ? BLOOM_BADGES[question.bloomLevel]
    : null;

  return (
    <div
      className={`rounded-2xl border p-6 md:p-8 bg-white transition-all shadow-xs space-y-5 ${
        isCorrect
          ? "border-emerald-200/80 bg-emerald-50/10"
          : "border-rose-200/80 bg-rose-50/10"
      }`}
    >
      {/* Header with Status & Bloom Badge */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-3">
          {bloomInfo && (
            <span
              className={`rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${bloomInfo.style}`}
            >
              {bloomInfo.label}
            </span>
          )}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isCorrect
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-rose-100 text-rose-800 border border-rose-200"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 size={14} /> Correct
              </>
            ) : (
              <>
                <XCircle size={14} /> Incorrect
              </>
            )}
          </div>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-md font-semibold text-zinc-900 leading-relaxed">
        {question.text}
      </h3>

      {/* Choice Options List */}
      <div className="space-y-2.5">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const isChoiceCorrect = isChoiceCorrectFunc(choice);

          let containerStyle =
            "border-zinc-200/80 bg-white text-zinc-700 opacity-80";
          let circleStyle = "border-zinc-300 bg-transparent text-transparent";

          if (isChoiceCorrect) {
            containerStyle =
              "border-emerald-300 bg-emerald-50/60 text-emerald-950 font-semibold shadow-xs opacity-100";
            circleStyle = "border-emerald-600 bg-emerald-600 text-white";
          } else if (isSelected && !isChoiceCorrect) {
            containerStyle =
              "border-rose-300 bg-rose-50/50 text-rose-950 font-medium opacity-100";
            circleStyle = "border-rose-600 bg-rose-600 text-white";
          }

          return (
            <div
              key={choice.id}
              className={`flex items-center justify-between gap-3 p-3.5 text-left text-xs md:text-sm rounded-xl border transition-all ${containerStyle}`}
            >
              <div className="flex items-center gap-3 pr-2 min-w-0 flex-1">
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${circleStyle}`}
                >
                  {isChoiceCorrect && <Check size={10} strokeWidth={3} />}
                  {isSelected && !isChoiceCorrect && (
                    <XCircle size={10} strokeWidth={3} />
                  )}
                </div>
                <span className="whitespace-normal break-words text-left">
                  {choice.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isChoiceCorrect && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Correct Answer
                  </span>
                )}
                {isSelected && !isChoiceCorrect && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                    Your Answer
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Footer */}
      {question.explanation && (
        <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3.5 mt-4">
          <p className="text-xs leading-relaxed text-zinc-600">
            <strong className="text-zinc-900 font-semibold">
              Explanation:
            </strong>{" "}
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
