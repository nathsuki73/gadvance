"use client";

import React from "react";
import {
  BrainCircuit,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export interface BktSkill {
  skillName: string;
  masteryProbability: number; // e.g., 0.85 for 85%
  status: "Mastered" | "In Progress" | "Needs Review";
}

interface DetailedSummaryProps {
  skillsBreakdown?: BktSkill[];
}

export function DetailedSummary({
  skillsBreakdown = [],
}: DetailedSummaryProps) {
  return (
    <div className="w-full space-y-4 text-left animate-in fade-in duration-200">
      <div className="space-y-1 px-1">
        <h3 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
          <BrainCircuit size={18} className="text-[#8b5cf6]" />
          <span>BKT Mastery Analytics</span>
        </h3>
        <p className="text-xs text-zinc-500">
          Real-time probability estimations of your skill levels based on
          performance.
        </p>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {skillsBreakdown.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-xs">
            No skill mastery data available for this attempt yet.
          </div>
        ) : (
          skillsBreakdown.map((skill, idx) => {
            const percentage = Math.round(skill.masteryProbability * 100);

            let badgeColor = "bg-purple-50 text-[#8b5cf6] border-purple-200";
            let IconComponent = TrendingUp;
            if (skill.status === "Mastered") {
              badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
              IconComponent = CheckCircle2;
            } else if (skill.status === "Needs Review") {
              badgeColor = "bg-rose-50 text-rose-600 border-rose-200";
              IconComponent = AlertCircle;
            }

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900">
                    {skill.skillName}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}
                  >
                    <IconComponent size={11} />
                    <span>{skill.status}</span>
                  </span>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-zinc-500 font-mono">
                    <span>Mastery Probability (P(L))</span>
                    <span className="text-zinc-900 font-bold">
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/70">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        skill.status === "Mastered"
                          ? "bg-emerald-500"
                          : skill.status === "Needs Review"
                            ? "bg-rose-500"
                            : "bg-[#8b5cf6]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
