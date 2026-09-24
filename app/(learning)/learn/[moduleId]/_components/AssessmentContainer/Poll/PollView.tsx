"use client";

import React, { useState } from "react";
import { PollViewData, submitPollVote } from "./pollService";

interface PollViewProps {
  pollData: PollViewData;
  sectionItemId?: string;
  moduleId?: string;
}

export default function PollView({
  pollData,
  sectionItemId,
  moduleId,
}: PollViewProps) {
  const [userVotes, setUserVotes] = useState<Record<string, string>>(
    pollData.user_voted_map || {},
  );
  const [questions, setQuestions] = useState(pollData.questions || []);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleVote = async (questionId: string, choiceId: string) => {
    if (!sectionItemId) return;
    setSubmittingId(questionId);

    const res = await submitPollVote(
      pollData.id,
      sectionItemId,
      questionId,
      choiceId,
      moduleId,
    );

    if (res.success && res.poll_distributions) {
      setUserVotes((prev) => ({ ...prev, [questionId]: choiceId }));

      // Update local question option percentages & votes
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => {
          if (q.id === questionId) {
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
    } else {
      alert(res.error || "Failed to submit vote.");
    }
    setSubmittingId(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow border border-gray-100">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        {pollData.title}
      </h2>
      <p className="text-gray-600 mb-6">{pollData.instructions}</p>

      <div className="space-y-8">
        {questions.map((question, qIdx) => {
          const selectedChoiceId = userVotes[question.id];

          return (
            <div
              key={question.id}
              className="border-b border-gray-100 pb-6 last:border-none"
            >
              <p className="text-lg font-medium text-gray-900 mb-4">
                {qIdx + 1}. {question.text}
              </p>

              <div className="space-y-3">
                {question.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const hasVoted = Boolean(selectedChoiceId);

                  return (
                    <div
                      key={choice.id}
                      className="relative overflow-hidden rounded-lg border border-gray-200 transition"
                    >
                      {/* Background Progress Bar for percentages */}
                      {hasVoted && (
                        <div
                          className="absolute top-0 bottom-0 left-0 bg-blue-100 transition-all duration-500 opacity-40"
                          style={{ width: `${choice.percentage || 0}%` }}
                        />
                      )}

                      <button
                        disabled={submittingId === question.id}
                        onClick={() => handleVote(question.id, choice.id)}
                        className={`relative w-full flex justify-between items-center p-4 text-left z-10 ${
                          isSelected
                            ? "border-blue-600 font-semibold text-blue-900"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <span>{choice.text}</span>
                        {hasVoted && (
                          <span className="text-sm font-medium text-gray-600">
                            {choice.percentage}% ({choice.votes} votes)
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
