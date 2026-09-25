"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export interface BktSkill {
  id: string;
  name: string;
  masteryProbability: number; // 0 to 1
  previousMastery?: number;
  trend: "improving" | "stable" | "declining";
  questionsAttempted: number;
  decisionRationale: string;
  history: number[];
  questions?: { level: string; correct: boolean }[];
  nextStep?: string;
  telemetry?: {
    initialMastery: number;
    transitRate: number;
    slipRate: number;
    guessRate: number;
    modelConfidence: string;
  };
}

interface DetailedSummaryProps {
  skillsBreakdown?: BktSkill[];
  totalTimeSeconds?: number;
  averageTimeSeconds?: number;
  fastestTimeSeconds?: number;
  slowestTimeSeconds?: number;
  scorePercentage?: number;
  correctAnswersCount?: number;
  totalQuestionsCount?: number;
}

const MOCK_SKILLS: BktSkill[] = [
  {
    id: "skill-1",
    name: "State Management & React Hooks",
    masteryProbability: 0.88,
    previousMastery: 0.45,
    trend: "improving",
    questionsAttempted: 4,
    decisionRationale:
      "Strong useEffect answers led the engine to skip basics and serve custom hook debugging.",
    history: [0.45, 0.62, 0.78, 0.88],
    questions: [
      { level: "Remember", correct: true },
      { level: "Understand", correct: true },
      { level: "Apply", correct: true },
      { level: "Analyze", correct: true },
    ],
    nextStep: "You're ready for advanced hook patterns.",
    telemetry: {
      initialMastery: 0.2,
      transitRate: 0.35,
      slipRate: 0.1,
      guessRate: 0.2,
      modelConfidence: "96% High",
    },
  },
  {
    id: "skill-2",
    name: "Component Lifecycle & Rendering",
    masteryProbability: 0.74,
    previousMastery: 0.5,
    trend: "stable",
    questionsAttempted: 3,
    decisionRationale:
      "Consistent on mounting; the engine tested unmounting edge cases to confirm mastery.",
    history: [0.5, 0.68, 0.74],
    questions: [
      { level: "Remember", correct: true },
      { level: "Apply", correct: true },
      { level: "Analyze", correct: false },
    ],
    nextStep: "One more Analyze question on unmounting would confirm mastery.",
    telemetry: {
      initialMastery: 0.3,
      transitRate: 0.25,
      slipRate: 0.15,
      guessRate: 0.25,
      modelConfidence: "89% Stable",
    },
  },
  {
    id: "skill-3",
    name: "Context API & Performance",
    masteryProbability: 0.52,
    previousMastery: 0.7,
    trend: "declining",
    questionsAttempted: 3,
    decisionRationale:
      "Missed re-render optimization items, so the engine stepped back to memoization basics.",
    history: [0.7, 0.6, 0.52],
    questions: [
      { level: "Understand", correct: true },
      { level: "Apply", correct: false },
      { level: "Evaluate", correct: false },
    ],
    nextStep: "Review useMemo and useCallback, then retry.",
    telemetry: {
      initialMastery: 0.4,
      transitRate: 0.15,
      slipRate: 0.2,
      guessRate: 0.3,
      modelConfidence: "83% Volatile",
    },
  },
];

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

export function DetailedSummary({
  skillsBreakdown,
  totalTimeSeconds = 345,
  averageTimeSeconds = 35,
  fastestTimeSeconds = 18,
  slowestTimeSeconds = 62,
  scorePercentage = 78,
  correctAnswersCount = 7,
  totalQuestionsCount = 10,
}: DetailedSummaryProps) {
  const skills = skillsBreakdown?.length ? skillsBreakdown : MOCK_SKILLS;

  const masteredCount = skills.filter(
    (s) => s.masteryProbability >= 0.8,
  ).length;

  const passed = scorePercentage >= 75;

  return (
    <div className="space-y-4 w-full text-left max-h-[440px] overflow-y-auto pr-1">
      {/* --- Score & Time Breakdown Groups --- */}
      <div className="px-1 space-y-3 pb-4 border-b border-zinc-100">
        {/* Group 1: Score Breakdown */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-zinc-900">Score breakdown</h4>
          <div className="flex flex-col gap-1.5 text-xs pt-0.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Status:</span>
              <span
                className={`font-bold ${
                  passed ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {passed ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Score:</span>
              <span className="font-semibold text-zinc-800">
                {correctAnswersCount}/{totalQuestionsCount} ({scorePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Group 2: Time Details */}
        <div className="space-y-1.5 pt-2">
          <h4 className="text-sm font-bold text-zinc-900">Time details</h4>
          <div className="flex flex-col gap-1.5 text-xs pt-0.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Total time:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(totalTimeSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Avg / question:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(averageTimeSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Fastest:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(fastestTimeSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Slowest:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(slowestTimeSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Skill Breakdown Header --- */}
      <div className="px-1 pt-1">
        <h4 className="text-sm font-bold text-zinc-900">Skill breakdown</h4>
        <p className="text-xs text-zinc-500">
          {masteredCount} of {skills.length} skills mastered.
        </p>
      </div>

      {/* --- Skill Breakdown Cards --- */}
      {skills.map((skill) => {
        const pct = Math.round(skill.masteryProbability * 100);
        const before = Math.round(
          (skill.previousMastery ?? skill.history[0] ?? 0) * 100,
        );
        const delta = pct - before;
        const mastered = pct >= 80;
        const TrendIcon =
          delta > 2 ? TrendingUp : delta < -2 ? TrendingDown : Minus;
        const deltaColor =
          delta > 2
            ? "text-emerald-600"
            : delta < -2
              ? "text-amber-600"
              : "text-zinc-400";

        return (
          <div
            key={skill.id}
            className="rounded-2xl border border-zinc-200/80 bg-white p-3.5"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-zinc-900 truncate">
                    {skill.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black ${mastered ? "text-emerald-600" : "text-[#8b5cf6]"}`}
                  >
                    {mastered ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${mastered ? "bg-emerald-500" : "bg-[#8b5cf6]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold ${deltaColor}`}
                >
                  <TrendIcon size={12} />
                  {before}% to {pct}% ({delta > 0 ? "+" : ""}
                  {delta})
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
