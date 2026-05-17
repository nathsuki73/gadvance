"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

type SurveyOptionResult = {
  option_id: string;
  label: string;
  votes: number;
  percentage: number;
};

type SurveyQuestionResult = {
  question_id: string;
  question: string;
  total_votes: number;
  options: SurveyOptionResult[];
};

type SurveyResultsViewerProps = {
  title: string;
  results: SurveyQuestionResult[];
};

export default function SurveyResultsViewer({
  title,
  results,
}: SurveyResultsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = results[currentIndex];

  // Preserved the native capitalization structure of option.label
  const chartData = useMemo(() => {
    if (!currentQuestion) return [];
    return currentQuestion.options.map((option) => ({
      name: option.label,
      percentage: option.percentage,
      votes: option.votes,
    }));
  }, [currentQuestion]);

  const handleNext = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!results || results.length === 0 || !currentQuestion) {
    return (
      <div className="rounded-[32px] border border-dashed border-zinc-100 bg-white p-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-300">
          no quantitative dataset available
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-12 px-4 md:px-8 bg-white animate-fade-in">
      {/* Editorial Header Configuration */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00aeef]">
            {title}
          </span>
          <span className="text-xs text-zinc-400 font-light">
            metric {(currentIndex + 1).toString().padStart(2, "0")} of{" "}
            {results.length.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-50 border border-zinc-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <BarChart3 size={12} className="text-[#00aeef]" />
          dataset analytics
        </div>
      </div>

      {/* Primary Query Display */}
      <div className="mt-12">
        <h2 className="text-2xl font-light tracking-tight text-zinc-900 leading-snug">
          {currentQuestion.question}
        </h2>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 font-light">
          <Users size={14} className="text-zinc-300" />
          <span>
            {currentQuestion.total_votes} active sample responses analyzed
          </span>
        </div>
      </div>

      {/* Simplified, Single Clean Chart Representation */}
      <div className="mt-12 h-[280px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: -10, bottom: 10 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              width={140}
              tick={{ fill: "#52525b", fontWeight: 400 }}
            />
            <Tooltip
              cursor={{ fill: "#f4f4f5", opacity: 0.4 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-zinc-100 bg-white/90 p-3 shadow-xl backdrop-blur-md text-[11px] font-medium text-zinc-600">
                      <p className="font-semibold text-zinc-900">
                        {payload[0].name}
                      </p>
                      <p className="mt-1 text-[#00aeef]">
                        {payload[0].value}% ({payload[0].payload.votes} votes)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="percentage"
              barSize={14}
              radius={[10, 10, 10, 10]}
              background={{ fill: "#f4f4f5" }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? "#00aeef" : "#e4e4e7"}
                  className="transition-all duration-500"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Slider Navigation Panel */}
      <div className="mt-12 pt-6 border-t border-zinc-100 flex items-center justify-between">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={handlePrevious}
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-100 text-zinc-400 bg-white transition-all hover:text-zinc-800 hover:border-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
        >
          <ArrowLeft
            size={16}
            strokeWidth={1.5}
            className="transition-transform group-hover:-translate-x-0.5"
          />
        </button>

        <button
          type="button"
          disabled={currentIndex === results.length - 1}
          onClick={handleNext}
          className="group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-100 text-zinc-400 bg-white transition-all hover:text-zinc-800 hover:border-zinc-300 disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
        >
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
}
