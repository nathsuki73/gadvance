"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CourseCard from "./CourseCard";
import { searchContent } from "../service";
import type { LearningPlan } from "../types";

const CourseGrid = () => {
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", activeSearch],
    queryFn: () => searchContent(activeSearch),
  });

  const handleSearch = () => {
    setActiveSearch(query);
  };

  return (
    <>
      <div className="mb-10">
        <div className="flex max-w-full items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              Explore Available Courses
            </h1>
            <p className="mt-4 max-w-2xl text-zinc-500">
              Discover new modules, sharpen your skills, and advance your
              knowledge at your own pace.
            </p>
          </div>
          {/* <div className="mt-2">
            <CourseSearchBar 
              value={query} 
              onChange={setQuery} 
              onSearch={handleSearch} 
            />
          </div> */}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-64 w-full animate-pulse rounded-xl bg-zinc-100"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-12 text-center">
          <h3 className="text-xl font-semibold text-zinc-900">
            No results for &quot;{activeSearch}&quot;
          </h3>
          <p className="mt-2 text-zinc-500">
            Try checking your spelling or use different keywords.
          </p>
        </div>
      ) : (
        <section>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((module: LearningPlan) => (
              <CourseCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default CourseGrid;
