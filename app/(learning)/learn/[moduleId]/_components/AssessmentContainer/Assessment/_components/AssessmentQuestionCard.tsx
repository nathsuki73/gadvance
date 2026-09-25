"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Question, AssessmentSettings, BloomLevel } from "../../types";

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

interface QuizQuestionCardProps {
  question: Question;
  index: number;
  selectedChoiceId?: string;
  submitted: boolean;
  settings: AssessmentSettings;
  showQuestionNumber?: boolean;
  isCorrectOverride?: boolean;
  isChecked?: boolean;
  onSelectChoice: (questionId: string, choiceId: string) => void;
}

export function QuizQuestionCard({
  question,
  index,
  selectedChoiceId,
  submitted,
  settings,
  showQuestionNumber = true,
  isCorrectOverride,
  isChecked = false,
  onSelectChoice,
}: QuizQuestionCardProps) {
  const isTestMode = settings.type === "test";

  const isCorrect =
    isCorrectOverride !== undefined
      ? isCorrectOverride
      : selectedChoiceId === question.correctChoiceId;

  const bloomInfo = question.bloomLevel
    ? BLOOM_BADGES[question.bloomLevel]
    : null;

  const canShowReview = settings.allowReview;
  const showReviewFeedback = submitted && canShowReview;
  const showImmediateFeedback = !isTestMode && settings.showFeedbackImmediately;

  const shouldDisplayFeedback =
    showReviewFeedback || (showImmediateFeedback && isChecked);
  const isLocked = submitted || (showImmediateFeedback && isChecked);

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          {showQuestionNumber && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8b5cf6]">
                Question {index + 1}
              </span>
            </div>
          )}
          <h3 className="text-base sm:text-lg font-semibold text-zinc-900 leading-relaxed">
            {question.text}
          </h3>
        </div>

        {bloomInfo && (
          <span
            className={`shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold ${bloomInfo.style}`}
          >
            {bloomInfo.label}
          </span>
        )}
      </div>

      {/* Choice Options (Box Layout) */}
      <div className="space-y-2.5">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const isChoiceCorrect =
            (question.correctChoiceId
              ? question.correctChoiceId === choice.id
              : false) ||
            Boolean(choice.isCorrect || (choice as any).is_correct);

          let containerStyle =
            "border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/50";

          if (isSelected) {
            containerStyle =
              "border-purple-300 bg-purple-50/50 text-purple-950 font-semibold shadow-xs";
          }

          if (shouldDisplayFeedback) {
            if (isChoiceCorrect) {
              containerStyle =
                "border-emerald-300 bg-emerald-50/60 text-emerald-950 font-semibold shadow-xs";
            } else if (isSelected && !isChoiceCorrect) {
              containerStyle =
                "border-rose-300 bg-rose-50/50 text-rose-950 font-medium";
            }
          }

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onSelectChoice(question.id, choice.id)}
              disabled={isLocked}
              className={`flex w-full items-center justify-between gap-3 p-3.5 text-left text-xs sm:text-sm rounded-xl border transition-all cursor-pointer disabled:cursor-default ${containerStyle}`}
            >
              <span className="whitespace-normal break-words text-left leading-normal pr-2 flex-1">
                {choice.text}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {shouldDisplayFeedback && isChoiceCorrect && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} /> Correct
                  </span>
                )}
                {shouldDisplayFeedback && isSelected && !isChoiceCorrect && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                    <XCircle size={12} /> Your Answer
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Immediate Remediation & Feedback */}
      {shouldDisplayFeedback && (
        <div className="space-y-2.5 pt-2 animate-in fade-in duration-300">
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              isCorrect ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 size={15} />
                <span>Correct Answer</span>
              </>
            ) : (
              <>
                <XCircle size={15} />
                <span>Incorrect Answer</span>
              </>
            )}
          </div>

          {question.explanation && (
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-500 pl-4 border-l-2 border-zinc-200">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
