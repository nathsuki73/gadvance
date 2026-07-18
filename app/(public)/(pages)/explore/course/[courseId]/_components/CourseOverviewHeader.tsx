"use client";

import React from "react";
import {
  Clock3,
  Users,
  BadgeCheck,
  BookOpen,
  PlayCircle,
  LockKeyhole,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import EnrollmentRequiredDialog from "./EnrollmentRequiredDialog";
import { useCourseEnrollment } from "../_hooks/useCourseEnrollment";
import type { Enrollment, LearningPlan } from "../types";

type CourseOverviewHeaderProps = {
  course: LearningPlan;
  isLoggedIn: boolean;
  initialEnrollment: Enrollment | null;
  onEnrollSuccess?: () => void;
};

const CourseOverviewHeader = ({
  course,
  isLoggedIn,
  initialEnrollment, // <-- Destructure it here
  onEnrollSuccess,
}: CourseOverviewHeaderProps) => {
  const {
    enrolledCount,
    isSubmitting,
    showActionDialog,
    dialogVariant,
    isEnrolled,
    isCompleted,
    progress,
    setShowActionDialog,
    handlePrimaryAction,
    handleUnenrollClick,
    handleConfirmAction,
  } = useCourseEnrollment({
    course,
    isLoggedIn,
    initialEnrollment,
    onEnrollSuccess,
  });

  return (
    <>
      <section className="border-b border-zinc-100 bg-linear-to-b from-white via-white to-zinc-50/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:py-20">
          {/* LEFT PANEL: CONTENT HERO */}
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
              {course.tag ? (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium text-zinc-500">
                  {course.tag}
                </span>
              ) : null}
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl leading-[1.1]">
              {course.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 font-light md:text-lg">
              {course.description ||
                "Explore the course structure, progress tracking, and the next step in your learning path."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98]"
              >
                {isEnrolled ? "View Modules" : "Enroll Now"}
              </button>

              {isEnrolled ? (
                <button
                  type="button"
                  onClick={handleUnenrollClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
                >
                  Unenroll
                </button>
              ) : null}
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <StatCard
                icon={<Users className="h-4 w-4" />}
                label="enrolled"
                value={String(enrolledCount)}
              />
              <StatCard
                icon={<Clock3 className="h-4 w-4" />}
                label="progress"
                value={`${progress}%`}
              />
              <StatCard
                icon={<BadgeCheck className="h-4 w-4" />}
                label="status"
                value={
                  isCompleted ? "completed" : isEnrolled ? "active" : "open"
                }
              />
            </div>
          </div>

          {/* RIGHT PANEL: SYLLABUS ROADMAP SECTION */}
          <div className="min-w-0 lg:border-l lg:border-zinc-100 lg:pl-26">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-12 w-0.5 rounded-full bg-primary" />
              <div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                  Module Overview
                </h2>
              </div>
            </div>

            <div className="mt-10 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
              {course.modules?.length ? (
                <div className="flex flex-col">
                  {course.modules.map((module, index) => {
                    const moduleRow = (
                      <div className="grid grid-cols-[auto_1fr_auto] gap-5 w-full items-start">
                        {/* Number Indicator */}
                        <span className="pt-0.5 pl-3 pr-3 text-xs font-bold tracking-widest text-zinc-300 font-mono min-w-[24px]">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>

                        {/* Title & Description */}
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            {index === 0 ? (
                              <BookOpen
                                size={15}
                                className="shrink-0 text-[#8b5cf6] mt-0.5"
                              />
                            ) : (
                              <PlayCircle
                                size={15}
                                className="shrink-0 text-[#8b5cf6] mt-0.5"
                              />
                            )}
                            <h3 className="text-[0.95rem] font-medium tracking-tight text-zinc-800 group-hover:text-[#8b5cf6] transition-colors duration-200 truncate">
                              {module.title}
                            </h3>
                          </div>
                          <p className="text-xs font-light leading-relaxed text-zinc-400 pr-4 mt-1">
                            {module.about ||
                              "AI-driven adaptive learning system"}
                          </p>
                        </div>

                        {/* Lock State Status Flag */}
                        <div className="shrink-0 self-center pl-2">
                          {isEnrolled ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                              <BadgeCheck size={12} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <LockKeyhole
                              size={14}
                              className="text-zinc-300 group-hover:text-zinc-400 transition-colors duration-200"
                            />
                          )}
                        </div>
                      </div>
                    );

                    return isEnrolled ? (
                      <Link
                        key={module.id}
                        href={`/explore/course/${course.id}/module/${module.id}`}
                        className="group flex w-full border-b border-zinc-100 py-6 text-left transition-all hover:bg-zinc-50/50 rounded-xl px-2 -mx-2"
                      >
                        {moduleRow}
                      </Link>
                    ) : (
                      <button
                        key={module.id}
                        type="button"
                        onClick={handlePrimaryAction}
                        className="group flex w-full border-b border-zinc-100 py-6 text-left transition-all hover:bg-zinc-50/50 rounded-xl px-2 -mx-2"
                      >
                        {moduleRow}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs font-light tracking-wide text-zinc-400">
                  No curriculum modules found for this learning plan.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ActionConfirmationDialog
        open={showActionDialog}
        loading={isSubmitting}
        variant={dialogVariant}
        onClose={() => setShowActionDialog(false)}
        onConfirm={handleConfirmAction}
      />

      <EnrollmentRequiredDialog
        open={false}
        onClose={() => setShowActionDialog(false)}
        courseTitle={course.title}
      />
    </>
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

export default CourseOverviewHeader;
