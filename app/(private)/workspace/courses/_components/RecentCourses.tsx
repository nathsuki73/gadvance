"use client";

import React from "react";

import CourseCard from "./CourseCard";
import { Course } from "../type";


type RecentCoursesProps = {
  courses: Course[];
  loading?: boolean;
};

const RecentCourses = ({
  courses,
  loading,
}: RecentCoursesProps) => {
  return (
    <section className="mb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
            Continue Learning
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
            Recent Courses
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl bg-zinc-100"
              />
            ))
          : courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))}
      </div>
    </section>
  );
};

export default RecentCourses;