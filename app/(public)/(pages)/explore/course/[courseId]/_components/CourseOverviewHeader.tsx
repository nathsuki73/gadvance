"use client";

import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import { useRouter } from "next/navigation";

import {
  Globe,
  Briefcase,
  Heart,
  Target,
  Clock3,
  Users,
  BookOpen,
  ChevronRight,
  Trophy,
  Loader2,
  XCircle,
} from "lucide-react";

import type { LearningPlan } from "../../../types";

import {
  deleteEnrollment,
  enrollLearningPlan,
  getMyEnrollment,
} from "../service";

import ActionConfirmationDialog from "./ActionConfirmationDialog";

import type { Enrollment } from "../types";

const iconByType = {
  globe: Globe,
  briefcase: Briefcase,
  target: Target,
  wellness: Heart,
} as const;

type CourseOverviewHeaderProps = {
  course: LearningPlan;
  isLoggedIn?: boolean;
  onEnrollSuccess?: () => void;
};

const CourseOverviewHeader = ({
  course,
  isLoggedIn,
  onEnrollSuccess,
}: CourseOverviewHeaderProps) => {
  const Icon =
    iconByType[
      course.icon as keyof typeof iconByType
    ] || BookOpen;

  const router = useRouter();

  const [
    showActionDialog,
    setShowActionDialog,
  ] = useState(false);

  const [dialogVariant, setDialogVariant] =
    useState<"enroll" | "unenroll">(
      "enroll",
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [enrollment, setEnrollment] =
    useState<Enrollment | null>(null);

  const [loadingEnrollment, setLoadingEnrollment] =
    useState(true);

  /**
   * Load enrollment
   */
  const loadEnrollment = useCallback(
    async () => {
      if (!isLoggedIn) {
        setLoadingEnrollment(false);
        return;
      }

      try {
        setLoadingEnrollment(true);

        const result =
          await getMyEnrollment(course.id);

        console.log(
          "Enrollment Result:",
          result,
        );

        if (
          result.success &&
          result.data
        ) {
          setEnrollment(
            result.data as Enrollment,
          );
        } else {
          setEnrollment(null);
        }
      } catch (error) {
        console.error(
          "Enrollment fetch failed:",
          error,
        );

        setEnrollment(null);
      } finally {
        setLoadingEnrollment(false);
      }
    },
    [course.id, isLoggedIn],
  );

  useEffect(() => {
    loadEnrollment();
  }, [loadEnrollment]);

  /**
   * Main CTA click
   */
  const handlePrimaryAction = () => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }

    /**
     * Already enrolled
     */
    if (enrollment) {
      router.push(
        `/dashboard/learning/${course.id}`,
      );

      return;
    }

    setDialogVariant("enroll");
    setShowActionDialog(true);
  };

  /**
   * Open unenroll dialog
   */
  const handleUnenrollClick = () => {
    setDialogVariant("unenroll");
    setShowActionDialog(true);
  };

  /**
   * Confirm action
   */
  const handleConfirmAction = async () => {
    try {
      setIsSubmitting(true);

      /**
       * ENROLL
       */
      if (dialogVariant === "enroll") {
        const result =
          await enrollLearningPlan(
            course.id,
          );

        console.log(
          "Enroll Response:",
          result,
        );

        if (!result.success) {
          console.error(result.error);
          return;
        }

        await loadEnrollment();

        if (onEnrollSuccess) {
          onEnrollSuccess();
        }
      }

      /**
       * UNENROLL
       */
      if (
        dialogVariant === "unenroll" &&
        enrollment
      ) {
        const result =
          await deleteEnrollment(
            enrollment.id,
          );

        console.log(
          "Unenroll Response:",
          result,
        );

        if (!result.success) {
          console.error(result.error);
          return;
        }

        setEnrollment(null);
      }

      setShowActionDialog(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Action failed:",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * UI states
   */
  const isEnrolled = !!enrollment;

  const isCompleted =
    enrollment?.status === "completed";

  const progress =
    enrollment?.progress_percentage || 0;

  return (
    <>
      <section className="bg-[#00aeef] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">

            {/* LEFT */}
            <div className="flex flex-col gap-8">

              {/* Badge */}
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                  />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-100">
                  PROFESSIONAL CURRICULUM
                </span>
              </div>

              {/* Title */}
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                  {course.title}
                </h1>

                <p className="mt-6 text-lg text-sky-50 font-light leading-relaxed">
                  {course.about ||
                    "A formal learning pathway designed for systemic gender advancement and institutional leadership."}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-white/20 text-[11px] font-bold uppercase tracking-widest text-sky-100">

                <div className="flex items-center gap-2">
                  <Clock3 size={14} />

                  {course.duration ||
                    "self-paced"}
                </div>

                <div className="flex items-center gap-2">
                  <Users size={14} />

                  {course.enrolled || 0} enrolled
                  learners
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen size={14} />

                  {course.modules?.length || 0} instructional
                  modules
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-2 text-yellow-200">
                    <Trophy size={14} />
                    completed
                  </div>
                )}
              </div>

              {/* Progress */}
              {isEnrolled && (
                <div className="pt-2 max-w-xl">

                  <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.25em] text-sky-100">
                    <span>
                      learning progress
                    </span>

                    <span>
                      {progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-sky-50/80 font-light">
                    {isCompleted
                      ? "You completed this curriculum."
                      : "Continue your structured learning pathway."}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT ACTIONS */}
            <div className="w-full lg:w-auto flex flex-col gap-3 lg:pb-2">

              {/* Primary */}
              <button
                onClick={
                  handlePrimaryAction
                }
                disabled={
                  isSubmitting ||
                  loadingEnrollment
                }
                className="w-full lg:w-auto bg-white text-[#00aeef] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-sky-50 hover:-translate-y-1 active:scale-[0.98] rounded-md disabled:opacity-60"
              >
                <div className="flex items-center justify-center gap-3">

                  {loadingEnrollment ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Loading
                    </>
                  ) : !isLoggedIn ? (
                    "Learn"
                  ) : isCompleted ? (
                    "View Certificate"
                  ) : isEnrolled ? (
                    "Continue Learning"
                  ) : (
                    "Enroll"
                  )}

                  {!loadingEnrollment && (
                    <ChevronRight size={16} />
                  )}
                </div>
              </button>

              {/* Unenroll */}
              {isEnrolled &&
                !loadingEnrollment && (
                  <button
                    onClick={
                      handleUnenrollClick
                    }
                    disabled={
                      isSubmitting
                    }
                    className="w-full lg:w-auto border border-white/30 text-white bg-transparent px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.98] rounded-md disabled:opacity-40"
                  >
                    <div className="flex items-center justify-center gap-3">

                      {isSubmitting ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <XCircle
                          size={14}
                          className="opacity-80"
                        />
                      )}

                      Unenroll
                    </div>
                  </button>
                )}
            </div>
          </div>
        </div>
      </section>

      <ActionConfirmationDialog
        open={showActionDialog}
        loading={isSubmitting}
        variant={dialogVariant}
        onClose={() =>
          setShowActionDialog(false)
        }
        onConfirm={handleConfirmAction}
      />
    </>
  );
};

export default CourseOverviewHeader;