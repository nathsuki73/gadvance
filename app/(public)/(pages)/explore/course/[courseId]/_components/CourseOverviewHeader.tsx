"use client";

import React from "react";
import { Clock3, Users, BadgeCheck, BookOpen, PlayCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import EnrollmentRequiredDialog from "./EnrollmentRequiredDialog";
import { useCourseEnrollment } from "../_hooks/useCourseEnrollment";
import type { LearningPlan } from "../types";

type CourseOverviewHeaderProps = {
  course: LearningPlan;
  isLoggedIn: boolean;
  onEnrollSuccess?: () => void;
};

const CourseOverviewHeader = ({ course, isLoggedIn, onEnrollSuccess }: CourseOverviewHeaderProps) => {
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
  } = useCourseEnrollment({ course, isLoggedIn, onEnrollSuccess });

  const courseImage = course.image || "/images/course-placeholder.jpg";

  return (
    <>
      <section className="border-b border-zinc-100 bg-linear-to-b from-white via-white to-zinc-50/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:px-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-16">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
              {course.tag ? <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-500">{course.tag}</span> : null}
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
              {course.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-500 md:text-lg">
              {course.description || "Explore the course structure, progress tracking, and the next step in your learning path."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover"
              >
                {isEnrolled ? (
                  <>
                    View Modules
                  </>
                ) : (
                  <>
                    enroll now
                  </>
                )}
              </button>

              {isEnrolled ? (
                <button
                  type="button"
                  onClick={handleUnenrollClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 hover:text-zinc-900"
                >
                  Unenroll
                </button>
              ) : null}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatCard icon={<Users className="h-4 w-4" />} label="enrolled" value={String(enrolledCount)} />
              <StatCard icon={<Clock3 className="h-4 w-4" />} label="progress" value={`${progress}%`} />
              <StatCard icon={<BadgeCheck className="h-4 w-4" />} label="status" value={isCompleted ? "completed" : isEnrolled ? "active" : "open"} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-zinc-100 bg-white p-3 shadow-2xl shadow-zinc-200/30">
            <div
              className="relative min-h-80 rounded-3xl bg-cover bg-center"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(17,24,39,0.05), rgba(17,24,39,0.55)), url(${courseImage})` }}
            >
              <div className="absolute inset-0 rounded-3xl bg-linear-to-t from-zinc-950/65 via-zinc-950/10 to-transparent" />
              <div className="relative flex h-full min-h-80 flex-col justify-end p-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/60">learning path</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{course.title}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                  Start where you are, continue where you left off, and move through the module sequence at your own pace.
                </p>
              </div>
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
  <div className="rounded-2xl border border-zinc-100 bg-white px-4 py-4">
    <div className="flex items-center gap-2 text-zinc-400">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{label}</span>
    </div>
    <div className="mt-3 text-lg font-semibold tracking-tight text-zinc-900">{value}</div>
  </div>
);

export default CourseOverviewHeader;