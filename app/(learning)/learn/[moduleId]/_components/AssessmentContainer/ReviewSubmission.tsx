"use client";

import React from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { AssessmentSettings, QuestionData } from "./types";

interface ReviewSubmissionProps {
  questions: QuestionData[];
  answers: Record<string, string>;
  submitted: boolean;
  settings: AssessmentSettings;
  isPoll: boolean;
  isReviewActive: boolean;
  onToggleReview: (active: boolean) => void;
  onSelectChoice: (questionId: string, choiceId: string) => void;
}

export function ReviewSubmission({
  questions,
  answers,
  submitted,
  settings,
  isPoll,
  isReviewActive,
  onToggleReview,
  onSelectChoice,
}: ReviewSubmissionProps) {
  if (!settings.allowReview && !isPoll) return null;

  if (isReviewActive) {
    return (
      <div className="space-y-6 w-full animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => onToggleReview(false)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer mb-2"
        >
          <ArrowLeft size={15} />
          <span>Back to Results Summary</span>
        </button>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={qIndex}
              selectedChoiceId={answers[q.id]}
              submitted={submitted}
              isQuestionSubmitted={true}
              settings={settings}
              onSelectChoice={onSelectChoice}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start pt-2">
      <button
        type="button"
        onClick={() => onToggleReview(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer group"
      >
        <span>{isPoll ? "View Poll Results" : "Review Submission"}</span>
        <ChevronRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
}
