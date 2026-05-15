"use client";

import React, { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import ModuleViewer from "./module/module/ModuleViewer";
import CourseModulePreview from "../../_components/course/CourseModulesPreview";
import CourseOverviewHeader from "../../_components/course/CourseOverviewHeader";
import { getLearningPlanDetails } from "../../service";


type CoursePageProps = {
  params: Promise<{ courseId: string }>;
};

const CoursePage = ({ params }: CoursePageProps) => {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;

  const [learningPlan, setLearningPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLearningPlan = async () => {
      try {
        setLoading(true);
        const data = await getLearningPlanDetails(courseId);
        setLearningPlan(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchLearningPlan();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#00aeef]/30" size={32} strokeWidth={1.5} />
      </div>
    );
  }

  if (error || !learningPlan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 selection:bg-sky-100 selection:text-[#00aeef]">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-[#00aeef]"
          >
            <ArrowLeft 
              size={16} 
              strokeWidth={1.5} 
              className="transition-transform duration-300 group-hover:-translate-x-1" 
            />
            <span className="lowercase font-medium">back to modules</span>
          </button>
        </div>
      </nav>

      {/* Hero Header Section */}
      <CourseOverviewHeader course={learningPlan} />

      {/* Content Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#00aeef] mb-4">
            curriculum overview
          </h2>
          <p className="text-zinc-500 font-light lowercase">
            explore the structured learning path for {learningPlan.title}.
          </p>
        </div>
        
        <CourseModulePreview course={learningPlan} />
      </section>
    </main>
  );
};

export default CoursePage;