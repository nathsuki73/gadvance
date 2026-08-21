"use client";

import React, { useEffect, useState, use, useCallback, useRef } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CourseOverviewHeader from "./_components/CourseOverviewHeader";
import { getLearningPlanDetails } from "../../service";

import type { LearningPlan, CoursePageProps, Enrollment } from "./types";
import { useSession } from "next-auth/react";
import CoursePageSkeleton from "./_components/CoursePageSkeleton";
import { forceSignOut } from "@/app/lib/api-client";

export default function CoursePage({ params }: CoursePageProps) {
  const { status, data: session } = useSession();

  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;

  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<Enrollment | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Guard ref to ensure the API fetch runs strictly once per component mount
  const hasFetchedRef = useRef(false);

  // Clean and unified authentication state check for both Google and Credentials sign-ins
  const isFullyAuthenticated =
    status === "authenticated" &&
    Boolean(session?.laravelJwt && !session?.error);

  // Centralized guard function: purges session if token is dead/invalid
  const ensureValidSession = useCallback(async (): Promise<boolean> => {
    if (!isFullyAuthenticated) {
      await forceSignOut();
      return false;
    }
    return true;
  }, [isFullyAuthenticated]);

  // 1. Light Tab Focus Listener: Runs ONLY when user switches back to this tab
  useEffect(() => {
    const handleTabFocus = () => {
      if (document.visibilityState === "visible") {
        ensureValidSession();
      }
    };

    window.addEventListener("focus", handleTabFocus);
    document.addEventListener("visibilitychange", handleTabFocus);

    return () => {
      window.removeEventListener("focus", handleTabFocus);
      document.removeEventListener("visibilitychange", handleTabFocus);
    };
  }, [ensureValidSession]);

  const handleBackToCourse = () => {
    const courseLink = pathname.split("/course")[0];
    router.push(courseLink);
  };

  // 2. Fetch course details safely without double-fetching loops
  useEffect(() => {
    if (!courseId) return;

    // Prevent duplicate fetches on initial render cycles & React Strict Mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchCourseDetails = async () => {
      try {
        setDataLoading(true);
        setError(false);

        // Single fetch for both course details and enrollment status!
        const courseData = await getLearningPlanDetails(courseId);

        if (courseData) {
          setLearningPlan(courseData);
          setEnrollmentData(courseData.enrollment ?? null);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Course fetch error:", err);
        setError(true);
      } finally {
        setDataLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (status === "loading" || dataLoading) {
    return <CoursePageSkeleton />;
  }

  if (error || !learningPlan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-sky-100 selection:text-primary">
      <nav className="sticky top-0 z-40 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={handleBackToCourse}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary cursor-pointer"
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

      <CourseOverviewHeader
        course={learningPlan}
        isLoggedIn={isFullyAuthenticated}
        initialEnrollment={isFullyAuthenticated ? enrollmentData : null}
        onRequireAuth={ensureValidSession}
      />
    </main>
  );
}
