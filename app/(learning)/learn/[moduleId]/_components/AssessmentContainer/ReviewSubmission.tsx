"use client";

import React, { useEffect } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { AssessmentSettings, Question } from "./types";

interface ReviewSubmissionProps {
  questions: Question[];
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
  // 📱 Handle Mobile Browser Back Button behavior
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isReviewActive) {
        // If the review list is open, close it and stay on the results summary page
        event.preventDefault();
        onToggleReview(false);
      }
    };

    if (isReviewActive) {
      // Push a dummy history state when review opens so the back button catches it
      window.history.pushState({ reviewOpen: true }, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isReviewActive, onToggleReview]);

  if (!settings.allowReview && !isPoll) return null;

  if (isReviewActive) {
    return (
      <div className="space-y-6 w-full animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => {
            // Standard click behavior: go back and pop history if needed
            onToggleReview(false);
            if (window.history.state?.reviewOpen) {
              window.history.back();
            }
          }}
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
    <div className="w-full flex justify-end pt-2">
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
