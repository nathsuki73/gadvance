"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  CheckCircle2,
  Info,
  X,
  CheckCircle,
  Clock,
  ChevronRight,
  BookOpenText,
  ExternalLink,
} from "lucide-react";
import { AssessmentSettings } from "./types";
import Link from "next/link";

interface ResultsSummaryProps {
  scorePercentage: number;
  score?: number;
  totalPoints?: number;
  correctCount: number;
  totalGraded: number;
  totalQuestions: number;
  elapsedSeconds: number;
  settings: AssessmentSettings;
  onRetry: () => void;
  onNext: () => void;
  isPassed: boolean;
  isPoll: boolean;
  remedialSuggestions?: Array<{
    page_id: string;
    block_id: string;
    review_url?: string;
  }>;
  moduleId?: string;
}

// Spring/overshoot easing — this cubic-bezier is what gives the "pop" feel
const SPRING_EASE = "cubic-bezier(0.34,1.56,0.64,1)";
const STAGGER_MS = 220; // delay between each remedial block appearing

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
  onNext,
  isPassed,
  isPoll,
  remedialSuggestions = [],
  moduleId = "",
}: ResultsSummaryProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // ⏱️ State for toggling views ("score" vs "remedial")
  const [activeView, setActiveView] = useState<"score" | "remedial">("score");

  // 🔑 Flips to true the FIRST time the remedial tab is activated, and then
  // stays true forever — this is a one-shot switch, not a counter, so the
  // list mounts (and animates) exactly once no matter how many times the
  // user flips back and forth between tabs afterward.
  const [remedialUnlocked, setRemedialUnlocked] = useState(false);
  const hasActivatedRemedialOnce = useRef(false);

  const activateRemedial = () => {
    setActiveView("remedial");
    setRemedialUnlocked(true);
  };

  const hasAttemptsRemaining =
    settings.maxAttempts == null || settings.maxAttempts > 1;

  // 🔄 Auto-switch to Remedial view after 3 seconds if suggestions exist
  useEffect(() => {
    if (
      remedialSuggestions.length > 0 &&
      activeView === "score" &&
      !isPoll &&
      !hasActivatedRemedialOnce.current
    ) {
      const timer = setTimeout(() => {
        activateRemedial();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [remedialSuggestions, activeView, isPoll]);

  useEffect(() => {
    if (activeView === "remedial") {
      hasActivatedRemedialOnce.current = true;
    }
  }, [activeView]);

  // Score Animation Loop
  useEffect(() => {
    if (isPoll) return;
    let startTime: number | null = null;
    const duration = 1300;

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
  }, [scorePercentage, isPoll]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedPercentage / 100) * circumference;
  const passingScoreAngle = (settings.passingScore / 100) * 360;

  const donutCenter = 96;
  const passingAngleRad = (passingScoreAngle * Math.PI) / 180;
  const tickStartR = radius + 6;
  const tickEndR = radius + 18;
  const horizontalLength = 22;

  const tickX1 = donutCenter + tickStartR * Math.sin(passingAngleRad);
  const tickY1 = donutCenter - tickStartR * Math.cos(passingAngleRad);
  const tickX2 = donutCenter + tickEndR * Math.sin(passingAngleRad);
  const tickY2 = donutCenter - tickEndR * Math.cos(passingAngleRad);

  const pointsRight = Math.sin(passingAngleRad) >= 0;
  const labelLineX = pointsRight
    ? tickX2 + horizontalLength
    : tickX2 - horizontalLength;

  const displayScoreText =
    score !== undefined && totalPoints !== undefined
      ? `${score} / ${totalPoints}`
      : `${correctCount} / ${totalGraded}`;

  return (
    <div className="overflow-hidden p-6 space-y-6 flex flex-col items-center text-center w-full max-w-md mx-auto">
      {/* 1. Static View Switcher Tabs at the top */}
      {remedialSuggestions.length > 0 && !isPoll && (
        <div className="flex items-center justify-center gap-1.5 bg-zinc-100 p-1 rounded-2xl w-full max-w-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveView("score")}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
              activeView === "score"
                ? "bg-white text-zinc-900 shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Score Summary
          </button>
          <button
            type="button"
            onClick={activateRemedial}
            className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeView === "remedial"
                ? "bg-[#8b5cf6] text-white shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <BookOpenText size={12} />
            <span>Study ({Math.min(remedialSuggestions.length, 3)})</span>
          </button>
        </div>
      )}

      {/* 2. Stabilized Content Area (CSS Grid Stack to lock container height) */}
      <div className="grid grid-cols-1 grid-rows-1 w-full items-center justify-items-center">
        {/* View A: Score Summary */}
        <div
          className={`col-start-1 row-start-1 w-full transition-opacity duration-300 flex flex-col items-center space-y-6 ${
            activeView === "score"
              ? "opacity-100 z-10 pointer-events-auto"
              : "opacity-0 z-0 pointer-events-none select-none"
          }`}
        >
          {settings.type === "poll" && (
            <div className="w-full rounded-2xl border border-purple-200/85 bg-purple-50/50 p-6 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-[#8b5cf6]">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#8b5cf6]">
                Thank you for participating!
              </h3>
              <p className="text-xs text-[#8b5cf6] max-w-md mx-auto leading-relaxed">
                Your vote has been recorded and factored into the live class
                metrics below.
              </p>
            </div>
          )}

          {settings.type !== "poll" && (
            <div className="flex flex-col items-center justify-center gap-6 w-full py-2">
              {/* Donut Ring */}
              <div className="relative flex items-center justify-center">
                <svg className="h-48 w-48 -rotate-90 transform overflow-visible">
                  <circle
                    cx="96"
                    cy="96"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-zinc-200/80"
                    fill="transparent"
                  />
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

              {/* Status Details */}
              <div className="flex flex-col items-center justify-center space-y-2 text-center max-w-sm mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#8b5cf6] border border-purple-200">
                  <CheckCircle size={13} />
                  <span>
                    {isPassed ? "Goal Achieved!" : "Good Progress Made!"}
                  </span>
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
            </div>
          )}
        </div>

        {/* View B: Targeted Plan (Vertical List Stack) */}
        {remedialSuggestions.length > 0 && !isPoll && (
          <div
            className={`col-start-1 row-start-1 w-full transition-opacity duration-300 flex flex-col space-y-2.5 ${
              activeView === "remedial"
                ? "opacity-100 z-10 pointer-events-auto"
                : "opacity-0 z-0 pointer-events-none select-none"
            }`}
          >
            {/* 🔑 Mounted once, the first time this tab is activated, and
                never remounted (no `key` churn) — so AnimatedRemedialList's
                internal stagger effect runs exactly one time. Switching back
                and forth to this tab afterward just toggles opacity on an
                already-fully-visible, already-settled list. */}
            {remedialUnlocked && (
              <AnimatedRemedialList
                suggestions={remedialSuggestions}
                moduleId={moduleId}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. Static Action Buttons Container (Locked at the bottom) */}
      <div className="flex flex-col gap-3 w-full pt-2 shrink-0">
        {hasAttemptsRemaining && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-purple-100 hover:bg-purple-200 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#8b5cf6] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
        )}

        {isPoll || !settings.requirePassingToProceed || isPassed ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#8b5cf6]/20 transition-all cursor-pointer hover:bg-[#7c3aed] active:scale-[0.98]"
          >
            <span>Continue</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="space-y-2 text-center w-full">
            <button
              type="button"
              disabled
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-zinc-200 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 cursor-not-allowed opacity-75"
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Breakdown Modal */}
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
                <span className="font-medium text-zinc-600">Score</span>
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

/**
 * Renders the remedial suggestion blocks one after another with a
 * spring/overshoot pop-in without sequence numbers.
 */
function AnimatedRemedialList({
  suggestions,
  moduleId,
}: {
  suggestions: Array<{
    page_id: string;
    block_id: string;
    review_url?: string;
    title?: string;
    excerpt?: string;
  }>;
  moduleId: string;
}) {
  const items = suggestions.slice(0, 3);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((_, idx) => {
      const t = setTimeout(() => {
        setVisibleCount((prev) => Math.max(prev, idx + 1));
      }, idx * STAGGER_MS);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 w-full">
      {/* Friendly Explanatory Header */}
      <div className="space-y-1 px-1 text-left">
        <h3 className="text-sm sm:text-base font-bold text-zinc-800">
          Let&apos;s review these key concepts
        </h3>
        <p className="text-xs text-zinc-500">
          Click any section below to jump straight to the exact concept you
          missed.
        </p>
      </div>

      {/* Vertical List Stack */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const reviewUrl = `/learn/${moduleId}?item=${item.page_id}#${item.block_id}`;
          const isVisible = idx < visibleCount;

          const displayTitle = item.title || "Concept Review Section";
          const displaySubtitle =
            item.excerpt || "Click to review specific concept block";

          return (
            <div
              key={idx}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? "scale(1) translateY(0px)"
                  : "scale(0.85) translateY(10px)",
                transitionProperty: "opacity, transform",
                transitionDuration: "550ms",
                transitionTimingFunction: SPRING_EASE,
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              <Link
                href={reviewUrl}
                className="group relative flex items-center justify-between rounded-2xl border-2 border-zinc-200/80 bg-white p-4 text-xs font-medium text-zinc-800 transition-all hover:border-[#8b5cf6] hover:bg-purple-50/20 hover:shadow-md hover:-translate-y-0.5 cursor-pointer w-full text-left"
              >
                <div className="flex items-center gap-3.5 pr-2">
                  <div>
                    <span className="block font-bold text-zinc-900 group-hover:text-[#8b5cf6] transition-colors text-xs sm:text-sm line-clamp-1">
                      {displayTitle}
                    </span>
                    <span className="block text-[11px] text-zinc-400 font-normal mt-0.5 line-clamp-1">
                      {displaySubtitle}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3.5 py-2 text-xs font-bold text-[#8b5cf6] group-hover:bg-[#8b5cf6] group-hover:text-white transition-all shadow-xs shrink-0">
                  <span>Review</span>
                  <ExternalLink
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
