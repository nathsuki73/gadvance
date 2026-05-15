"use client";

import React, { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import ModuleViewer from "../../_components/module/ModuleViewer";
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

        console.log("DATA:", data);

        
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500" size={40} />
      </div>
    );
  }

  if (error || !learningPlan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <CourseOverviewHeader course={learningPlan} />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <CourseModulePreview course={learningPlan} />
      </section>

      <section className="mx-auto max-w-[1600px] px-6 pb-20">
        <ModuleViewer module={learningPlan} />
      </section>
    </main>
  );
};

export default CoursePage;