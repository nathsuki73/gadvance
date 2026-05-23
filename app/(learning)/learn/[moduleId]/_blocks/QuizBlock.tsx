"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Check, ArrowRight, RotateCcw, HelpCircle, Award } from "lucide-react";
import { useQuizTelemetry } from "../_hooks/useQuizTelemetry";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  backendBlockId: string;
};

type QuizBlockMetadata = {
  title?: string;
  description?: string;
};

type QuizBlockProps = {
  content?: string | null;
  metadata?: QuizBlockMetadata;
  onQuestionCompleted?: (blockId: string) => void;
};

const QuizBlock = ({
  content,
  metadata,
  onQuestionCompleted,
}: QuizBlockProps) => {
  /*
  |--------------------------------------------------------------------------
  | PARSE DATA
  |--------------------------------------------------------------------------
  */
  const questions: QuizQuestion[] = useMemo(() => {
    try {
      if (!content) return [];
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch {
      return [];
    }
  }, [content]);

  /*
  |--------------------------------------------------------------------------
  | COMPONENT STATES
  |--------------------------------------------------------------------------
  */
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const { trackAnswer, isSyncing } = useQuizTelemetry();
  const currentQuestion = questions[currentQuestionIndex];

  const score = questions.reduce((total, question, index) => {
    return answers[index] === question.correctAnswer ? total + 1 : total;
  }, 0);

  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  /*
  |--------------------------------------------------------------------------
  | SATISFACTION SCORE TICKER ANIMATION
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (submitted) {
      let start = 0;
      if (percentage === 0) return;

      const duration = 1000; // 1 second execution window
      const increment = percentage / (duration / 16); // ~60fps layout standard

      const timer = setInterval(() => {
        start += increment;
        if (start >= percentage) {
          clearInterval(timer);
          setAnimatedScore(percentage);
        } else {
          setAnimatedScore(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [submitted, percentage]);

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;

    // 🔍 DIAGNOSTIC LOG: Let's see exactly what keys are available on your question object
    console.log("Current Question Raw Data Structure:", currentQuestion);

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const currentStepNumber = currentQuestionIndex + 1;
    const totalQuestionsCount = questions.length;

    // Local state update
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: selectedAnswer }));
    setSelectedAnswer("");

    // 2. Fire telemetry hook completely cleanly out of view layer boundaries
    const syncResult = await trackAnswer({
      backendBlockId: currentQuestion.backendBlockId,
      isCorrect,
      currentIndex: currentStepNumber,
      totalItems: totalQuestionsCount,
    });

    if (!syncResult.success) {
      return;
    }

    onQuestionCompleted?.(currentQuestion.backendBlockId);

    // 3. Switch UI interfaces cleanly
    if (currentQuestionIndex === questions.length - 1) {
      setSubmitted(true);
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleRetake = () => {
    setStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswers({});
    setSubmitted(false);
    setAnimatedScore(0);
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-zinc-100 bg-white p-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-300">
          no assessments available
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | STATE 1: RESULT INTERFACE (WITH SATISFACTION COUNTER)
  |--------------------------------------------------------------------------
  */
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-16 px-4 text-center animate-fade-in">
        <div className="relative inline-flex items-center justify-center mb-10">
          {/* SVG Progress Circle Configuration */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="#f4f4f5"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="#00aeef"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * animatedScore) / 100}
              className="transition-all duration-100 ease-out"
            />
          </svg>
          <span className="absolute text-2xl font-semibold tracking-tight text-zinc-900">
            {animatedScore}%
          </span>
        </div>

        <h2 className="text-3xl font-light tracking-tight text-zinc-900 ">
          Assessment{" "}
          <span className="italic font-serif text-[#00aeef]">completed.</span>
        </h2>

        <p className="mt-4 text-zinc-500 font-light ">
          You correctly answered {score} out of {questions.length} questions.
        </p>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleRetake}
            className="group flex items-center gap-3 rounded-full border border-zinc-100 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-all hover:text-zinc-900 hover:border-zinc-300 active:scale-[0.98]"
          >
            <RotateCcw size={14} strokeWidth={2} />
            retake quiz
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | STATE 2: INTRO SCREEN
  |--------------------------------------------------------------------------
  */
  if (!started) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00aeef] mb-6">
            knowledge validation
          </div>

          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-zinc-900  leading-tight">
            {metadata?.title ?? "Quiz"}
          </h2>

          <p className="mt-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
            {metadata?.description ??
              "Check your understanding before completing this lesson."}
          </p>

          <div className="mt-12 w-full max-w-xs border-y border-zinc-100 py-6 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            <span>total questions</span>
            <span className="font-mono text-base text-zinc-900 font-medium">
              {questions.length.toString().padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="group mt-12 flex items-center gap-4 rounded-full bg-[#00aeef] px-10 py-5 text-white transition-all hover:bg-[#0096ce] hover:shadow-lg hover:shadow-sky-100/50"
          >
            <span className="font-medium lowercase text-xs uppercase tracking-widest font-bold">
              begin quiz
            </span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | STATE 3: LIVE ACTIVE QUESTIONS SCREEN
  |--------------------------------------------------------------------------
  */
  return (
    <div className="mx-auto max-w-3xl py-12 px-4 animate-fade-in">
      {/* Structural Tracking Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00aeef]">
          objective {(currentQuestionIndex + 1).toString().padStart(2, "0")} /{" "}
          {questions.length.toString().padStart(2, "0")}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300"></span>
      </div>

      {/* Primary Objective Query */}
      <div className="mt-10">
        <h3 className="text-2xl font-light tracking-tight text-zinc-900 leading-snug lowercase">
          {currentQuestion.question}
        </h3>
      </div>

      {/* Flat List Option Mechanics */}
      <div className="mt-12 flex flex-col gap-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedAnswer === option;

          return (
            <button
              key={option}
              onClick={() => setSelectedAnswer(option)}
              className={`group flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all duration-300
                ${
                  isSelected
                    ? "border-[#00aeef] bg-sky-50/20 text-zinc-900"
                    : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                }
              `}
            >
              <span className="text-sm font-light lowercase">{option}</span>

              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-300
                ${isSelected ? "border-[#00aeef] bg-[#00aeef]" : "border-zinc-200 bg-transparent group-hover:border-zinc-400"}
              `}
              >
                {isSelected && (
                  <Check size={10} className="text-white" strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Execution Drawer */}
      <div className="mt-12 pt-6 border-t border-zinc-100 flex justify-end">
        <button
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer}
          className="group flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-20"
        >
          <span className="lowercase font-medium">
            {currentQuestionIndex === questions.length - 1
              ? "evaluate answers"
              : "next objective"}
          </span>
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
};

export default QuizBlock;
