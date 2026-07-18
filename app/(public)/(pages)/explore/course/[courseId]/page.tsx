"use client";

import React, { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseOverviewHeader from "./_components/CourseOverviewHeader";
import { getLearningPlanDetails } from "../../service";

import type { LearningPlan, CoursePageProps } from "./types";
import { useSession } from "next-auth/react";
import { getMyEnrollment } from "./service";
import CoursePageSkeleton from "./_components/CoursePageSkeleton";

const CoursePage = ({ params }: CoursePageProps) => {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;

  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(false);

  // Shared state tracking enrollment to sync sibling previews immediately
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Wait until NextAuth determines if the user is loading or not
    if (status === "loading") return;

    const fetchCourseAndEnrollment = async () => {
      try {
        setDataLoading(true);

        // Fetch course details
        const data = await getLearningPlanDetails(courseId);
        setLearningPlan(data);

        // Fetch enrollment status if user is logged in
        if (isLoggedIn) {
          const enrollmentResult = await getMyEnrollment(courseId);
          if (enrollmentResult.success && enrollmentResult.data) {
            setIsEnrolled(true);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      } finally {
        setDataLoading(false);
      }
    };

    if (courseId) {
      fetchCourseAndEnrollment();
    }
  }, [courseId, status, isLoggedIn]);

  // Combined Loading Gate: Keep the user behind a clean skeleton layout
  // until NextAuth resolves AND your backend database returns records.
  if (status === "loading" || dataLoading) {
    return <CoursePageSkeleton />;
  }

  if (error || !learningPlan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-sky-100 selection:text-primary">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span className="lowercase font-medium">back to courses</span>
          </button>
        </div>
      </nav>

      {/* Hero Header Section */}
      <CourseOverviewHeader
        course={learningPlan}
        isLoggedIn={isLoggedIn}
        onEnrollSuccess={() => setIsEnrolled(true)}
      />
    </main>
  );
};

export default CoursePage;
