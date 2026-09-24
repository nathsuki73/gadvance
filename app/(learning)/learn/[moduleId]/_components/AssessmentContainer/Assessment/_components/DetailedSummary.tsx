"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
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
  // Per-question results for this skill, tagged with Bloom's level
  questions?: { level: string; correct: boolean }[];
  nextStep?: string;
  telemetry?: {
    initialMastery: number; // P(L0)
    transitRate: number; // P(T)
    slipRate: number; // P(S)
    guessRate: number; // P(G)
    modelConfidence: string;
  };
}

interface DetailedSummaryProps {
  skillsBreakdown?: BktSkill[];
}

// Dummy data (used when no skills are passed)
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

// P(correct next) = P(L)(1 - slip) + (1 - P(L)) * guess
const predictNext = (s: BktSkill) =>
  s.telemetry
    ? Math.round(
        (s.masteryProbability * (1 - s.telemetry.slipRate) +
          (1 - s.masteryProbability) * s.telemetry.guessRate) *
          100,
      )
    : null;

export function DetailedSummary({ skillsBreakdown }: DetailedSummaryProps) {
  const skills = skillsBreakdown?.length ? skillsBreakdown : MOCK_SKILLS;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modelOpen, setModelOpen] = useState<string | null>(null);

  const masteredCount = skills.filter(
    (s) => s.masteryProbability >= 0.8,
  ).length;

  return (
    <div className="space-y-3 w-full text-left max-h-[440px] overflow-y-auto pr-1">
      <div className="px-1">
        <h4 className="text-sm font-bold text-zinc-900">Skill breakdown</h4>
        <p className="text-xs text-zinc-500">
          {masteredCount} of {skills.length} skills mastered. Tap a skill for
          details.
        </p>
      </div>

      {skills.map((skill) => {
        const pct = Math.round(skill.masteryProbability * 100);
        const before = Math.round(
          (skill.previousMastery ?? skill.history[0] ?? 0) * 100,
        );
        const delta = pct - before;
        const mastered = pct >= 80;
        const open = expandedId === skill.id;
        const next = predictNext(skill);
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
            className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 hover:border-[#8b5cf6]/40 transition-colors"
          >
            <button
              type="button"
              onClick={() => setExpandedId(open ? null : skill.id)}
              aria-expanded={open}
              className="w-full flex items-center gap-3 text-left cursor-pointer"
            >
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
              {open ? (
                <ChevronUp size={16} className="text-zinc-400" />
              ) : (
                <ChevronDown size={16} className="text-zinc-400" />
              )}
            </button>

            {open && (
              <div className="mt-3 pt-3 border-t border-zinc-100 space-y-3 text-xs">
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {skill.decisionRationale}
                </p>

                {skill.questions && (
                  <div className="flex flex-wrap gap-1.5">
                    {skill.questions.map((q, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          q.correct
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {q.level} {q.correct ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-1.5 h-12 bg-zinc-50 p-2 rounded-xl border border-zinc-200/60">
                  {skill.history.map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full flex flex-col justify-end items-center gap-0.5"
                    >
                      <span className="text-[8px] font-bold text-zinc-500">
                        {Math.round(val * 100)}
                      </span>
                      <div
                        className={`w-full rounded-xs ${val >= 0.8 ? "bg-emerald-500" : "bg-[#8b5cf6]"}`}
                        style={{
                          height: `${Math.max(Math.round(val * 70), 8)}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {next !== null && (
                  <div className="flex items-center justify-between bg-purple-50/60 border border-purple-100 rounded-xl px-3 py-2">
                    <span className="text-[11px] text-zinc-600">
                      Chance of getting the next one right
                    </span>
                    <span className="text-sm font-black text-[#8b5cf6]">
                      {next}%
                    </span>
                  </div>
                )}

                {skill.nextStep && (
                  <div className="flex gap-2 items-start text-[11px] text-zinc-700">
                    <Lightbulb
                      size={13}
                      className="text-[#8b5cf6] mt-0.5 shrink-0"
                    />
                    <span>{skill.nextStep}</span>
                  </div>
                )}

                {skill.telemetry && (
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setModelOpen(modelOpen === skill.id ? null : skill.id)
                      }
                      className="text-[10px] font-bold text-zinc-400 hover:text-[#8b5cf6] cursor-pointer"
                    >
                      {modelOpen === skill.id
                        ? "Hide model details"
                        : "Show model details"}
                    </button>
                    {modelOpen === skill.id && (
                      <div className="mt-1.5 grid grid-cols-3 gap-1.5 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/60 text-[11px]">
                        {[
                          ["Start (L0)", skill.telemetry.initialMastery],
                          ["Learn (T)", skill.telemetry.transitRate],
                          ["Slip (S)", skill.telemetry.slipRate],
                          ["Guess (G)", skill.telemetry.guessRate],
                        ].map(([label, v]) => (
                          <div key={label as string}>
                            <span className="text-zinc-400 block text-[9px] uppercase">
                              {label}
                            </span>
                            <span className="font-bold text-zinc-800">
                              {Math.round((v as number) * 100)}%
                            </span>
                          </div>
                        ))}
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase">
                            Confidence
                          </span>
                          <span className="font-bold text-[#8b5cf6]">
                            {skill.telemetry.modelConfidence}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
