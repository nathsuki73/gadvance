"use client";

import React, { useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReviewQuestionCard } from "./ReviewQuestionCard";
import { AssessmentSettings, Question } from "../../types";

interface ReviewSubmissionProps {
  questions: Question[];
  answers: Record<string, string>;
  submitted: boolean;
  settings: AssessmentSettings;
  isReviewActive: boolean;
  onToggleReview: (active: boolean) => void;
  onSelectChoice: (questionId: string, choiceId: string) => void;
}

export function ReviewSubmission({
  questions,
  answers,
  submitted,
  settings,
  isReviewActive,
  onToggleReview,
}: ReviewSubmissionProps) {
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isReviewActive) {
        event.preventDefault();
        onToggleReview(false);
      }
    };

    if (isReviewActive) {
      window.history.pushState({ reviewOpen: true }, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isReviewActive, onToggleReview]);

  if (!settings.allowReview) return null;

  if (isReviewActive) {
    return (
      <div className="space-y-6 w-full animate-in fade-in duration-200">
        {/* Back button aligned to the right */}
        <div className="flex justify-end w-full mb-2">
          <button
            type="button"
            onClick={() => {
              onToggleReview(false);
              if (window.history.state?.reviewOpen) {
                window.history.back();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
          >
            <span>Back to Results Summary</span>
            <ChevronUp size={15} className="rotate-180" />
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <ReviewQuestionCard
              key={q.id}
              question={q}
              index={qIndex}
              selectedChoiceId={answers[q.id]}
            />
          ))}
        </div>

        {/* Scroll to Top Button at the end */}
        <div className="flex justify-center pt-8 pb-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <ChevronUp size={15} />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-end pt-2">
      <button
        type="button"
        onClick={() => onToggleReview(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer group"
      >
        <span>Review Submission</span>
        <ChevronDown
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
}
