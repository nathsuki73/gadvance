"use client";

import React from "react";
import {
  Award,
  RotateCcw,
  CheckCircle2,
  Target,
  CheckCircle,
} from "lucide-react";
import { AssessmentSettings } from "./types";

interface ResultsSummaryProps {
  scorePercentage: number;
  correctCount: number;
  totalGraded: number;
  totalQuestions: number;
  elapsedSeconds: number;
  settings: AssessmentSettings;
  onRetry: () => void;
}

export function ResultsSummary({
  scorePercentage,
  correctCount,
  totalGraded,
  totalQuestions,
  elapsedSeconds,
  settings,
  onRetry,
}: ResultsSummaryProps) {
  const isPassed = scorePercentage >= settings.passingScore;

  const hasAttemptsRemaining =
    settings.maxAttempts === null || settings.maxAttempts > 1;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  // SVG Ring Progress Dimensions
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/40 via-white to-purple-50/10 p-6 space-y-6 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-purple-100/60 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs shrink-0 ${
              settings.type === "poll"
                ? "bg-amber-600"
                : isPassed
                  ? "bg-emerald-600"
                  : "bg-rose-600"
            }`}
          >
            <Award size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              {settings.type === "poll"
                ? "Poll Completed!"
                : isPassed
                  ? "Assessment Passed!"
                  : "Needs Improvement"}
            </h2>
            <p className="text-xs text-zinc-500">
              Completed in {formatTime(elapsedSeconds)}
            </p>
          </div>
        </div>

        {/* Retake button displays strictly when review is allowed and attempts remain */}
        {settings.allowReview && hasAttemptsRemaining && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white hover:bg-[#7c3aed] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw size={14} />
            <span>Retake</span>
          </button>
        )}
      </div>

      {settings.type !== "poll" && (
        <>
          {settings.allowReview ? (
            /* Ring-Score & Key Metrics */
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 rounded-2xl border border-purple-100/80 bg-white/80 p-6 backdrop-blur-xs">
              {/* Ring Progress Score */}
              <div className="relative flex items-center justify-center">
                <svg className="h-28 w-28 -rotate-90 transform">
                  {/* Background Track Circle */}
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100"
                    fill="transparent"
                  />
                  {/* Active Animated Progress Arc */}
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${
                      isPassed ? "text-emerald-500" : "text-rose-500"
                    }`}
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span
                    className={`text-2xl font-bold ${
                      isPassed ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {scorePercentage}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    Score
                  </span>
                </div>
              </div>

              {/* Side Stat Highlights: Passing Mark & Correct Count */}
              <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                {/* Passing Mark */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-100/60 bg-purple-50/30 px-6 py-3.5 min-w-[120px]">
                  <div className="flex items-center gap-1.5 text-slate-700 mb-1">
                    <Target size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Passing Mark
                    </span>
                  </div>
                  <span className="text-xl font-bold text-slate-700">
                    {settings.passingScore}%
                  </span>
                </div>

                {/* Correct Answers */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-3.5 min-w-[120px]">
                  <div className="flex items-center gap-1.5 text-slate-700 mb-1">
                    <CheckCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Correct
                    </span>
                  </div>
                  <span className="text-xl font-bold text-slate-700">
                    {correctCount}{" "}
                    <span className="text-xs font-semibold text-zinc-400">
                      / {totalGraded}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-100/80 bg-white p-5 text-center space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-1">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div
                  className={`text-2xl font-bold ${
                    isPassed ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {scorePercentage}%
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Your submission has been recorded successfully.
                </p>
              </div>
              <p className="text-[11px] text-zinc-400 italic border-t border-purple-50 pt-3">
                Detailed question & answer review is disabled for this
                assessment.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
