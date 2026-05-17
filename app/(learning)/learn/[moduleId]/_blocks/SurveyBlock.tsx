"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import {
  fetchSurveyAction,
  submitSurveyAction,
  fetchSurveyResultsAction,
} from "../actions";
import SurveyResultsViewer from "./not_blocks/SurveyResultsViewer";

type SurveyOption = {
  id: string;
  label: string;
};

type SurveyQuestion = {
  id: string;
  question: string;
  type?: string;
  options: SurveyOption[];
};

type SurveyData = {
  id: string;
  title: string;
  questions: SurveyQuestion[];
};

type SurveyBlockProps = {
  content: string;
};

const SurveyBlock = ({ content }: SurveyBlockProps) => {
  const surveyId = content;

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [resultsData, setResultsData] = useState<any | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewResults, setViewResults] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | DATA INITIALIZATION
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchSurveyAction(surveyId);
        setSubmitted(result.hasSubmitted);

        if (result.success && result.data) {
          setSurvey(result.data);
        } else {
          setError(result.error || "Unable to load survey query.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to initialize assessment framework.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const currentQuestion = survey?.questions[currentStep];

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const isComplete = useMemo(() => {
    if (!survey) return false;
    return survey.questions.every((question) => answers[question.id]);
  }, [survey, answers]);

  const handleSubmit = async () => {
    if (!survey || !isComplete || submitting) return;

    setSubmitting(true);
    setError(null);

    const formattedAnswers = Object.entries(answers).map(
      ([question_id, option_id]) => ({
        question_id,
        option_id,
      }),
    );

    try {
      const result = await submitSurveyAction(survey.id, formattedAnswers);
      if (result.success) {
        setSubmitted(true);
        handleLoadResults();
      } else {
        setError(result.error || "Failed to transmit survey metrics.");
      }
    } catch (err) {
      console.error(err);
      setError("Transmission error. Please verify session status.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadResults = async () => {
    setViewResults(true);

    if (!resultsData) {
      try {
        setLoadingResults(true);
        setError(null);
        const result = await fetchSurveyResultsAction(surveyId);

        if (result.success && result.data) {
          setResultsData(result.data);
        } else {
          setError(result.error || "Failed to retrieve live responses.");
        }
      } catch (err) {
        console.error(err);
        setError("Could not establish link to survey database metrics.");
      } finally {
        setLoadingResults(false);
      }
    }
  };

  const handleNext = () => {
    if (!survey || currentStep >= survey.questions.length - 1) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep === 0) return;
    setCurrentStep((prev) => prev - 1);
  };

  /*
  |--------------------------------------------------------------------------
  | SKELETON RENDER MECHANICAL MATCH
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 md:px-8 animate-pulse min-h-[580px] md:min-h-[520px] flex flex-col justify-between">
        <div>
          {/* Structural Header Skeleton */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
            <div className="flex flex-col gap-2 w-1/2">
              <div className="h-3 w-32 bg-zinc-100 rounded-md" />
              <div className="h-4 w-20 bg-zinc-50 rounded-md" />
            </div>
            <div className="h-1.5 w-24 bg-zinc-100 rounded-full" />
          </div>

          {/* Main Title Query Block Mimic */}
          <div className="mt-12">
            <div className="space-y-2.5">
              <div className="h-7 w-5/6 bg-zinc-100 rounded-xl" />
              <div className="h-7 w-1/2 bg-zinc-100 rounded-xl" />
            </div>

            {/* Dynamic Selection Stack Skeletons */}
            <div className="mt-10 space-y-3">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-100/60 bg-white p-5"
                >
                  <div className="h-4 w-1/3 bg-zinc-50 rounded-md" />
                  <div className="h-4 w-4 rounded-full bg-zinc-100" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel Baseline Control Matrix */}
        <div className="mt-16 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <div className="h-11 w-11 rounded-full bg-zinc-100" />
          <div className="h-11 w-11 rounded-full bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (error && !survey && !viewResults) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-red-100 bg-red-50/30 p-8 text-center animate-fade-in min-h-[580px] md:min-h-[520px] flex items-center justify-center">
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  if (!survey || !currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-zinc-100 bg-white p-12 text-center min-h-[580px] md:min-h-[520px] flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">
          No active parameters found
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VIEWPORT 1: INLINE ANALYTICS DISCOVERY PANEL (LIVE DATA)
  |--------------------------------------------------------------------------
  */
  if (submitted && viewResults) {
    return (
      <div className="mx-auto max-w-3xl min-h-[580px] md:min-h-[520px] flex flex-col justify-between animate-fade-in">
        <div className="w-full">
          {loadingResults ? (
            /* Recharts UI Skeleton Clone Layout matching layout parameters perfectly */
            <div className="w-full bg-white animate-pulse py-12 px-4 md:px-8">
              <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
                <div className="space-y-2 w-1/3">
                  <div className="h-3 w-full bg-zinc-100 rounded-md" />
                  <div className="h-4 w-1/2 bg-zinc-50 rounded-md" />
                </div>
                <div className="h-6 w-28 bg-zinc-100 rounded-full" />
              </div>

              <div className="mt-12 space-y-2">
                <div className="h-7 w-3/4 bg-zinc-100 rounded-xl" />
                <div className="h-4 w-40 bg-zinc-50 rounded-md" />
              </div>

              {/* Simulated Chart Geometry Container */}
              <div className="mt-12 h-[280px] w-full flex flex-col justify-between py-4">
                {[85, 45, 60, 25].map((mockWidth, i) => (
                  <div key={i} className="flex items-center gap-4 w-full">
                    <div className="w-24 h-4 bg-zinc-50 rounded-md" />
                    <div className="flex-1 h-3 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-200/60 rounded-full"
                        style={{ width: `${mockWidth}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : resultsData ? (
            <SurveyResultsViewer
              title={resultsData.title || survey.title}
              results={resultsData.results}
            />
          ) : (
            <div className="rounded-[32px] border border-zinc-100 bg-white p-12 text-center py-24">
              <p className="text-sm text-red-500 font-medium">
                {error ||
                  "Failed to compute real-time structural survey matrices."}
              </p>
            </div>
          )}
        </div>

        {/* Navigation fallback layout button toggle */}
        <div className="w-full px-4 md:px-8 pb-12 flex justify-start">
          <button
            onClick={() => setViewResults(false)}
            className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            ← return to status confirmation
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VIEWPORT 2: SUCCESS BROWSER LANDING PAGE
  |--------------------------------------------------------------------------
  */
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 text-center animate-fade-in min-h-[580px] md:min-h-[520px] flex flex-col justify-center items-center">
        <div className="h-12 w-12 rounded-full bg-sky-50 text-[#00aeef] flex items-center justify-center mb-8">
          <Check size={20} strokeWidth={2} />
        </div>
        <h2 className="text-3xl font-light tracking-tight text-zinc-900">
          Survey Response{" "}
          <span className="italic font-serif text-[#00aeef]">Recorded.</span>
        </h2>
        <p className="mt-4 text-base text-zinc-500 font-light leading-relaxed max-w-md mx-auto">
          Thank you for providing institutional metrics. Your responses have
          been processed securely into our dataset.
        </p>

        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={handleLoadResults}
            className="group flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
          >
            <BarChart3 size={14} strokeWidth={2} />
            view aggregate analytics
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VIEWPORT 3: CORE STEPPERS FORM QUESTIONS INTERFACE
  |--------------------------------------------------------------------------
  */
  return (
    <div className="mx-auto max-w-3xl py-12 px-4 md:px-8 animate-fade-in min-h-[580px] md:min-h-[520px] flex flex-col justify-between">
      <div>
        {/* Structural Metric Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00aeef]">
              {survey.title}
            </span>
            <span className="text-xs text-zinc-400 font-light">
              Question {(currentStep + 1).toString().padStart(2, "0")} of{" "}
              {survey.questions.length.toString().padStart(2, "0")}
            </span>
          </div>

          <div className="h-1.5 w-24 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00aeef] transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep + 1) / survey.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Main Survey Content Block */}
        <div className="mt-12">
          <h3 className="text-2xl font-light tracking-tight text-zinc-900 leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Dynamic Options Stack */}
          <div className="mt-10 flex flex-col gap-3">
            {currentQuestion.options.map((option) => {
              const active = answers[currentQuestion.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(currentQuestion.id, option.id)}
                  className={`group flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all duration-300
                    ${
                      active
                        ? "border-[#00aeef] bg-sky-50/20 text-zinc-900"
                        : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                    }
                  `}
                >
                  <span className="text-sm font-light">{option.label}</span>

                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-300
                    ${active ? "border-[#00aeef] bg-[#00aeef]" : "border-zinc-200 bg-transparent group-hover:border-zinc-400"}
                  `}
                  >
                    {active && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer controls container and validation message elements */}
      <div>
        {error && (
          <p className="mt-6 text-xs font-semibold text-red-500 tracking-wide uppercase">
            {error}
          </p>
        )}

        <div className="mt-16 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={handlePrev}
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-100 text-zinc-400 bg-white transition-all hover:text-zinc-800 hover:border-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </button>

          {currentStep === survey.questions.length - 1 ? (
            <button
              type="button"
              disabled={!isComplete || submitting}
              onClick={handleSubmit}
              className="group flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <span>
                {submitting ? "Processing..." : "Submit Verification"}
              </span>
              <Check size={14} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!answers[currentQuestion.id]}
              onClick={handleNext}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-100 text-zinc-400 bg-white transition-all hover:text-zinc-800 hover:border-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
            >
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyBlock;
