"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock3,
  BookOpen,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  FileText,
  Folder,
} from "lucide-react";

export type SectionItem = {
  id: string;
  section_id: string;
  item_type: string;
  content_id?: string | null;
  title: string;
  order_index: number;
  assessment_type?: string | null;
};

export type Section = {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  items: SectionItem[];
};

export type ModuleResponse = {
  id: string;
  title: string;
  about?: string | null;
  description?: string | null;
  image?: string | null;
  sections?: Section[];
  lessons?: Array<{
    id: string;
    title: string;
    description?: string | null;
  }>;
  progress?: {
    percentage: number;
  } | null;
};

type ModuleOverviewHeaderProps = {
  module: ModuleResponse;
  moduleIndex?: number;
};

const getItemIcon = (itemType?: string, assessmentType?: string | null) => {
  if (itemType === "assessment") {
    if (assessmentType === "pre_test") {
      return <ClipboardCheck size={14} className="text-[#8b5cf6] shrink-0" />;
    }
    if (assessmentType === "post_test") {
      return <GraduationCap size={14} className="text-[#8b5cf6] shrink-0" />;
    }
    return <ClipboardCheck size={14} className="text-[#8b5cf6] shrink-0" />;
  }
  if (itemType === "page") {
    return <FileText size={14} className="text-[#8b5cf6] shrink-0" />;
  }
  return <PlayCircle size={14} className="text-[#8b5cf6] shrink-0" />;
};

const ModuleOverviewHeader = ({ module, moduleIndex }: ModuleOverviewHeaderProps) => {
  const router = useRouter();

  const sections = module.sections || [];
  const totalSections = sections.length;
  const progress = module.progress?.percentage || 0;
  const hasStarted = progress > 0;

  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>(
    () => sections.reduce((acc, sec) => ({ ...acc, [sec.id]: true }), {})
  );

  const toggleSection = (id: string) => {
    setOpenSectionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleContinueLearning = () => {
    router.push(`/learn/${module.id}`);
  };

  return (
    <section className="bg-gradient-to-b from-white via-white to-zinc-50/40 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        {/* LEFT PANEL: HERO */}
        <div>
          {moduleIndex !== undefined && (
            <span className="mb-3 inline-block font-mono text-xs font-bold uppercase tracking-widest text-purple-600">
              Module {moduleIndex.toString().padStart(2, "0")}
            </span>
          )}

          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl leading-[1.15]">
            {module.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 font-light md:text-lg">
            {module.about ||
              module.description ||
              "Move through the sections at your own pace and keep track of your progress from one topic to the next."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleContinueLearning}
              className="inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-[#7c3aed] active:scale-[0.98] cursor-pointer"
            >
              {hasStarted ? "Continue Learning" : "Start Learning"}
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="mt-12 grid max-w-md grid-cols-2 gap-4">
            <StatCard
              icon={<BookOpen className="h-4 w-4" />}
              label="sections"
              value={String(totalSections)}
            />
            <StatCard
              icon={<Clock3 className="h-4 w-4" />}
              label="progress"
              value={`${progress}%`}
            />
          </div>
        </div>

        {/* RIGHT PANEL: GROUPED SECTIONS */}
        <div className="min-w-0 lg:border-l lg:border-zinc-100 lg:pl-12">
          <div className="flex items-start gap-4">
            <div className="mt-1 h-10 w-0.5 rounded-full bg-purple-600" />
            <div>
              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-900">
                Module Outline
              </h2>
            </div>
          </div>

          <div className="mt-8 max-h-[460px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-zinc-200">
            {sections.length > 0 ? (
              sections.map((sec, secIdx) => {
                const isOpen = openSectionIds[sec.id] ?? true;

                return (
                  <div
                    key={sec.id}
                    className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className="w-full flex items-center justify-between p-4 bg-zinc-50/70 hover:bg-zinc-100/60 transition-colors text-left cursor-pointer"
                    >
                      <div className="pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-semibold text-zinc-400">
                            Section {secIdx + 1}:
                          </span>
                          <h3 className="text-sm font-semibold text-zinc-900 leading-tight">
                            {sec.title}
                          </h3>
                        </div>
                        {sec.description && (
                          <p className="text-[11px] text-zinc-400 font-light mt-0.5 leading-relaxed line-clamp-2">
                            {sec.description}
                          </p>
                        )}
                      </div>

                      {isOpen ? (
                        <ChevronDown size={16} className="text-zinc-400 shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-zinc-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && sec.items && sec.items.length > 0 && (
                      <div className="divide-y divide-zinc-100 border-t border-zinc-100 bg-white">
                        {sec.items.map((item, itemIdx) => (
                          <Link
                            key={item.id}
                            href={`/learn/${module.id}?item=${item.id}`}
                            className="group flex items-center justify-between px-5 py-3 text-xs transition-colors hover:bg-purple-50/30"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[10px] font-mono font-medium text-zinc-300">
                                {(itemIdx + 1).toString().padStart(2, "0")}
                              </span>
                              {getItemIcon(item.item_type, item.assessment_type)}
                              <span className="font-medium text-zinc-700 group-hover:text-[#7c3aed] transition-colors truncate">
                                {item.title}
                              </span>
                            </div>

                            <ChevronRight
                              size={14}
                              className="text-zinc-300 group-hover:text-[#7c3aed] transition-colors shrink-0"
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center border border-dashed border-zinc-200 rounded-2xl">
                <Folder className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-xs text-zinc-400">
                  No sections found for this module.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-xs">
    <div className="flex items-center gap-2 text-zinc-400">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-[0.25em]">
        {label}
      </span>
    </div>
    <div className="mt-2.5 text-lg font-semibold tracking-tight text-zinc-900">
      {value}
    </div>
  </div>
);

export default ModuleOverviewHeader;