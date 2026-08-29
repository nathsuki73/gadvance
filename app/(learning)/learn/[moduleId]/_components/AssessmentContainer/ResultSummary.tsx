"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  CheckCircle2,
  Info,
  BarChart3,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";
import { AssessmentSettings } from "./types";

interface ResultsSummaryProps {
  scorePercentage: number;
  score?: number; // Raw earned score
  totalPoints?: number; // Total possible points
  correctCount: number;
  totalGraded: number;
  totalQuestions: number;
  elapsedSeconds: number;
  settings: AssessmentSettings;
  onRetry: () => void;
}

export function ResultsSummary({
  scorePercentage,
  score,
  totalPoints,
  correctCount,
  totalGraded,
  totalQuestions,
  elapsedSeconds,
  settings,
  onRetry,
}: ResultsSummaryProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  const isPassed = scorePercentage >= settings.passingScore;
  const hasAttemptsRemaining =
    settings.maxAttempts == null || settings.maxAttempts > 1;

  // 🌊 Custom Asymmetric Ease-In-Out animation loop using requestAnimationFrame
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1300; // 1.3 seconds total

    const animateScore = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const customEase =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentVal = Math.round(customEase * scorePercentage);

      setAnimatedPercentage(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      } else {
        setAnimatedPercentage(scorePercentage);
      }
    };

    const frameId = requestAnimationFrame(animateScore);
    return () => cancelAnimationFrame(frameId);
  }, [scorePercentage]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  // SVG Donut calculation with widened canvas and radius
  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset =
    circumference - (animatedPercentage / 100) * circumference;

  const passingScoreAngle = (settings.passingScore / 100) * 360;

  // --- Passing-rate indicator geometry ---
  // The donut's own SVG is rotated -90deg so 0% sits at 12 o'clock and
  // progresses clockwise. We compute the indicator in plain (unrotated)
  // coordinates using the same convention: 0deg = top, clockwise positive.
  const donutCenter = 96; // half of the 192px (h-48/w-48) box
  const passingAngleRad = (passingScoreAngle * Math.PI) / 180;
  const tickStartR = radius + 6; // just outside the donut ring
  const tickEndR = radius + 18; // end of the radial tick
  const horizontalLength = 22; // length of the horizontal connector

  const tickX1 = donutCenter + tickStartR * Math.sin(passingAngleRad);
  const tickY1 = donutCenter - tickStartR * Math.cos(passingAngleRad);
  const tickX2 = donutCenter + tickEndR * Math.sin(passingAngleRad);
  const tickY2 = donutCenter - tickEndR * Math.cos(passingAngleRad);

  // Flip the horizontal connector (and label) to whichever side of the
  // donut the tick lands on, so it never runs off the left/right edge.
  const pointsRight = Math.sin(passingAngleRad) >= 0;
  const labelLineX = pointsRight
    ? tickX2 + horizontalLength
    : tickX2 - horizontalLength;

  const displayScoreText =
    score !== undefined && totalPoints !== undefined
      ? `${score} / ${totalPoints}`
      : `${correctCount} / ${totalGraded}`;

  return (
    <div className="overflow-hidden p-6 space-y-6 flex flex-col items-center text-center">
      {settings.type === "poll" ? (
        <div className="w-full rounded-2xl border border-purple-200/80 bg-purple-50/50 p-6 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#8b5cf6]">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-[#8b5cf6]">
            Thank you for participating!
          </h3>
          <p className="text-xs text-[#8b5cf6] max-w-md mx-auto leading-relaxed">
            Your vote has been recorded and factored into the live class metrics
            below.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 w-full py-2">
          {/* Donut with expanded canvas for generous inner spacing */}
          <div className="relative flex items-center justify-center">
            <svg className="h-48 w-48 -rotate-90 transform overflow-visible">
              {/* 1. Thin Gray Background Circle */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                className="text-zinc-200/80"
                fill="transparent"
              />
              {/* 2. Custom Animated Purple Thick Donut Ring */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-[#8b5cf6] transition-all duration-300 ease-out"
                fill="transparent"
              />
            </svg>

            {/* 3. Passing indicator: radial tick + horizontal connector.
                Rendered in an unrotated overlay (own trig) so the connector
                stays truly horizontal and the label text is never sideways. */}
            <svg
              className="absolute inset-0 h-48 w-48 overflow-visible pointer-events-none"
              viewBox="0 0 192 192"
            >
              <line
                x1={tickX1}
                y1={tickY1}
                x2={tickX2}
                y2={tickY2}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-zinc-400 transition-all duration-700"
              />
              <line
                x1={tickX2}
                y1={tickY2}
                x2={labelLineX}
                y2={tickY2}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-zinc-400 transition-all duration-700"
              />
            </svg>

            <div
              className="absolute transition-all duration-700 pointer-events-none"
              style={{
                left: labelLineX,
                top: tickY2,
                transform: pointsRight
                  ? "translate(4px, -50%)"
                  : "translate(calc(-100% - 4px), -50%)",
              }}
            >
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase bg-white px-1.5 py-0.5 rounded shadow-2xs border border-zinc-200/60 whitespace-nowrap">
                Passing ({settings.passingScore}%)
              </span>
            </div>

            {/* Inner Content with comfortable distance from the donut track */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-[#8b5cf6]">
                {animatedPercentage}%
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Score
                </span>
                <button
                  type="button"
                  onClick={() => setShowBreakdown(true)}
                  className="text-zinc-400 hover:text-[#8b5cf6] transition-colors cursor-pointer"
                  title="View Exact Score Breakdown"
                >
                  <Info size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Restored Friendly Status Details */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center max-w-sm mt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#8b5cf6] border border-purple-200">
              <CheckCircle size={13} />
              <span>{isPassed ? "Goal Achieved!" : "Good Progress Made!"}</span>
            </span>
            <p className="text-xs text-zinc-500 leading-relaxed">
              The indicator line on your score ring highlights your target
              milestone of{" "}
              <span className="font-bold text-zinc-800">
                {settings.passingScore}%
              </span>
              . Click the info icon anytime to view detailed counts.
            </p>
          </div>

          {/* Try Again Button placed cleanly below */}
          {hasAttemptsRemaining && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 px-5 py-2.5 text-xs font-bold text-[#8b5cf6] active:scale-[0.98] transition-all cursor-pointer shadow-xs mt-2"
            >
              <RotateCcw size={13} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Interactive Breakdown Modal */}
      {showBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-zinc-200 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <Info size={16} className="text-[#8b5cf6]" />
                <span>Score Breakdown</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBreakdown(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                <span className="font-medium text-zinc-600">
                  Points Earned / Total
                </span>
                <span className="font-mono font-bold text-zinc-900">
                  {displayScoreText}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                <span className="font-medium text-zinc-600">
                  Correct Answers
                </span>
                <span className="font-mono font-bold text-[#8b5cf6]">
                  {correctCount} of {totalGraded} questions
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                <span className="font-medium text-zinc-600">
                  Target Milestone
                </span>
                <span className="font-mono font-bold text-zinc-900">
                  {settings.passingScore}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                <span className="font-medium text-zinc-600">Time Elapsed</span>
                <span className="font-mono font-bold text-zinc-900 flex items-center gap-1">
                  <Clock size={12} className="text-zinc-400" />
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBreakdown(false)}
              className="w-full py-2.5 bg-[#8b5cf6] text-white text-xs font-bold rounded-xl hover:bg-[#7c3aed] transition-colors cursor-pointer shadow-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
