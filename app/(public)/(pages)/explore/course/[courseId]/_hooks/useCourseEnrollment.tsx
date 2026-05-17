"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { LearningPlan, Enrollment } from "../types"; // Adjust path as necessary
import {
  deleteEnrollment,
  enrollLearningPlan,
  getMyEnrollment,
  getEnrollmentCount,
} from "../service";

interface UseCourseEnrollmentProps {
  course: LearningPlan;
  isLoggedIn?: boolean;
  onEnrollSuccess?: () => void;
}

export const useCourseEnrollment = ({
  course,
  isLoggedIn,
  onEnrollSuccess,
}: UseCourseEnrollmentProps) => {
  const router = useRouter();

  const [showActionDialog, setShowActionDialog] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<"enroll" | "unenroll">("enroll");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(true);
  const [enrolledCount, setEnrolledCount] = useState(course.enrolled || 0);

  /**
   * Fetches user-specific private enrollment details
   */
  const loadEnrollment = useCallback(async () => {
    if (!isLoggedIn) {
      setEnrollment(null);
      setLoadingEnrollment(false);
      return;
    }

    try {
      setLoadingEnrollment(true);
      const result = await getMyEnrollment(course.id);

      if (result.success && result.data) {
        setEnrollment(result.data as Enrollment);
      } else {
        setEnrollment(null);
      }
    } catch (error) {
      console.error("Enrollment fetch failed:", error);
      setEnrollment(null);
    } finally {
      setLoadingEnrollment(false);
    }
  }, [course.id, isLoggedIn]);

  /**
   * Fetches public course metrics (Always runs regardless of auth)
   */
  const loadEnrollmentCount = useCallback(async () => {
    try {
      const result = await getEnrollmentCount(course.id);
      if (result.success && result.data) {
        setEnrolledCount(result.data.total_enrolled);
      }
    } catch (error) {
      console.error("Enrollment count fetch failed:", error);
    }
  }, [course.id]);

  /**
   * Separate Lifecycles: Logging out won't block public data
   */
  useEffect(() => {
    loadEnrollmentCount();
  }, [loadEnrollmentCount, isLoggedIn]);

  useEffect(() => {
    loadEnrollment();
  }, [loadEnrollment]);

  /**
   * Primary Button CTA handler
   */
  const handlePrimaryAction = () => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }

    if (enrollment) {
      router.push(`/dashboard/learning/${course.id}`);
      return;
    }

    setDialogVariant("enroll");
    setShowActionDialog(true);
  };

  /**
   * Opens unenrollment confirmation
   */
  const handleUnenrollClick = () => {
    setDialogVariant("unenroll");
    setShowActionDialog(true);
  };

  /**
   * Executes network mutations on dialog confirmation
   */
  const handleConfirmAction = async () => {
    try {
      setIsSubmitting(true);

      if (dialogVariant === "enroll") {
        const result = await enrollLearningPlan(course.id);

        if (!result.success) {
          console.error(result.error);
          return;
        }

        await loadEnrollment();
        setEnrolledCount((prev) => prev + 1);

        if (onEnrollSuccess) {
          onEnrollSuccess();
        }
      }

      if (dialogVariant === "unenroll" && enrollment) {
        const result = await deleteEnrollment(enrollment.id);

        if (!result.success) {
          console.error(result.error);
          return;
        }

        setEnrollment(null);
        setEnrolledCount((prev) => Math.max(prev - 1, 0));
      }

      setShowActionDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    enrollment,
    loadingEnrollment,
    enrolledCount,
    isSubmitting,
    showActionDialog,
    dialogVariant,
    setShowActionDialog,
    handlePrimaryAction,
    handleUnenrollClick,
    handleConfirmAction,
    isEnrolled: !!enrollment,
    isCompleted: enrollment?.status === "completed",
    progress: enrollment?.progress_percentage || 0,
  };
};