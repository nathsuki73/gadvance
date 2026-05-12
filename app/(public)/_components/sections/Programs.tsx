"use client";

import React from "react";
import Link from "next/link";
import ProtectedButton from "../../../components/ProtectedButton";
import Statistics from "../../../components/statistics";

const Programs = () => {
  return (
    <section className="mx-auto max-w-7xl px-8 py-20 lg:px-12">
      {/* Title Section */}
      <div className="flex w-full flex-col items-center space-y-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
          <svg
            className="h-7 w-7 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-zinc-900">
          Educational Programs
        </h2>
        <p className="max-w-2xl text-base text-zinc-600">
          Comprehensive courses designed to empower and educate on gender
          equality, professional development, and personal growth.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
        <CourseCard
          title="Gender Equality Fundamentals"
          desc="Understanding the principles and importance of gender equality in modern society."
          duration="4 weeks"
          enrolled="12,500"
          progress={65}
          theme="teal"
        />
        <CourseCard
          title="Women in Leadership"
          desc="Developing leadership skills and breaking barriers in professional environments."
          duration="6 weeks"
          enrolled="8,900"
          progress={45}
          theme="orange"
        />
        {/* ... Add more cards as needed */}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/workspace"
          className="rounded-lg border-2 border-gray-300 px-8 py-3 font-semibold text-gray-500 transition-all hover:text-orange-400 hover:border-orange-400"
        >
          View All Courses
        </Link>
      </div>

      <div className="mt-20">
        <Statistics />
      </div>
    </section>
  );
};

const CourseCard = ({
  title,
  desc,
  duration,
  enrolled,
  progress,
  theme,
}: any) => {
  const bgColor = theme === "orange" ? "bg-orange-500" : "bg-teal-500";
  const btnColor =
    theme === "orange"
      ? "bg-orange-600 hover:bg-orange-700"
      : "bg-teal-600 hover:bg-teal-700";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${bgColor} text-white`}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" strokeWidth={2} />
          </svg>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
          Course
        </span>
      </div>
      <h3 className="mb-2 text-xl font-bold text-zinc-900">{title}</h3>
      <p className="mb-4 text-sm text-zinc-500">{desc}</p>
      <div className="mb-6 h-2 w-full rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${bgColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <ProtectedButton
        onClick={() => window.open("/course", "_blank")}
        className={`block w-full rounded-lg ${btnColor} px-4 py-2.5 text-center font-semibold text-white transition`}
        redirectUrl="/course"
      >
        Enroll →
      </ProtectedButton>
    </div>
  );
};

export default Programs;
