"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSurveyAction, submitSurveyAction } from "../actions";

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
  /*
  |--------------------------------------------------------------------------
  | SURVEY ID
  |--------------------------------------------------------------------------
  */

  const surveyId = content;

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [survey, setSurvey] = useState<SurveyData | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);

  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH SURVEY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchSurveyAction(surveyId);

        if (result.success && result.data) {
          setSurvey(result.data);
        } else {
          setError(result.error || "Unable to load survey.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load survey.");
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  /*
  |--------------------------------------------------------------------------
  | SELECT ANSWER
  |--------------------------------------------------------------------------
  */

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const isComplete = useMemo(() => {
    if (!survey) return false;

    return survey.questions.every((question) => answers[question.id]);
  }, [survey, answers]);

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

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
      } else {
        setError(result.error || "Failed to submit survey.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit survey.");
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">Loading survey...</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error && !survey) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  if (!survey) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">Survey not found.</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SUCCESS
  |--------------------------------------------------------------------------
  */

  if (submitted) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />

          <h2 className="text-xl font-bold text-zinc-900">Survey Submitted</h2>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Thank you for answering the survey. Your response has been recorded.
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          Survey
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
          {survey.title}
        </h2>
      </div>

      <div className="mt-10 space-y-8">
        {survey.questions.map((question, index) => (
          <div
            key={question.id}
            className="rounded-2xl border border-zinc-200 p-5"
          >
            <p className="text-base font-semibold text-zinc-900">
              {index + 1}. {question.question}
            </p>

            <div className="mt-5 space-y-3">
              {question.options.map((option) => {
                const active = answers[question.id] === option.id;

                return (
                  <label
                    key={option.id}
                    className={`
                      flex cursor-pointer items-center gap-3
                      rounded-2xl border px-4 py-3
                      transition-all duration-200
                      ${
                        active
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={active}
                      onChange={() => handleSelect(question.id, option.id)}
                      className="hidden"
                    />

                    <div
                      className={`
                        h-4 w-4 rounded-full border
                        ${active ? "border-white bg-white" : "border-zinc-400"}
                      `}
                    />

                    <span
                      className={`text-sm ${
                        active ? "text-white" : "text-zinc-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="mt-5 text-sm text-red-500">{error}</p> : null}

      <button
        type="button"
        disabled={!isComplete || submitting}
        onClick={handleSubmit}
        className="
          mt-10 rounded-2xl
          bg-zinc-950 px-6 py-3
          text-sm font-medium text-white
          transition-all duration-200
          hover:bg-zinc-800
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        {submitting ? "Submitting..." : "Submit Survey"}
      </button>
    </div>
  );
};

export default SurveyBlock;
