"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  CircleDot,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface BktSkill {
  id: string;
  name: string;
  masteryProbability: number;
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
      "Evaluated based on your answers in this assessment attempt.",
    history: [0.45, 0.88],
    nextStep: "You've mastered this concept!",
  },
];

const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

// Helper function for Red -> Orange -> Yellow -> Green scale (75+ is green)
const getProgressStyle = (pct: number) => {
  if (pct >= 75) {
    return { bg: "bg-emerald-500", text: "text-emerald-600" };
  } else if (pct >= 50) {
    return { bg: "bg-amber-500", text: "text-amber-600" };
  } else if (pct >= 25) {
    return { bg: "bg-orange-500", text: "text-orange-600" };
  } else {
    return { bg: "bg-rose-500", text: "text-rose-600" };
  }
};

export function DetailedSummary({
  skillsBreakdown,
  totalTimeSeconds = 0,
  averageTimeSeconds = 0,
  fastestTimeSeconds = 0,
  slowestTimeSeconds = 0,
  scorePercentage = 0,
  correctAnswersCount = 0,
  totalQuestionsCount = 0,
}: DetailedSummaryProps) {
  const skills = skillsBreakdown?.length ? skillsBreakdown : MOCK_SKILLS;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const masteredCount = skills.filter(
    (s) => s.masteryProbability >= 0.75,
  ).length;

  const passed = scorePercentage >= 75;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 w-full text-left max-h-[440px] overflow-y-auto pr-1">
      {/* --- Score & Time Breakdown Groups --- */}
      <div className="px-1 space-y-3 pb-4 border-b border-zinc-100">
        {/* Group 1: Score Breakdown */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-extrabold tracking-tight text-zinc-900">
            Score breakdown
          </h4>
          <div className="flex flex-col gap-1.5 text-xs pt-0.5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-medium">Status:</span>
              <span
                className={`font-bold ${
                  passed ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {passed ? "Passed" : "Failed"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-medium">Score:</span>
              <span className="font-semibold text-zinc-800">
                {correctAnswersCount}/{totalQuestionsCount} ({scorePercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Group 2: Time Details */}
        <div className="space-y-1.5 pt-2">
          <h4 className="text-sm font-extrabold tracking-tight text-zinc-900">
            Time details
          </h4>
          <div className="flex flex-col gap-1.5 text-xs pt-0.5">
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Total time:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(totalTimeSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Avg / question:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(averageTimeSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Fastest:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(fastestTimeSeconds)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Slowest:</span>
              <span className="font-semibold text-zinc-800">
                {formatTime(slowestTimeSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Skill Breakdown Header --- */}
      <div className="px-1 pt-1">
        <h4 className="text-sm font-extrabold tracking-tight text-zinc-900">
          Skill breakdown
        </h4>
        <p className="text-xs text-zinc-500 font-medium">
          {masteredCount} of {skills.length} skills mastered. Click a skill for
          details.
        </p>
      </div>

      {/* --- Skill Breakdown Cards --- */}
      {skills.map((skill) => {
        const pct = Math.round(skill.masteryProbability * 100);
        const before = Math.round(
          (skill.previousMastery ?? skill.history[0] ?? 0) * 100,
        );
        const delta = pct - before;
        const mastered = pct >= 75;
        const isExpanded = expandedId === skill.id;

        const style = getProgressStyle(pct);
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
            className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-2xs transition-all"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleExpand(skill.id)}
              className="flex items-center gap-3 text-left cursor-pointer select-none"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-zinc-900 truncate">
                      {skill.name}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronDown
                        size={14}
                        className="text-zinc-400 shrink-0"
                      />
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-black ${style.text} shrink-0`}
                  >
                    {mastered ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <CircleDot size={12} />
                    )}
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${style.bg}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold pt-0.5">
                  <span className={deltaColor}>
                    <TrendIcon size={12} className="inline mr-0.5" />
                    {before}% to {pct}% ({delta > 0 ? "+" : ""}
                    {delta})
                  </span>
                  <span className="text-zinc-400 font-normal">
                    {skill.questionsAttempted}{" "}
                    {skill.questionsAttempted === 1 ? "question" : "questions"}{" "}
                    tested
                  </span>
                </div>
              </div>
            </div>

            {/* Minimal Expanded Details Section */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-zinc-100 space-y-1.5 text-[11px] text-zinc-600 animate-in fade-in duration-300">
                <p>{skill.decisionRationale}</p>
                {skill.nextStep && (
                  <p>
                    <span className="font-semibold text-zinc-800">
                      Next step:
                    </span>{" "}
                    {skill.nextStep}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
