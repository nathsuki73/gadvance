"use client";

import React, { useState } from "react";
import { PollViewData, submitPollVote } from "./pollService";
import { PollQuestionCard } from "./PollQuestionCard";
import { PollResultsSummary } from "./_components/PollResultSummary";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

interface PollViewProps {
  pollData: PollViewData;
  sectionItemId?: string;
  moduleId?: string;
  isLastItem?: boolean;
  onComplete?: () => void;
  onNext?: () => void;
  onExit?: () => void;
}

export default function PollView({
  pollData,
  sectionItemId,
  moduleId,
  isLastItem = false,
  onComplete,
  onNext,
  onExit,
}: PollViewProps) {
  const [userVotes, setUserVotes] = useState<Record<string, string>>(
    pollData.user_voted_map || {},
  );
  const [questions, setQuestions] = useState(pollData.questions || []);
  const [currentIndex, setCurrentIndex] = useState<number>(
    pollData.current_index || 0,
  );

  const [selectedChoiceId, setSelectedChoiceId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const safeQuestionIndex = Math.min(
    Math.max(0, currentIndex),
    Math.max(0, totalQuestions - 1),
  );
  const currentQuestion = questions[safeQuestionIndex];

  const isFirstQuestion = safeQuestionIndex === 0;
  const isLastQuestion = safeQuestionIndex === totalQuestions - 1;

  const hasVotedCurrent = Boolean(userVotes[currentQuestion?.id]);
  const activeSelection = hasVotedCurrent
    ? userVotes[currentQuestion.id]
    : selectedChoiceId;

  const handleSelectOption = (questionId: string, choiceId: string) => {
    if (hasVotedCurrent) return;
    setSelectedChoiceId(choiceId);
  };

  const handleSubmitVote = async () => {
    if (!sectionItemId || !currentQuestion || !activeSelection) return;
    setIsSubmitting(true);

    const res = await submitPollVote(
      pollData.id,
      sectionItemId,
      currentQuestion.id,
      activeSelection,
      moduleId,
    );

    if (res.success && res.poll_distributions) {
      setUserVotes((prev) => ({
        ...prev,
        [currentQuestion.id]: activeSelection,
      }));

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => {
          if (q.id === currentQuestion.id) {
            return {
              ...q,
              choices: q.choices.map((choice) => {
                const dist = res.poll_distributions?.[choice.id];
                return {
                  ...choice,
                  votes: dist ? dist.votes : choice.votes,
                  percentage: dist ? dist.percentage : choice.percentage,
                };
              }),
            };
          }
          return q;
        }),
      );
      setSelectedChoiceId("");
    } else {
      alert(res.error || "Failed to submit vote.");
    }
    setIsSubmitting(false);
  };

  const handleFinishPoll = () => {
    // 🚀 Mark item progress as complete (saves to backend/cache)
    if (onComplete) {
      onComplete();
    }
    // Navigate forward or exit module
    if (isLastItem && onExit) {
      onExit();
    } else if (onNext) {
      onNext();
    }
  };

  if (showSummary) {
    return (
      <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4 py-8 justify-center">
        <PollResultsSummary
          totalQuestions={totalQuestions}
          onRetake={() => {
            setShowSummary(false);
            setCurrentIndex(0);
          }}
          onContinue={handleFinishPoll}
          isLastItem={isLastItem}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-zinc-500">
        No questions found for this poll.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full w-full max-w-3xl mx-auto px-4 py-6 sm:py-10 justify-between">
      {/* Segmented Progress Bar Header */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-1.5 flex-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(userVotes[q.id]);
              const isCurrent = idx === safeQuestionIndex;

              let segmentStyle = "bg-zinc-200";

              if (isAnswered) {
                segmentStyle = "bg-[#8b5cf6]";
              }

              if (isCurrent) {
                segmentStyle = "bg-[#8b5cf6] ring-2 ring-purple-200";
              }

              return (
                <div
                  key={q.id}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${segmentStyle}`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs sm:text-sm font-bold text-zinc-500 pl-0.5">
              <span className="text-[#8b5cf6]">{safeQuestionIndex + 1}</span>/
              {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Main Question Body Card */}
      <div className="flex-1 space-y-6">
        <PollQuestionCard
          question={currentQuestion}
          index={safeQuestionIndex}
          selectedChoiceId={activeSelection}
          isQuestionSubmitted={hasVotedCurrent}
          showQuestionNumber={false}
          onSelectChoice={handleSelectOption}
        />
      </div>

      {/* Bottom Navigation Control Action Footer */}
      <div className="flex items-center justify-between border-t border-zinc-200/80 pt-6 mt-10">
        <button
          type="button"
          disabled={isFirstQuestion}
          onClick={() => {
            setCurrentIndex((prev) => Math.max(0, prev - 1));
            setSelectedChoiceId("");
          }}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {!hasVotedCurrent ? (
          <button
            type="button"
            disabled={!activeSelection || isSubmitting}
            onClick={handleSubmitVote}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8b5cf6]/20 transition-all hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            <span>{isSubmitting ? "Submitting..." : "Submit Vote"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (isLastQuestion) {
                setShowSummary(true);
              } else {
                setCurrentIndex((prev) =>
                  Math.min(totalQuestions - 1, prev + 1),
                );
                setSelectedChoiceId("");
              }
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#8b5cf6]/20 transition-all hover:bg-[#7c3aed] active:scale-[0.98] cursor-pointer"
          >
            <span>{isLastQuestion ? "Finish" : "Next"}</span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
