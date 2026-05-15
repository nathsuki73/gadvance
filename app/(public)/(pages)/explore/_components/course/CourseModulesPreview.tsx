"use client";

import React from "react";
import { BookOpen, PlayCircle, Lock } from "lucide-react";

type CourseModulePreviewProps = {
  course: {
    modules?: any[];
  };
};

const CourseModulePreview = ({ course }: CourseModulePreviewProps) => {
  const modules = course.modules || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16 border-l-4 border-[#00aeef] pl-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">
            Syllabus
          </h2>
          <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Instructional Roadmap
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="group grid grid-cols-1 md:grid-cols-[80px_1fr_auto] items-center gap-8 py-8 px-4 transition-colors hover:bg-zinc-50 border-b border-zinc-100"
            >
              {/* Module Sequence */}
              <span className="text-xs font-mono font-bold text-zinc-300">
                {(index + 1).toString().padStart(2, '0')}
              </span>

              {/* Title and Detail */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  {index === 0 ? (
                    <BookOpen size={16} className="text-[#00aeef]" />
                  ) : (
                    <PlayCircle size={16} className="text-[#00aeef]" />
                  )}
                  <h4 className="text-lg font-medium text-zinc-800">
                    {module.title}
                  </h4>
                </div>
                <p className="text-sm text-zinc-500 font-light leading-relaxed max-w-3xl pl-7">
                  {module.about || "standard module overview and learning objectives."}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center text-[#00aeef]/40">
                <Lock size={16} strokeWidth={1.5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseModulePreview;