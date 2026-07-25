"use client";

import React, { useEffect, useState, use } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseOverviewHeader from "./_components/CourseOverviewHeader";
import { getLearningPlanDetails } from "../../service";

import type { LearningPlan, CoursePageProps, Enrollment } from "./types";
import { useSession } from "next-auth/react";
import { getMyEnrollment } from "./service";
import CoursePageSkeleton from "./_components/CoursePageSkeleton";

const CoursePage = ({ params }: CoursePageProps) => {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;

  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(false);

  // 1. Store the full enrollment object here instead of just a boolean
  const [enrollmentData, setEnrollmentData] = useState<Enrollment | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const handleBackToCourse = () => {
    const courseLink = pathname.split("/course")[0];
    router.push(courseLink);
  };

  useEffect(() => {
    if (status === "loading") return;

    const fetchCourseAndEnrollment = async () => {
      try {
        setDataLoading(true);

        // 1. If your service already returns the model data, 'res' IS the course structure!
        const courseData = await getLearningPlanDetails(courseId);
        console.log("Course Data:", courseData);

        // 2. Direct assignment works perfectly without checking for data wrappers
        setLearningPlan(courseData);

        if (isLoggedIn) {
          const enrollmentResult = await getMyEnrollment(courseId);
          if (enrollmentResult.success && enrollmentResult.data) {
            setEnrollmentData(enrollmentResult.data as Enrollment);
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

  if (status === "loading" || dataLoading) {
    return <CoursePageSkeleton />;
  }

  if (error || !learningPlan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-sky-100 selection:text-primary">
      {/* Navigation Header */}
      <nav className="sticky top-0 z40 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={handleBackToCourse}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span className="lowercase font-medium">back to explore</span>
          </button>
        </div>
      </nav>

      {/* Hero Header Section */}
      {/* 2. Pass the parsed enrollment down as a prop */}
      <CourseOverviewHeader
        course={learningPlan}
        isLoggedIn={isLoggedIn}
        initialEnrollment={enrollmentData}
      />
    </main>
  );
};

export default CoursePage;
