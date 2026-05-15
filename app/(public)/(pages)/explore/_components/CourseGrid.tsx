"use client";

import React, { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import CourseSearchBar from "./CourseSearchBar";
import { searchContent } from "../service";
import type {
  LearningPlan,
} from "../types";

const CourseGrid = () => {
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [courses, setCourses] = useState<LearningPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs on page load (activeSearch = "") 
  // and whenever the user submits a search.
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const data = await searchContent(activeSearch);
        setCourses(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [activeSearch]); 

  // This is called when the form is submitted
  const handleSearch = () => {
    setActiveSearch(query);
  };

  return (
    <section>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Explore Courses</h1>
        <div className="mt-8">
          <CourseSearchBar 
            value={query} 
            onChange={setQuery} 
            onSearch={handleSearch} 
          />
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-zinc-100" />
          ))
        ) : (
          courses.map((module: LearningPlan) => (
            <CourseCard key={module.id} module={module} />
          ))
        )}
      </div>

      {!isLoading && courses.length === 0 && (
        <div className="mt-16 text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <h3 className="text-xl font-semibold text-zinc-900">
  No results for &quot;{activeSearch}&quot;
</h3>
          <p className="mt-2 text-zinc-500">Try checking your spelling or use different keywords.</p>
        </div>
      )}
    </section>
  );
};

export default CourseGrid;