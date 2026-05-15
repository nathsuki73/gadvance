"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Course } from "../type";


type CourseCardProps = {
  course: Course;
};

const CourseCard = ({ course }: CourseCardProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(`/workspace/courses/${course.id}`)
      }
      className="cursor-pointer rounded-3xl border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#00aeef] text-xl font-bold">
        {course.title.charAt(0)}
      </div>

      <h3 className="mt-6 text-xl font-semibold text-zinc-900">
        {course.title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-zinc-500">
        {course.about ||
          "Structured learning modules and guided activities."}
      </p>
    </div>
  );
};

export default CourseCard;