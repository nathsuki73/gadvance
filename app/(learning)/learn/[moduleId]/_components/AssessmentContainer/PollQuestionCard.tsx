"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Check } from "lucide-react";
import { Question } from "./types";

interface PollQuestionCardProps {
  question: Question;
  index: number;
  selectedChoiceId?: string;
  isQuestionSubmitted: boolean;
  showQuestionNumber?: boolean;
  onSelectChoice: (questionId: string, choiceId: string) => void;
}

export function PollQuestionCard({
  question,
  index,
  selectedChoiceId,
  isQuestionSubmitted,
  showQuestionNumber = true,
  onSelectChoice,
}: PollQuestionCardProps) {
  const [animateBar, setAnimateBar] = useState(false);

  useEffect(() => {
    if (isQuestionSubmitted) {
      // Trigger bar animation or instant display when submitted
      const timer = requestAnimationFrame(() => {
        setAnimateBar(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setAnimateBar(false);
    }
  }, [isQuestionSubmitted]);

  const getBarWidth = (percent: number) => {
    // If already submitted on load, show full width instantly; otherwise animate
    return `${animateBar ? percent : 0}%`;
  };

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
      </div>

      {/* Choice Options */}
      <div className="space-y-2">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const votesCount = choice.votes ?? (isSelected ? 1 : 0);
          const percent = choice.percentage ?? 0;
          const barWidth = getBarWidth(percent);

          let textStyle = "text-zinc-700 hover:text-zinc-950";
          let radioCircleStyle =
            "border-zinc-300 bg-transparent text-transparent";

          if (isSelected) {
            textStyle = "text-purple-950 font-semibold";
            radioCircleStyle = "border-purple-600 bg-purple-600 text-white";
          }

          return (
            <div key={choice.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectChoice(question.id, choice.id)}
                disabled={isQuestionSubmitted}
                className={`relative overflow-hidden flex flex-1 items-center justify-between gap-3 py-2.5 px-2 text-left text-md transition-colors cursor-pointer disabled:cursor-default rounded-lg hover:bg-zinc-50 ${textStyle}`}
              >
                {isQuestionSubmitted && (
                  <div
                    className={`absolute inset-y-0 left-0 rounded-lg pointer-events-none opacity-25 transition-all duration-700 ease-out ${
                      isSelected ? "bg-purple-400" : "bg-zinc-200"
                    }`}
                    style={{ width: barWidth }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-3 pr-2 min-w-0 flex-1">
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${radioCircleStyle}`}
                  >
                    {isSelected && !isQuestionSubmitted && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                    {isQuestionSubmitted && isSelected && (
                      <Check size={10} strokeWidth={3} />
                    )}
                  </div>
                  <span className="whitespace-normal break-words text-left">
                    {choice.text}
                  </span>
                </div>

                <div className="relative z-10 flex items-center gap-2 shrink-0">
                  {isQuestionSubmitted && (
                    <span
                      className={`text-[11px] font-medium transition-opacity duration-300 ${
                        isSelected ? "text-[#8b5cf6]" : "text-zinc-400"
                      }`}
                    >
                      {votesCount} {votesCount === 1 ? "vote" : "votes"}
                    </span>
                  )}
                </div>
              </button>

              {isQuestionSubmitted && (
                <div
                  className={`w-12 shrink-0 text-right font-mono text-xs font-semibold ${
                    isSelected ? "text-[#8b5cf6]" : "text-zinc-400"
                  }`}
                >
                  {percent}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isQuestionSubmitted && (
        <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-[#8b5cf6]">
          <BarChart3 size={14} className="text-[#8b5cf6] shrink-0" />
          <span>Total votes calculated across all learner submissions.</span>
        </div>
      )}
    </div>
  );
}
