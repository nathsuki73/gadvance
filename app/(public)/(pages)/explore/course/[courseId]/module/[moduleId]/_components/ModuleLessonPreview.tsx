"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  FileText,
  PlayCircle,
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
  sections?: Section[];
};

type ModuleLessonPreviewProps = {
  module: ModuleResponse;
};

const getItemIcon = (itemType?: string, assessmentType?: string | null) => {
  if (itemType === "assessment") {
    if (assessmentType === "pre_test") {
      return <ClipboardCheck size={16} className="text-[#8b5cf6] shrink-0" />;
    }
    if (assessmentType === "post_test") {
      return <GraduationCap size={16} className="text-[#8b5cf6] shrink-0" />;
    }
    return <ClipboardCheck size={16} className="text-[#8b5cf6] shrink-0" />;
  }
  if (itemType === "page") {
    return <FileText size={16} className="text-[#8b5cf6] shrink-0" />;
  }
  return <PlayCircle size={16} className="text-[#8b5cf6] shrink-0" />;
};

const ModuleLessonPreview = ({ module }: ModuleLessonPreviewProps) => {
  const sections = module.sections || [];

  const [openSectionIds, setOpenSectionIds] = useState<Record<string, boolean>>(
    () => sections.reduce((acc, sec) => ({ ...acc, [sec.id]: true }), {}),
  );

  const toggleSection = (id: string) => {
    setOpenSectionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto md:px-12 px-6">
        {/* Module Header Elements */}
        <div className="mb-12 border-l-4 border-purple-600 pl-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">
            Module
          </h2>
          <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Sections & Content Outline
          </h3>
        </div>

        {/* Grouped Sections List */}
        <div className="space-y-6">
          {sections.length > 0 ? (
            sections.map((sec) => {
              const isOpen = openSectionIds[sec.id] ?? true;
              const items = sec.items || [];

              return (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-xs"
                >
                  {/* SECTION HEADER WITH DESCRIPTION */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="w-full flex items-center justify-between p-6 bg-zinc-50/80 hover:bg-zinc-100/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="pr-4">
                      <h4 className="text-base font-semibold text-zinc-900">
                        {sec.title}
                      </h4>
                      {sec.description && (
                        <p className="text-xs text-zinc-400 font-light mt-1 leading-relaxed">
                          {sec.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400 shrink-0">
                      {isOpen ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                  </button>

                  {/* NESTED SUB-ITEMS */}
                  {isOpen && items.length > 0 && (
                    <div className="divide-y divide-zinc-100 border-t border-zinc-100">
                      {items.map((item, itemIdx) => {
                        const targetHref =
                          item.item_type === "assessment"
                            ? `/courses/${module.id}/assessments/${item.content_id || item.id}`
                            : `/courses/${module.id}/lessons/${item.content_id || item.id}`;

                        return (
                          <Link
                            key={item.id}
                            href={targetHref}
                            className="group flex justify-between items-center px-8 py-5 transition-colors hover:bg-purple-50/20"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-mono font-bold text-zinc-300">
                                {(itemIdx + 1).toString().padStart(2, "0")}
                              </span>
                              {getItemIcon(
                                item.item_type,
                                item.assessment_type,
                              )}
                              <h5 className="text-sm font-medium text-zinc-800 group-hover:text-[#7c3aed]transition-colors">
                                {item.title}
                              </h5>
                            </div>

                            <ChevronRight
                              size={16}
                              className="text-zinc-300 group-hover:text-[#7c3aed] transition-colors shrink-0"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
              <Folder className="mx-auto h-10 w-10 text-zinc-300 mb-3" />
              <h4 className="text-base font-semibold text-zinc-800">
                No sections available
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                There are currently no sections or lessons published in this
                module.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ModuleLessonPreview;
