"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock3,
  BookOpen,
  PlayCircle,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

// Explicit data structural signatures modeled precisely from your clean schema types
export type Block = {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  order_index: number;
  progress?: {
    completed: boolean;
    completed_at?: string | null;
  };
};

export type QuizBlock = {
  id: string;
  lesson_id: string;
  bloom_tier: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  blocks: Block[];
  quiz_blocks: QuizBlock[];
  progress?: {
    completed_blocks: number;
    total_blocks: number;
    percentage: number;
  };
};

export type ModuleProgressResponse = {
  completed_blocks: number;
  total_blocks: number;
  percentage: number;
};

export type ModuleResponse = {
  id: string;
  title: string;
  about?: string | null;
  description?: string | null;
  image?: string | null;
  lessons: Lesson[];
  progress?: ModuleProgressResponse | null;
};

type ModuleOverviewHeaderProps = {
  module: ModuleResponse;
};

const ModuleOverviewHeader = ({ module }: ModuleOverviewHeaderProps) => {
  const router = useRouter();

  const lessonsCount = module.lessons?.length || 0;
  const progress = module.progress?.percentage || 0;
  const lessons = module.lessons || [];

  let runningIndex = 0;

  const handleContinueLearning = () => {
    router.push(`/learn/${module.id}`);
  };

  return (
    <section className="border-b border-zinc-100 bg-linear-to-b from-white via-white to-zinc-50/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:py-20">
        {/* LEFT PANEL: CONTENT HERO */}
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium text-zinc-500">
              Module Journey
            </span>
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl leading-[1.1]">
            {module.title}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 font-light md:text-lg">
            {module.about ||
              "A focused learning path built to guide you through the core ideas and activities of this module."}
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 font-light">
            {module.description ||
              "Move through the lessons at your own pace and keep track of your progress from one section to the next."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleContinueLearning}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98]"
            >
              Continue Learning
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 max-w-md">
            <StatCard
              icon={<BookOpen className="h-4 w-4" />}
              label="lessons"
              value={String(lessonsCount)}
            />
            <StatCard
              icon={<Clock3 className="h-4 w-4" />}
              label="progress"
              value={`${progress}%`}
            />
          </div>
        </div>

        {/* RIGHT PANEL: UNIFIED ROADMAP SECTION */}
        <div className="min-w-0 lg:border-l lg:border-zinc-100 lg:pl-26">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-12 w-0.5 rounded-full bg-primary" />
            <div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                Lessons Outline
              </h2>
            </div>
          </div>

          <div className="mt-10 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
            <div className="flex flex-col">
              {/* ENTRY MILESTONE: Course Entry Pre-test */}
              {(() => {
                const currentNum = runningIndex++;
                return (
                  <div className="group flex w-full border-b border-zinc-100 py-6 text-left transition-all hover:bg-zinc-50/50 rounded-xl px-2 -mx-2">
                    <div className="grid grid-cols-[auto_1fr_auto] gap-5 w-full items-start">
                      <span className="pt-0.5 pl-3 pr-3 text-xs font-bold tracking-widest text-zinc-300 font-mono min-w-[24px]">
                        {currentNum.toString().padStart(2, "0")}
                      </span>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <ClipboardCheck
                            size={15}
                            className="text-[#8b5cf6] shrink-0 mt-0.5"
                          />
                          <h3 className="text-[0.95rem] font-medium tracking-tight text-zinc-800 group-hover:text-[#8b5cf6] transition-colors duration-200 truncate">
                            Course Entry Pre-test
                          </h3>
                        </div>
                        <p className="text-xs font-light leading-relaxed text-zinc-400 pr-4 mt-1">
                          baseline diagnostic evaluation assessment
                        </p>
                      </div>
                      <div className="shrink-0 self-center pl-2">
                        <ChevronRight
                          size={14}
                          className="text-zinc-300 group-hover:text-zinc-400 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* CORE CURRICULUM LESSONS */}
              {lessons.map((lesson) => {
                const stepsCount =
                  (lesson.blocks?.length || 0) +
                  (lesson.quiz_blocks?.length || 0);
                const currentNum = runningIndex++;

                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${module.id}/lessons/${lesson.id}`}
                    className="group flex w-full border-b border-zinc-100 py-6 text-left transition-all hover:bg-zinc-50/50 rounded-xl px-2 -mx-2"
                  >
                    <div className="grid grid-cols-[auto_1fr_auto] gap-5 w-full items-start">
                      <span className="pt-0.5 pl-3 pr-3 text-xs font-bold tracking-widest text-zinc-300 font-mono min-w-[24px]">
                        {currentNum.toString().padStart(2, "0")}
                      </span>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <PlayCircle
                            size={15}
                            className="shrink-0 text-[#8b5cf6] mt-0.5"
                          />
                          <h3 className="text-[0.95rem] font-medium tracking-tight text-zinc-800 group-hover:text-[#8b5cf6] transition-colors duration-200 truncate">
                            {lesson.title}
                          </h3>
                        </div>
                        <p className="text-xs font-light leading-relaxed text-zinc-400 pr-4 mt-1">
                          {stepsCount} learning{" "}
                          {stepsCount === 1 ? "step" : "steps"}
                        </p>
                      </div>
                      <div className="shrink-0 self-center pl-2">
                        <ChevronRight
                          size={14}
                          className="text-zinc-300 group-hover:text-zinc-400 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* EXIT MILESTONE: Course Final Post-test */}
              {(() => {
                const currentNum = runningIndex++;
                return (
                  <div className="group flex w-full border-b border-zinc-100 py-6 text-left transition-all hover:bg-zinc-50/50 rounded-xl px-2 -mx-2">
                    <div className="grid grid-cols-[auto_1fr_auto] gap-5 w-full items-start">
                      <span className="pt-0.5 pl-3 pr-3 text-xs font-bold tracking-widest text-zinc-300 font-mono min-w-[24px]">
                        {currentNum.toString().padStart(2, "0")}
                      </span>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <GraduationCap
                            size={15}
                            className="text-[#8b5cf6] shrink-0 mt-0.5"
                          />
                          <h3 className="text-[0.95rem] font-medium tracking-tight text-zinc-800 group-hover:text-[#8b5cf6] transition-colors duration-200 truncate">
                            Course Final Post-test
                          </h3>
                        </div>
                        <p className="text-xs font-light leading-relaxed text-zinc-400 pr-4 mt-1">
                          comprehensive final core milestone evaluation
                        </p>
                      </div>
                      <div className="shrink-0 self-center pl-2">
                        <ChevronRight
                          size={14}
                          className="text-zinc-300 group-hover:text-zinc-400 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-xs">
    <div className="flex items-center gap-2 text-zinc-400">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-[0.25em]">
        {label}
      </span>
    </div>
    <div className="mt-2.5 text-lg font-semibold tracking-tight text-zinc-900">
      {value}
    </div>
  </div>
);

export default ModuleOverviewHeader;
