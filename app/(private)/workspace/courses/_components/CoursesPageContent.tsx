"use client";

import { useEffect, useState } from "react";
import { Course } from "../type";
import { getEnrolledCourses } from "../service";
import EnrolledCourses from "./EnrolledCourses";

const CoursesPageContent = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const data = await getEnrolledCourses();
      setEnrolledCourses(data);
      setLoading(false);
    };

    fetchCourses();
  }, []);

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

        <EnrolledCourses courses={enrolledCourses} loading={loading} />
      </div>
    </main>
  );
};

export default CoursesPageContent;
