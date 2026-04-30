"use client";

import React, { useState } from "react";
import { ArrowRight, X, CheckCircle2 } from "lucide-react";

interface PretestProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  moduleTitle?: string;
  accentColor?: string;
}

const pretestQuestions = [
  {
    id: 1,
    question: "What is your current knowledge level about this topic?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: 2,
    question: "How much time can you dedicate to this course per week?",
    options: ["Less than 2 hours", "2-5 hours", "5+ hours"],
  },
  {
    id: 3,
    question: "What is your primary goal for taking this course?",
    options: [
      "Learn new skills",
      "Professional development",
      "Personal interest",
    ],
  },
];

export default function Pretest({
  isOpen,
  onClose,
  onComplete,
  moduleTitle = "Course",
  accentColor = "#00a9d1",
}: PretestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const question = pretestQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / pretestQuestions.length) * 100;

  const handleSelectOption = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < pretestQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleFinish = () => {
    onComplete();
    setCurrentQuestion(0);
    setAnswers({});
    setIsCompleted(false);
  };

  const isAnswered = answers[question.id] !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Pre-test Assessment
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-900">{moduleTitle}</h2>
          </div>
          {!isCompleted && (
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 transition-colors hover:bg-zinc-50"
              aria-label="Close pretest"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {isCompleted ? (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <CheckCircle2
                    size={32}
                    style={{ color: accentColor }}
                  />
                </div>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-zinc-900">
                Pre-test Complete!
              </h3>
              <p className="mb-8 text-zinc-600">
                Thank you for completing the assessment. Your responses will help us personalize your learning experience.
              </p>
              <div className="space-y-2 rounded-lg bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-700">
                  Questions Answered: <span className="font-semibold">{Object.keys(answers).length} of {pretestQuestions.length}</span>
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-600">
                    Question {currentQuestion + 1} of {pretestQuestions.length}
                  </span>
                  <span className="text-sm font-medium text-zinc-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h3 className="mb-6 text-lg font-semibold text-zinc-900">
                  {question.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(option)}
                      className="w-full rounded-lg border-2 px-4 py-3 text-left font-medium transition-all"
                      style={{
                        borderColor:
                          answers[question.id] === option ? accentColor : "#e4e4e7",
                        backgroundColor:
                          answers[question.id] === option
                            ? `${accentColor}15`
                            : "#ffffff",
                        color: "#111827",
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4">
          <button
            onClick={isCompleted ? handleFinish : onClose}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            {isCompleted ? "Continue" : "Skip"}
          </button>
          {!isCompleted && (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: accentColor,
              }}
            >
              Next
              <ArrowRight size={16} />
            </button>
          )}
          {isCompleted && (
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-opacity"
              style={{
                backgroundColor: accentColor,
              }}
            >
              Finish
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
