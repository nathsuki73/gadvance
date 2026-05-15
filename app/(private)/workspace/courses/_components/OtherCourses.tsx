"use client";

import React from "react";

import CourseCard from "./CourseCard";
import { Course } from "../type";


type OtherCoursesProps = {
  title: string;
  courses: Course[];
};

const OtherCourses = ({
  title,
  courses,
}: OtherCoursesProps) => {
  return (
    <section>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
          Discover
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
          />
        ))}
      </div>
    </section>
  );
};

export default OtherCourses;