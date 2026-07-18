"use client";

import React from "react";
import CourseCard from "./CourseCard";
import { Course } from "../type";

type EnrolledCoursesProps = {
  courses: Course[];
  loading: boolean;
};

const EnrolledCourses = ({ courses, loading }: EnrolledCoursesProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="h-64 w-full animate-pulse rounded-xl bg-zinc-100"
          />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center">
        <p className="text-zinc-500">
          You are not enrolled in any courses yet.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
};

export default EnrolledCourses;
