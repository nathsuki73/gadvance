"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ClipboardCheck,
  GraduationCap,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Award,
} from "lucide-react";

export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  question: string;
  type?: "single_choice" | "multiple_choice";
  options: QuestionOption[];
  correct_option_id?: string;
}

export interface AssessmentData {
  id: string;
  title: string;
  description?: string | null;
  type?: "pre_test" | "post_test" | "quiz";
  passing_score?: number; // e.g. 75 for 75%
  questions: Question[];
}

export interface AssessmentResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

interface AssessmentContainerProps {
  itemId: string;
  moduleId: string;
  assessmentId: string;
  type?: string;
  onComplete: () => void;
  onNext: () => void;
}

type QuizPhase = "loading" | "intro" | "active" | "results" | "error";

export default function AssessmentContainer({
  itemId,
  moduleId,
  assessmentId,
  type = "quiz",
  onComplete,
  onNext,
}: AssessmentContainerProps) {
  const [phase, setPhase] = useState<QuizPhase>("loading");
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Assessment Data
  useEffect(() => {
    let isCancelled = false;

    const fetchAssessment = async () => {
      try {
        setPhase("loading");
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}/api/assessments/${assessmentId}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch assessment (${res.status})`);
        }

        const json = await res.json();
        const data: AssessmentData = json.data ?? json;

        if (!isCancelled) {
          setAssessment(data);
          setPhase("intro");
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Assessment fetch error:", err);
          setError("Unable to load assessment questions. Please try again.");
          setPhase("error");
        }
      }
    };

    if (assessmentId) {
      fetchAssessment();
    }

    return () => {
      isCancelled = true;
    };
  }, [assessmentId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleStart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setPhase("active");
  };

  const handleSubmitAssessment = async () => {
    if (!assessment) return;

    setIsSubmitting(true);
    try {
      const questions = assessment.questions || [];
      const total = questions.length;
      let correctCount = 0;

      questions.forEach((q) => {
        if (q.correct_option_id && answers[q.id] === q.correct_option_id) {
          correctCount++;
        }
      });

      const percentage =
        total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const passingMark = assessment.passing_score ?? 75;
      const passed = percentage >= passingMark;

      const finalResult: AssessmentResult = {
        score: correctCount,
        total,
        percentage,
        passed,
      };

      setResult(finalResult);
      setPhase("results");
      onComplete();

      // Sync submission with backend API
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      await fetch(`${baseUrl}/api/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: moduleId,
          answers,
          score: correctCount,
          total,
          percentage,
          passed,
        }),
      }).catch(() => {
        // Silently catch network sync errors if offline
      });
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (phase === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-xs font-medium text-zinc-400">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (phase === "error" || error || !assessment) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-8">
        <div className="flex max-w-md flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
          <h3 className="text-base font-semibold text-zinc-800">
            Assessment Unavailable
          </h3>
          <p className="mt-1 text-xs text-zinc-500 mb-6">
            {error || "Could not load test content."}
          </p>
          <button
            type="button"
            onClick={() => setPhase("loading")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Intro Screen
  if (phase === "intro") {
    const questionCount = assessment.questions?.length || 0;
    const isPreTest = type === "pre_test" || type === "pretest";

    return (
      <div className="flex h-full flex-col justify-between overflow-y-auto bg-white p-6 md:p-12">
        <div className="mx-auto my-auto max-w-2xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 shadow-xs">
            {isPreTest ? (
              <ClipboardCheck size={32} />
            ) : (
              <GraduationCap size={32} />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              {type.replace("_", " ")}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 pt-2">
              {assessment.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto leading-relaxed">
              {assessment.description ||
                "Complete this assessment to evaluate your understanding of the concepts covered in this module."}
            </p>
          </div>

          <div className="flex justify-center gap-6 text-xs text-zinc-500 font-medium py-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle size={15} className="text-purple-600" />
              <span>{questionCount} Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award size={15} className="text-purple-600" />
              <span>Passing Grade: {assessment.passing_score ?? 75}%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] cursor-pointer"
          >
            <span>Start Assessment</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 4. Active Assessment Screen
  if (phase === "active") {
    const questions = assessment.questions || [];
    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;
    const isLastQuestion = currentQuestionIndex === totalQ - 1;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="flex h-full flex-col justify-between overflow-y-auto bg-white">
        {/* Assessment Top Progress Bar */}
        <header className="border-b border-zinc-100 px-6 py-4 lg:px-12 bg-zinc-50/50">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-mono text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                Question {currentQuestionIndex + 1} of {totalQ}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                ({answeredCount} of {totalQ} answered)
              </span>
            </div>

            <div className="w-32 sm:w-48 h-2 bg-zinc-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / totalQ) * 100}%`,
                }}
              />
            </div>
          </div>
        </header>

        {/* Current Question Body */}
        <main className="mx-auto my-auto w-full max-w-3xl px-6 py-8 lg:px-12 space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 leading-snug">
            {currentQ?.question}
          </h2>

          <div className="space-y-3 pt-2">
            {currentQ?.options?.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/60 text-purple-900 ring-2 ring-purple-600/20"
                      : "border-zinc-200/80 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/50"
                  }`}
                >
                  <span>{opt.label}</span>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-purple-600 bg-purple-600"
                        : "border-zinc-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </main>

        {/* Bottom Question Navigation Controls */}
        <footer className="border-t border-zinc-100 bg-white px-6 py-4 lg:px-12">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitAssessment}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>
                    <span>Submit Test</span>
                    <CheckCircle2 size={15} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(totalQ - 1, prev + 1),
                  )
                }
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  // 5. Results Screen
  if (phase === "results" && result) {
    return (
      <div className="flex h-full flex-col justify-between overflow-y-auto bg-white p-6 md:p-12">
        <div className="mx-auto my-auto max-w-lg text-center space-y-6">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border ${
              result.passed
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-rose-50 text-rose-600 border-rose-200"
            }`}
          >
            {result.passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-zinc-900">
              {result.passed ? "Assessment Passed!" : "Needs Review"}
            </h2>
            <p className="text-xs text-zinc-500">
              {result.passed
                ? "Great job! You have successfully completed this evaluation."
                : "You didn't reach the passing score this time. Review the material and try again."}
            </p>
          </div>

          {/* Score Card */}
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-around">
            <div className="text-center">
              <span className="block text-3xl font-extrabold text-zinc-900">
                {result.score} / {result.total}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Correct Answers
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-200" />
            <div className="text-center">
              <span
                className={`block text-3xl font-extrabold ${
                  result.passed ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {result.percentage}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Final Score
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Retake Assessment</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] cursor-pointer"
            >
              <span>Next Item</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
