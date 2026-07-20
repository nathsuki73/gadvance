"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getEnrolledCourses } from "../service";
import EnrolledCourses from "./EnrolledCourses";

const CoursesPageContent = () => {
  // 1. Replace useEffect & useState with TanStack Query
  const { data: enrolledCourses = [], isLoading } = useQuery({
    queryKey: ["enrolledCourses"],
    queryFn: async () => {
      const data = await getEnrolledCourses();
      console.log("Enrolled Courses Data:", JSON.stringify(data));
      return data;
    },
    // Inherits your 10-minute layout staleTime configuration.
    // If a user leaves and returns within 10 minutes, it serves instantly from memory.
  });

  return (
    <main className="min-h-screen bg-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Enrolled Courses
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-500">
            Continue learning, explore new programs, and manage your enrolled
            courses.
          </p>
        </div>

        {/* 2. Pass down cached data and the loading state */}
        <EnrolledCourses courses={enrolledCourses} loading={isLoading} />
      </div>
    </main>
  );
};

export default CoursesPageContent;
