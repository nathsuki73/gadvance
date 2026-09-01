"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Users, BookOpen, LockKeyhole, BadgeCheck, ChevronRight } from "lucide-react";
import ActionConfirmationDialog from "./ActionConfirmationDialog";
import EnrollmentRequiredDialog from "./EnrollmentRequiredDialog";
import { useCourseEnrollment } from "../_hooks/useCourseEnrollment";
import type { Enrollment, LearningPlan } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import { getModule } from "../module/[moduleId]/service";

type CourseOverviewHeaderProps = {
  course: LearningPlan;
  isLoggedIn: boolean;
  initialEnrollment: Enrollment | null;
  onEnrollSuccess?: () => void;
  onRequireAuth?: () => Promise<boolean>;
};

const CourseOverviewHeader = ({
  course,
  isLoggedIn,
  initialEnrollment,
  onEnrollSuccess,
  onRequireAuth,
}: CourseOverviewHeaderProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    enrolledCount,
    isSubmitting,
    showActionDialog,
    dialogVariant,
    isEnrolled,
    progress: fallbackProgress,
    setShowActionDialog,
    handlePrimaryAction,
    handleUnenrollClick,
    handleConfirmAction,
  } = useCourseEnrollment({
    course,
    isLoggedIn,
    initialEnrollment,
    onEnrollSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
      if (onEnrollSuccess) onEnrollSuccess();
    },
  });

  const modules = course.modules || [];
  const hasModules = Array.isArray(modules) && modules.length > 0;

  // Track live progress map across all individual modules
  const [moduleProgressMap, setModuleProgressMap] = useState<Record<string, number>>({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!isEnrolled || !hasModules) return;

    const fetchAllModuleProgress = async () => {
      setLoadingProgress(true);
      try {
        const results = await Promise.all(
          modules.map(async (mod: any) => {
            const modId = mod.id || mod.module_id;
            if (!modId) return { id: "", pct: 0 };

            // 1. Direct progress value if available
            if (typeof mod.progress?.percentage === "number") {
              return { id: modId, pct: mod.progress.percentage };
            }
            if (typeof mod.progress === "number") {
              return { id: modId, pct: mod.progress };
            }

            // 2. Fetch live progress from module service
            try {
              const res = await getModule(modId);
              const pct = res?.data?.progress?.percentage ?? 0;
              return { id: modId, pct };
            } catch {
              return { id: modId, pct: 0 };
            }
          })
        );

        const progressLookup: Record<string, number> = {};
        results.forEach((item) => {
          if (item.id) progressLookup[item.id] = item.pct;
        });

        setModuleProgressMap(progressLookup);
      } catch (err) {
        console.error("Failed to compute combined learning plan progress:", err);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchAllModuleProgress();
  }, [isEnrolled, hasModules, modules]);

  // 🎯 Combined average progress across all modules
  const displayProgress = useMemo(() => {
    if (!isEnrolled || modules.length === 0) return 0;

    const keys = Object.keys(moduleProgressMap);
    if (keys.length > 0) {
      const total = modules.reduce((sum: number, mod: any) => {
        const modId = mod.id || mod.module_id;
        return sum + (moduleProgressMap[modId] ?? 0);
      }, 0);
      return Math.round(total / modules.length);
    }

    return typeof fallbackProgress === "number" ? fallbackProgress : 0;
  }, [isEnrolled, modules, moduleProgressMap, fallbackProgress]);

  const executeGuardedAction = async (action: () => void) => {
    if (onRequireAuth) {
      const isValid = await onRequireAuth();
      if (!isValid) return;
    }
    action();
  };

  const onConfirmWithInvalidation = async () => {
    await handleConfirmAction();
    queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
  };

  const handleModuleClick = (moduleId: string) => {
    executeGuardedAction(() => {
      if (!moduleId || !course.id) return;
      router.push(`/explore/course/${course.id}/module/${moduleId}`);
    });
  };

  return (
    <>
      <section className="border-b border-zinc-100 bg-linear-to-b from-white via-white to-zinc-50/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-12 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:py-20">
          {/* LEFT PANEL: HERO */}
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {isEnrolled ? (
                hasModules ? (
                  <button
                    type="button"
                    onClick={() => executeGuardedAction(handlePrimaryAction)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] cursor-pointer"
                  >
                    View Modules
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-200 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-400 cursor-not-allowed"
                  >
                    No Modules Available
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => executeGuardedAction(handlePrimaryAction)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] cursor-pointer"
                >
                  Enroll Now
                </button>
              )}

              {isEnrolled && (
                <button
                  type="button"
                  onClick={() => executeGuardedAction(handleUnenrollClick)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] cursor-pointer"
                >
                  Unenroll
                </button>
              )}
            </div>

            {/* Stat Cards */}
            <div
              className={`mt-12 grid gap-4 ${
                isEnrolled ? "sm:grid-cols-2" : "grid-cols-1 max-w-xs"
              }`}
            >
              <StatCard
                icon={<Users className="h-4 w-4" />}
                label="enrolled"
                value={String(enrolledCount)}
              />
              {isEnrolled && (
                <StatCard
                  icon={<Clock3 className="h-4 w-4" />}
                  label="progress"
                  value={
                    loadingProgress && Object.keys(moduleProgressMap).length === 0
                      ? "..."
                      : `${displayProgress}%`
                  }
                />
              )}
            </div>
          </div>

          {/* RIGHT PANEL: MODULE LIST */}
          <div className="min-w-0 lg:border-l lg:border-zinc-100 lg:pl-16">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-12 w-0.5 rounded-full bg-primary" />
              <div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                  Module Overview
                </h2>
              </div>
            </div>

            <div className="mt-10 max-h-115 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
              {hasModules ? (
                <div className="flex flex-col space-y-1">
                  {modules.map((module: any, index: number) => {
                    const moduleId = module.id || module.module_id;
                    const modProgress =
                      moduleProgressMap[moduleId] ??
                      (module.progress?.percentage || module.progress || 0);
                    const isCompleted = modProgress >= 100;

                    return (
                      <button
                        key={moduleId || index}
                        type="button"
                        onClick={() =>
                          isEnrolled
                            ? handleModuleClick(moduleId)
                            : executeGuardedAction(handlePrimaryAction)
                        }
                        className="group flex w-full border-b border-zinc-100 py-5 text-left transition-all hover:bg-zinc-50/80 rounded-xl px-3 -mx-3 cursor-pointer"
                      >
                        <div className="grid grid-cols-[auto_1fr_auto] gap-4 w-full items-start">
                          {/* Number Indicator */}
                          <span className="pt-0.5 font-mono text-xs font-bold tracking-widest text-zinc-300 min-w-6">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>

                          {/* Title & Description */}
                          <div className="flex flex-col gap-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <BookOpen
                                size={15}
                                className="shrink-0 text-[#8b5cf6]"
                              />
                              <h3 className="text-[0.95rem] font-medium tracking-tight text-zinc-800 group-hover:text-[#8b5cf6] transition-colors truncate">
                                {module.title || `Module ${index + 1}`}
                              </h3>
                            </div>
                            <p className="text-xs font-light leading-relaxed text-zinc-400 line-clamp-2 mt-0.5">
                              {module.about ||
                                module.description ||
                                "Interactive learning module"}
                            </p>
                          </div>

                          {/* Lock / Completed / In-Progress Indicator */}
                          <div className="shrink-0 self-center pl-2">
                            {isEnrolled ? (
                              isCompleted ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100">
                                  <BadgeCheck size={14} strokeWidth={2.5} />
                                </span>
                              ) : modProgress > 0 ? (
                                <span className="text-[10px] font-mono font-semibold text-primary bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                  {modProgress}%
                                </span>
                              ) : (
                                <ChevronRight
                                  size={16}
                                  className="text-zinc-300 group-hover:text-primary transition-colors"
                                />
                              )
                            ) : (
                              <LockKeyhole
                                size={14}
                                className="text-zinc-300 group-hover:text-zinc-400 transition-colors"
                              />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
                  <BookOpen className="h-8 w-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-medium text-zinc-500">
                    No modules published yet
                  </p>
                  <p className="mt-1 text-[11px] font-light text-zinc-400">
                    Course content is being prepared and will appear here once released.
                  </p>
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
        onConfirm={() => executeGuardedAction(onConfirmWithInvalidation)}
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