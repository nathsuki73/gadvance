"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BookOpen, PlayCircle, CheckCircle2, Lock } from "lucide-react";

import type { LearningPlan } from "../../../types";
import EnrollmentRequiredDialog from "./EnrollmentRequiredDialog"; // Verify import path matches your system layout

type CourseModulePreviewProps = {
  course: LearningPlan;
  isLoggedIn: boolean;
  isEnrolled: boolean;
};

const CourseModulePreview = ({
  course,
  isEnrolled,
}: CourseModulePreviewProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const modulesList = course.modules || [];

  if (modulesList.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 font-light lowercase">
        no curriculum modules found for this learning plan.
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-l-4 border-[#8b5cf6] pl-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">
            Syllabus
          </h2>

          <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Instructional Roadmap
          </h3>
        </div>

        <div className="flex flex-col">
          {modulesList.map((module, index) => {
            // Layout classes applied equally to buttons and link anchors
            const itemClasses =
              "group w-full text-left flex justify-between items-center gap-8 py-6 border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 px-2";

            // Common child node structure
            const innerContent = (
              <>
                <div className="flex items-start gap-4 sm:gap-8">
                  <span className="text-xs font-mono font-bold text-zinc-300 pt-1">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      {index === 0 ? (
                        <BookOpen
                          size={16}
                          className="text-[#8b5cf6] shrink-0"
                        />
                      ) : (
                        <PlayCircle
                          size={16}
                          className="text-[#8b5cf6] shrink-0"
                        />
                      )}

                      <h4 className="text-base font-medium text-zinc-800 group-hover:text-[#8b5cf6] transition-colors">
                        {module.title}
                      </h4>
                    </div>

                    <p className="text-sm text-zinc-500 font-light leading-relaxed max-w-3xl">
                      {module.description ||
                        "Standard module overview and learning objectives."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  {isEnrolled ? (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                      strokeWidth={2}
                    />
                  ) : (
                    <Lock
                      size={16}
                      className="text-zinc-300 group-hover:text-zinc-400 transition-colors"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </>
            );

            // Conditional rendering path depending on active enrollment parameter check
            return isEnrolled ? (
              <Link
                key={module.id}
                href={`/explore/course/${course.id}/module/${module.id}`}
                className={itemClasses}
              >
                {innerContent}
              </Link>
            ) : (
              <button
                key={module.id}
                onClick={() => setIsDialogOpen(true)}
                className={itemClasses}
              >
                {innerContent}
              </button>
            );
          })}
        </div>
      </div>

      {/* Renders portal inline to toggle modal layer safely */}
      <EnrollmentRequiredDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        courseTitle={course.title}
      />
    </section>
  );
};

export default CourseModulePreview;
