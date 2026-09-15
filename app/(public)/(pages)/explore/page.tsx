import React, { Suspense } from "react";
import CourseGrid from "./_components/CourseGrid";

const ExplorePage = () => {
  return (
    <main className="min-h-screen bg-white px-6 py-10 md:px-12">
      <div className="mx-auto max-w-7xl">
        <Suspense
          fallback={
            <div className="flex h-64 w-full items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <CourseGrid />
        </Suspense>
      </div>
    </main>
  );
};

export default ExplorePage;
