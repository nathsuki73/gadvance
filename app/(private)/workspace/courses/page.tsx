// app/(workspace)/courses/page.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import EnrolledCourses from "./_components/EnrolledCourses";
import { getEnrolledCourses } from "./service";

const CoursesPage = () => {
  const { status, data: session } = useSession();

  const { data: enrolledCourses = [], isLoading } = useQuery({
    queryKey: ["enrolledCourses", session?.user?.email],
    queryFn: getEnrolledCourses,
    // Only fetch when authenticated and token is available
    enabled: status === "authenticated" && !!session?.laravelJwt,
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

        <EnrolledCourses courses={enrolledCourses} loading={isLoading} />
      </div>
    </main>
  );
};

export default CoursesPage;
