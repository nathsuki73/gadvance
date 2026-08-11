"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  BarChart3,
  BookOpen,
  Check,
} from "lucide-react";
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

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedChoiceId?: string;
  submitted: boolean;
  settings: AssessmentSettings;
  onSelectChoice: (questionId: string, choiceId: string) => void;
}

export function QuestionCard({
  question,
  index,
  selectedChoiceId,
  submitted,
  settings,
  onSelectChoice,
}: QuestionCardProps) {
  const isPoll = settings.type === "poll" || question.isPoll;
  const isTestMode = settings.type === "test";

  const isCorrect = selectedChoiceId === question.correctChoiceId;
  const bloomInfo = question.bloomLevel
    ? BLOOM_BADGES[question.bloomLevel]
    : null;

  const showPollDistribution = isPoll && submitted && Boolean(selectedChoiceId);
  const canShowReview = settings.allowReview;

  const showFeedback =
    canShowReview &&
    !isPoll &&
    !isTestMode &&
    Boolean(selectedChoiceId) &&
    (submitted || settings.showFeedbackImmediately);

  const showTestFeedback = canShowReview && isTestMode && submitted;

  // 🔒 Lock choices if submitted OR if immediate feedback is being shown for this question
  const isLocked = submitted || Boolean(showFeedback && selectedChoiceId);

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-5">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Question {index + 1}
            </span>
            {isPoll && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                Opinion Poll
              </span>
            )}
            {isTestMode && (
              <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                Strict Test
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 leading-relaxed">
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
          const isChoiceCorrect = question.correctChoiceId === choice.id;

          let containerStyle =
            "border-zinc-200 bg-white text-zinc-700 hover:border-purple-300 hover:bg-purple-50/30";
          let radioCircleStyle = "border-zinc-300 bg-white";

          if (isSelected) {
            containerStyle =
              "border-purple-600 bg-purple-50/50 text-purple-950 font-medium shadow-2xs";
            radioCircleStyle = "border-purple-600 bg-purple-600 text-white";
          }

          if ((showFeedback || showTestFeedback) && !isPoll) {
            if (isChoiceCorrect) {
              containerStyle =
                "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium";
              radioCircleStyle = "border-emerald-500 bg-emerald-500 text-white";
            } else if (isSelected && !isChoiceCorrect) {
              containerStyle =
                "border-rose-500 bg-rose-50/50 text-rose-950 font-medium";
              radioCircleStyle = "border-rose-500 bg-rose-500 text-white";
            }
          }

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onSelectChoice(question.id, choice.id)}
              disabled={isLocked} // 👈 Updated: prevents changing answer once feedback is displayed
              className={`relative flex w-full flex-col gap-2 rounded-xl border p-3.5 text-left text-xs transition-all cursor-pointer disabled:cursor-not-allowed min-h-[48px] ${containerStyle}`}
            >
              <div className="z-10 flex w-full items-center justify-between">
                <div className="flex items-center gap-3 pr-2 min-w-0">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${radioCircleStyle}`}
                  >
                    {isSelected && !(showFeedback || showTestFeedback) && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                    {(showFeedback || showTestFeedback) && isChoiceCorrect && (
                      <Check size={10} strokeWidth={3} />
                    )}
                    {(showFeedback || showTestFeedback) &&
                      isSelected &&
                      !isChoiceCorrect && <XCircle size={10} strokeWidth={3} />}
                  </div>
                  <span className="truncate">{choice.text}</span>
                </div>

                {showPollDistribution && (
                  <span className="ml-2 text-xs font-bold text-amber-700 shrink-0">
                    {choice.percentage}%
                  </span>
                )}

                {(showFeedback || showTestFeedback) && isChoiceCorrect && (
                  <CheckCircle2
                    size={16}
                    className="ml-2 text-emerald-600 shrink-0"
                  />
                )}
                {(showFeedback || showTestFeedback) &&
                  isSelected &&
                  !isChoiceCorrect && (
                    <XCircle
                      size={16}
                      className="ml-2 text-rose-600 shrink-0"
                    />
                  )}
              </div>

              {showPollDistribution && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500 ease-out"
                    style={{ width: `${choice.percentage}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Immediate Remediation & Feedback */}
      {(showFeedback || showTestFeedback) && !isPoll && (
        <div className="space-y-2.5 border-t border-zinc-200/60 pt-3">
          <div
            className={`flex items-center gap-1.5 text-xs font-bold ${
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
            <p className="rounded-xl border border-zinc-200/60 bg-white p-3 text-xs leading-relaxed text-zinc-600">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}

          {settings.showRemediation && !isCorrect && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 text-xs text-amber-900">
              <BookOpen size={16} className="mt-0.5 text-amber-700 shrink-0" />
              <div className="space-y-0.5">
                <span className="font-bold">Remediation Guide</span>
                <p className="leading-relaxed text-amber-800/90">
                  Review core concepts linked to Bloom Level{" "}
                  {question.bloomLevel || 1}.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {showPollDistribution && (
        <div className="flex items-center gap-2 border-t border-zinc-200/60 pt-2 text-[11px] font-medium text-amber-800">
          <BarChart3 size={14} className="text-amber-600 shrink-0" />
          <span>
            Opinion breakdown calculated across all learner submissions.
          </span>
        </div>
      )}
    </div>
  );
}
