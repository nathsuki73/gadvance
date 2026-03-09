import React from "react";
import Header from "@/app/components/Header";
import CourseCard from "@/app/components/CourseCard";
import { Search } from "lucide-react";

const Workspace = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-zinc-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Updated Hero Header - Stats Removed */}
        <div className="mb-12 bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black mb-6 tracking-tight">
              What will you learn today?
            </h1>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search learning"
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-black tracking-tight">
            Educational Programs
          </h2>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <CourseCard
            title="Gender Equality Fundamentals"
            description="Principles and importance of gender equality in modern society."
            progress={65}
            duration="4 weeks"
            enrolled="12,500"
            color="#009B8E"
            tag="Foundational"
          />
          <CourseCard
            title="Women in Leadership"
            description="Developing leadership skills and breaking barriers in professional environments."
            progress={45}
            duration="6 weeks"
            enrolled="8,900"
            color="#FF7A00"
            tag="Professional"
          />
          <CourseCard
            title="Workplace Rights & Advocacy"
            description="Workplace rights, discrimination prevention, and advocacy strategies."
            progress={80}
            duration="5 weeks"
            enrolled="10,200"
            color="#009B8E"
            tag="Legal"
          />
          <CourseCard
            title="Mental Health & Wellness"
            description="Supporting mental well-being and building resilience in challenging environments."
            progress={30}
            duration="3 weeks"
            enrolled="15,800"
            color="#FF3B9E"
            tag="Wellness"
          />
        </div>
      </main>
    </div>
  );
};

export default Workspace;
