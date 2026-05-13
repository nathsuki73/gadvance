// components/explore/CourseGrid.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";

import CourseCard from "./CourseCard";
import CourseSearchBar from "./CourseSearchBar";

import {
  courseModules,
  type CourseModule,
} from "@/app/lib/courseModules";
import { searchContent } from "../service";

const CourseGrid = () => {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. We define the logic directly inside useEffect
    const delay = query ? 300 : 0;

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchContent(query);
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    // 2. The return (cleanup) MUST be a direct child of useEffect
    return () => clearTimeout(timeoutId);

  }, [query]);

  return (
    <section>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          Explore Courses
        </h1>

        <p className="mt-4 text-lg leading-8 text-zinc-600">
          Discover educational programs focused on leadership,
          workplace equity, inclusion, and personal growth.
        </p>

        <div className="mt-8">
          <CourseSearchBar
            value={query}
            onChange={setQuery}
          />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
        {courses.map((module) => (
          <CourseCard
            key={module.id}
            module={module}
          />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="mt-16 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
          <h3 className="text-xl font-semibold text-zinc-900">
            No courses found
          </h3>

          <p className="mt-2 text-zinc-600">
            Try searching for another topic or keyword.
          </p>
        </div>
      )}
    </section>
  );
};

export default CourseGrid;