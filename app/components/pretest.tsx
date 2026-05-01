"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";

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
    <div className="min-h-screen bg-[#efeff1] pb-5 text-zinc-900 pt-2">
      <div className="mx-auto w-full max-w-250 space-y-12">
        <header className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-[#f8f8f9] px-3.5 py-1.5 text-[0.68rem] font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              <ChevronLeft size={16} />
              Back to Modules
            </button>
            <div className="text-right">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Pre-test Assessment
              </p>
              <h1 className="mt-0.5 text-[1.35rem] font-bold tracking-tight text-zinc-900 md:text-[1.65rem]">
                {moduleTitle}
              </h1>
            </div>
          </div>
          <div className="h-0.75 w-full bg-zinc-200">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
        </header>

        <section className="mx-4 rounded-3xl border border-zinc-200 bg-white px-5 py-5 shadow-sm md:mx-5 md:px-6 md:py-6">
          {isCompleted ? (
            <div className="py-4 text-center">
              <div className="mb-4 flex justify-center">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <CheckCircle2 size={22} style={{ color: accentColor }} />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                Pre-test Complete
              </h2>
              <p className="mx-auto mt-2.5 max-w-xl text-xs leading-6 text-zinc-600">
                Thank you for completing the assessment. Your responses will help us
                personalize your learning experience.
              </p>
              <div className="mt-5 flex justify-end border-t border-zinc-200 pt-4">
                <button
                  onClick={handleFinish}
                  className="inline-flex items-center mt-5 gap-1.5 rounded-full px-5 py-3 text-xs font-semibold text-white transition-opacity hover:opacity-95"
                  style={{ backgroundColor: accentColor }}
                >
                  Continue
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-600">
                Question {currentQuestion + 1} of {pretestQuestions.length}
              </p>

              <h2 className="mt-3 text-[1.6rem] font-bold leading-snug tracking-tight text-zinc-900 md:text-[1.9rem]">
                {question.question}
              </h2>

              <div className="mt-5 space-y-2.5">
                {question.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="w-full rounded-xl border-2 px-4 py-4.5 text-left text-base font-semibold transition-all"
                    style={{
                      borderColor:
                        answers[question.id] === option ? accentColor : "#d4d4d8",
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

              <div className="mt-5 flex justify-end border-t border-zinc-200 pt-8">
                <button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: accentColor }}
                >
                  Next
                  <ArrowRight size={12} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
