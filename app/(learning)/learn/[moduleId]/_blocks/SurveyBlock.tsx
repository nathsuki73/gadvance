"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  Loader2,
  BarChart3,
} from "lucide-react";
import {
  fetchSurveyAction,
  submitSurveyAction,
  fetchSurveyResultsAction,
} from "../actions";
import SurveyResultsViewer from "./helper_blocks/SurveyResultsViewer";

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
  const [resultsData, setResultsData] = useState<any | null>(null); // Stores actual database statistics
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false); // Separated analytics loading tracker
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
        // Automatically fetch live analytics once form is submitted successfully
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

  /*
  |--------------------------------------------------------------------------
  | LIVE ANALYTICS HANDLER
  |--------------------------------------------------------------------------
  */
  const handleLoadResults = async () => {
    setViewResults(true);

    // Only call database action if we haven't loaded the values yet during this window instance
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

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION CONTROLS
  |--------------------------------------------------------------------------
  */
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
  | LOADING ENGINE VIEWPORTS
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-24 text-center">
        <Loader2
          className="mx-auto animate-spin text-[#00aeef]/40"
          size={32}
          strokeWidth={1.5}
        />
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Syncing survey payload...
        </p>
      </div>
    );
  }

  if (error && !survey && !viewResults) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-red-100 bg-red-50/30 p-8 text-center animate-fade-in">
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  if (!survey || !currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-zinc-100 bg-white p-12 text-center">
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
      <div className="animate-fade-in">
        {loadingResults ? (
          <div className="mx-auto max-w-3xl py-32 text-center">
            <Loader2
              className="mx-auto animate-spin text-[#00aeef]/40"
              size={32}
              strokeWidth={1.5}
            />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
              Aggregating live responses...
            </p>
          </div>
        ) : resultsData ? (
          /* Render the exact Recharts component powered by backend response data structure */
          <SurveyResultsViewer
            title={resultsData.title || survey.title}
            results={resultsData.results}
          />
        ) : (
          <div className="mx-auto max-w-2xl rounded-[32px] border border-zinc-100 bg-white p-12 text-center">
            <p className="text-sm text-red-500 font-medium lowercase">
              {error ||
                "failed to compute real-time structural survey matrices."}
            </p>
          </div>
        )}

        {/* Navigation fallback layout button toggle */}
        <div className="max-w-3xl mx-auto px-4 md:px-8 pb-12 -mt-4 flex justify-start">
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
      <div className="mx-auto max-w-2xl py-24 px-6 text-center animate-fade-in">
        <div className="h-12 w-12 rounded-full bg-sky-50 text-[#00aeef] flex items-center justify-center mx-auto mb-8">
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

        {/* Live results connection trigger execution mapping */}
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
    <div className="mx-auto max-w-3xl py-12 px-4 md:px-8 animate-fade-in">
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

        {/* Progress Tracker Pill */}
        <div className="h-1.5 w-24 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00aeef] transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / survey.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Main Survey Card Container */}
      <div className="mt-12 min-h-[280px]">
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

      {error && (
        <p className="mt-6 text-xs font-semibold text-red-500 tracking-wide uppercase">
          {error}
        </p>
      )}

      {/* FOOTER SLIDER PANEL CONTROL MECHANICS */}
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
            <span>{submitting ? "Processing..." : "Submit Verification"}</span>
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
  );
};

export default SurveyBlock;
