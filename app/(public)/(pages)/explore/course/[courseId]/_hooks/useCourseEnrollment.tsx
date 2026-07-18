"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LearningPlan, Enrollment } from "../types";
import { deleteEnrollment, enrollLearningPlan } from "../service";

interface UseCourseEnrollmentProps {
  course: LearningPlan;
  isLoggedIn?: boolean;
  initialEnrollment: Enrollment | null;
  onEnrollSuccess?: () => void;
}

export const useCourseEnrollment = ({
  course,
  isLoggedIn,
  initialEnrollment,
  onEnrollSuccess,
}: UseCourseEnrollmentProps) => {
  const router = useRouter();

  const [showActionDialog, setShowActionDialog] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<"enroll" | "unenroll">(
    "enroll",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Seed values directly using props from the parent data query context
  const [enrollment, setEnrollment] = useState<Enrollment | null>(
    initialEnrollment,
  );
  const [enrolledCount, setEnrolledCount] = useState(
    course.enrollments_count || 0,
  );

  /**
   * NOTE: All local loading state indicators, separate backend fetchers (loadEnrollment, loadEnrollmentCount),
   * and all mounting useEffect triggers have been completely deleted from here.
   * This completely prevents the UI text and metric flashes!
   */

  /**
   * Primary Button CTA handler
   */
  const handlePrimaryAction = () => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }

    if (enrollment) {
      const firstModule = course.modules?.[0];

      if (firstModule) {
        router.push(`/explore/course/${course.id}/module/${firstModule.id}`);
        return;
      }

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

        // 2. Optimistically update states locally so changes reflect on screen instantly
        setEnrollment(result.data as Enrollment);
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

      // 3. Clear router cache tree and prompt updates seamlessly
      router.refresh();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    enrollment,
    loadingEnrollment: false,
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
