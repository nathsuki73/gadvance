"use client";

import { useEffect, useState } from "react";
import OtherCourses from "./OtherCourses";
import RecentCourses from "./RecentCourses";
import { Course } from "../type";
import { getRecentCourses, searchCourses } from "../service";

const CoursesPageContent = () => {
  const [query, setQuery] = useState("");
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [searchedCourses, setSearchedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      const data = await getRecentCourses();

      setRecentCourses(data);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchedCourses([]);
      return;
    }

    const results = await searchCourses(query);
    setSearchedCourses(results);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
            Learning Hub
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900">
            Courses
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-500">
            Continue learning, explore new programs, and manage your enrolled
            courses.
          </p>
        </div>

       

        {searchedCourses.length > 0 ? (
          <OtherCourses
            title="Search Results"
            courses={searchedCourses}
          />
        ) : (
          <>
            <RecentCourses
              courses={recentCourses}
              loading={loading}
            />

            <OtherCourses
              title="Other Courses"
              courses={recentCourses}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default CoursesPageContent;