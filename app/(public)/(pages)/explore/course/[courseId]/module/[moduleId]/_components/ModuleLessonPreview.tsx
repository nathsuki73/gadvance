"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import { ModuleResponse } from "../types";
import { getStaticTest } from "../service";

type ModuleLessonPreviewProps = {
  module: ModuleResponse;
};

const ModuleLessonPreview = ({ module }: ModuleLessonPreviewProps) => {
  const lessons = module.lessons || [];

  const [hasPreTest, setHasPreTest] = useState(false);
  const [hasPostTest, setHasPostTest] = useState(false);

  useEffect(() => {
    const checkAssessments = async () => {
      try {
        const [preRes, postRes] = await Promise.all([
          getStaticTest(module.id, "pre_test"),
          getStaticTest(module.id, "post_test"),
        ]);

        if (preRes.success && preRes.data) setHasPreTest(true);
        if (postRes.success && postRes.data) setHasPostTest(true);
      } catch (err) {
        console.error("Evaluation status check failed", err);
      }
    };
    checkAssessments();
  }, [module.id]);

  if (lessons.length === 0 && !hasPreTest && !hasPostTest) {
    return (
      <div className="text-center py-12 text-zinc-400 font-light lowercase">
        no content found for this module.
      </div>
    );
  }

  // 💡 Initialize our dynamic incremental tracking counter
  let runningIndex = 0;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto md:px-12 px-6">
        {/* Module Header Elements */}
        <div className="mb-12 border-l-4 border-[#8b5cf6] pl-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">
            Module Contents
          </h2>
          <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Lessons Outline
          </h3>
        </div>

        {/* Unified Contents List */}
        <div className="flex flex-col">
          {/* 💡 ENTRY MILESTONE: Course Entry Pre-test */}
          {hasPreTest &&
            (() => {
              const currentNum = runningIndex++; // Grab 00, then increment to 1
              return (
                <Link
                  href={`/courses/${module.id}/static-test/pre_test`}
                  className="group flex justify-between items-center gap-8 py-6 border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 px-2"
                >
                  <div className="flex items-start gap-4 sm:gap-8">
                    <span className="text-xs font-mono font-bold text-zinc-300 pt-1">
                      {currentNum.toString().padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck
                          size={16}
                          className="text-[#8b5cf6] shrink-0"
                        />
                        <h4 className="text-base font-medium text-zinc-800 group-hover:text-[#8b5cf6] transition-colors">
                          Course Entry Pre-test
                        </h4>
                      </div>
                      <p className="text-sm text-zinc-400 font-light lowercase">
                        baseline diagnostic evaluation assessment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <ChevronRight
                      size={16}
                      className="text-zinc-300 group-hover:text-[#8b5cf6] transition-colors"
                    />
                  </div>
                </Link>
              );
            })()}

          {/* CORE CURRICULUM LESSONS */}
          {lessons.map((lesson) => {
            const stepsCount =
              (lesson.blocks?.length || 0) + (lesson.quiz_blocks?.length || 0);

            const currentNum = runningIndex++; // Dynamic index pickup

            return (
              <Link
                key={lesson.id}
                href={`/courses/${module.id}/lessons/${lesson.id}`}
                className="group flex justify-between items-center gap-8 py-6 border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 px-2"
              >
                {/* LEFT SIDE */}
                <div className="flex items-start gap-4 sm:gap-8">
                  <span className="text-xs font-mono font-bold text-zinc-300 pt-1">
                    {currentNum.toString().padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <BookOpen size={16} className="text-[#8b5cf6] shrink-0" />
                      <h4 className="text-base font-medium text-zinc-800 group-hover:text-[#8b5cf6] transition-colors">
                        {lesson.title}
                      </h4>
                    </div>

                    <p className="text-sm text-zinc-500 font-light lowercase">
                      {stepsCount} learning{" "}
                      {stepsCount === 1 ? "step" : "steps"}
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-4 shrink-0">
                  <CheckCircle2
                    size={18}
                    className="text-emerald-500"
                    strokeWidth={2}
                  />
                  <ChevronRight
                    size={16}
                    className="text-zinc-300 group-hover:text-[#8b5cf6] transition-colors"
                  />
                </div>
              </Link>
            );
          })}

          {/* 💡 EXIT MILESTONE: Course Final Post-test */}
          {hasPostTest &&
            (() => {
              const currentNum = runningIndex++; // Grab last sequential number
              return (
                <Link
                  href={`/courses/${module.id}/static-test/post_test`}
                  className="group flex justify-between items-center gap-8 py-6 border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 px-2"
                >
                  <div className="flex items-start gap-4 sm:gap-8">
                    <span className="text-xs font-mono font-bold text-zinc-300 pt-1">
                      {currentNum.toString().padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <GraduationCap
                          size={16}
                          className="text-[#8b5cf6] shrink-0"
                        />
                        <h4 className="text-base font-medium text-zinc-800 group-hover:text-[#8b5cf6] transition-colors">
                          Course Final Post-test
                        </h4>
                      </div>
                      <p className="text-sm text-zinc-400 font-light lowercase">
                        comprehensive final core milestone evaluation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <ChevronRight
                      size={16}
                      className="text-zinc-300 group-hover:text-[#8b5cf6] transition-colors"
                    />
                  </div>
                </Link>
              );
            })()}
        </div>
      </div>
    </section>
  );
};

export default ModuleLessonPreview;
