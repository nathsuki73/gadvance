"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, Check } from "lucide-react";
import { Question } from "../types";

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
      const timer = requestAnimationFrame(() => {
        setAnimateBar(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setAnimateBar(false);
    }
  }, [isQuestionSubmitted]);

  const getBarWidth = (percent: number) => {
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

      {/* Choice Options Card Container List */}
      <div className="space-y-2.5">
        {question.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const votesCount = choice.votes ?? (isSelected ? 1 : 0);
          const percent = choice.percentage ?? 0;
          const barWidth = getBarWidth(percent);

          let radioCircleStyle =
            "border-zinc-300 bg-transparent text-transparent";
          if (isSelected) {
            radioCircleStyle = "border-[#8b5cf6] bg-[#8b5cf6] text-white";
          }

          return (
            <div
              key={choice.id}
              className={`relative overflow-hidden rounded-xl border transition-all ${
                isSelected
                  ? "border-[#8b5cf6] bg-purple-50/20 shadow-2xs"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              {/* Background Percentage Progress Fill */}
              {isQuestionSubmitted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out pointer-events-none ${
                    isSelected ? "bg-purple-200/50" : "bg-zinc-100"
                  }`}
                  style={{ width: barWidth }}
                />
              )}

              <button
                type="button"
                onClick={() => onSelectChoice(question.id, choice.id)}
                disabled={isQuestionSubmitted}
                className="relative z-10 w-full flex items-center justify-between gap-4 py-3.5 px-4 text-left cursor-pointer disabled:cursor-default"
              >
                {/* Option Text & Radio Indicator */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
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
                  <span
                    className={`text-sm sm:text-md whitespace-normal break-words ${
                      isSelected
                        ? "font-semibold text-purple-950"
                        : "text-zinc-700"
                    }`}
                  >
                    {choice.text}
                  </span>
                </div>

                {/* Votes and Percentage Details */}
                {isQuestionSubmitted && (
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <span className="text-xs font-medium text-zinc-500">
                      {votesCount} {votesCount === 1 ? "vote" : "votes"}
                    </span>
                    <span className="font-mono text-xs font-bold text-zinc-900 w-10">
                      {percent}%
                    </span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
