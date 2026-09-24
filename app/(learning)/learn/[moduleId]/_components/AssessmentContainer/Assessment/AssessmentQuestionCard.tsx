"use client";

import React from "react";
import { CheckCircle2, XCircle, Check } from "lucide-react";
import { Question, AssessmentSettings, BloomLevel } from "../types";

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
  const showImmediateFeedback =
    !isTestMode &&
    Boolean(selectedChoiceId) &&
    settings.showFeedbackImmediately;

  const shouldDisplayFeedback = showReviewFeedback || showImmediateFeedback;
  const isLocked =
    submitted || Boolean(shouldDisplayFeedback && selectedChoiceId);

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
          <h3 className="text-md font-semibold text-zinc-900 leading-relaxed">
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

      {/* Choice Options */}
      <div className="space-y-2">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const isChoiceCorrect =
            (question.correctChoiceId
              ? question.correctChoiceId === choice.id
              : false) ||
            Boolean(choice.isCorrect || (choice as any).is_correct);

          let textStyle = "text-zinc-700 hover:text-zinc-950";
          let radioCircleStyle =
            "border-zinc-300 bg-transparent text-transparent";

          if (isSelected) {
            textStyle = "text-purple-950 font-semibold";
            radioCircleStyle = "border-purple-600 bg-purple-600 text-white";
          }

          if (shouldDisplayFeedback) {
            if (isChoiceCorrect) {
              textStyle = "text-emerald-950 font-semibold";
              radioCircleStyle = "border-emerald-500 bg-emerald-500 text-white";
            } else if (isSelected && !isChoiceCorrect) {
              textStyle =
                "text-rose-950 font-medium line-through decoration-rose-400";
              radioCircleStyle = "border-rose-500 bg-rose-500 text-white";
            }
          }

          return (
            <div key={choice.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectChoice(question.id, choice.id)}
                disabled={isLocked}
                className={`relative overflow-hidden flex flex-1 items-center justify-between gap-3 py-2.5 px-2 text-left text-md transition-colors cursor-pointer disabled:cursor-default rounded-lg hover:bg-zinc-50 ${textStyle}`}
              >
                <div className="relative z-10 flex items-center gap-3 pr-2 min-w-0 flex-1">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${radioCircleStyle}`}
                  >
                    {isSelected && !shouldDisplayFeedback && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                    {shouldDisplayFeedback && isChoiceCorrect && (
                      <Check size={10} strokeWidth={3} />
                    )}
                    {shouldDisplayFeedback &&
                      isSelected &&
                      !isChoiceCorrect && <XCircle size={10} strokeWidth={3} />}
                  </div>
                  <span className="whitespace-normal break-words text-left">
                    {choice.text}
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2 shrink-0">
                  {shouldDisplayFeedback && isChoiceCorrect && (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  )}
                  {shouldDisplayFeedback && isSelected && !isChoiceCorrect && (
                    <XCircle size={16} className="text-rose-600" />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Immediate Remediation & Feedback */}
      {shouldDisplayFeedback && (
        <div className="space-y-2.5 pt-2">
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
            <p className="text-xs leading-relaxed text-zinc-500 pl-6 border-l-2 border-zinc-200">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
