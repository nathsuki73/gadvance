"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Clock3,
  FileText,
  ClipboardCheck,
  GraduationCap,
  PlayCircle,
  Layers,
  CheckCircle2,
} from "lucide-react";

import { getModule } from "./service";
import { getLearningPlanDetails } from "../../service";

export type SectionItem = {
  id: string;
  section_id?: string;
  item_type?: string;
  content_id?: string | null;
  title: string;
  order_index?: number;
  assessment_type?: string | null;
};

export type Section = {
  id: string;
  module_id?: string;
  title: string;
  description?: string | null;
  order_index?: number;
  items?: SectionItem[];
};

export type ModuleResponse = {
  id: string;
  title: string;
  about?: string | null;
  description?: string | null;
  sections?: Section[];
  progress?: {
    percentage?: number;
  } | null;
};

const getItemIcon = (itemType?: string, assessmentType?: string | null) => {
  if (itemType === "assessment") {
    if (assessmentType === "pre_test" || assessmentType === "post_test") {
      return <GraduationCap size={15} className="text-[#8b5cf6] shrink-0" />;
    }
    return <ClipboardCheck size={15} className="text-[#8b5cf6] shrink-0" />;
  }
  if (itemType === "page") {
    return <FileText size={15} className="text-[#8b5cf6] shrink-0" />;
  }
  return <PlayCircle size={15} className="text-[#8b5cf6] shrink-0" />;
};

export default function ModulePage({
  params,
}: {
  params: Promise<{ courseId?: string; moduleId: string }>;
}) {
  const resolvedParams = use(params);
  const moduleId = resolvedParams.moduleId;
  const courseId = resolvedParams.courseId;

  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const overviewTouchStartX = useRef<number | null>(null);
  const listTouchStartX = useRef<number | null>(null);
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const listScrollRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const handleBackToCourse = () => {
    const courseLink = pathname.split("/module")[0];
    router.push(courseLink);
  };

  useEffect(() => {
    const fetchAllModules = async () => {
      try {
        setLoading(true);

        let derivedCourseId = courseId;
        if (!derivedCourseId) {
          const parts = pathname.split("/course/")[1];
          if (parts) derivedCourseId = parts.split("/")[0];
        }

        if (derivedCourseId) {
          const courseRes = await getLearningPlanDetails(derivedCourseId);
          const rawModules = courseRes?.data?.modules || [];

          if (Array.isArray(rawModules) && rawModules.length > 0) {
            const moduleRequests = rawModules.map((m: any) =>
              getModule(m.id || m.module_id || ""),
            );
            const settled = await Promise.all(moduleRequests);
            const valid = settled
              .filter((res) => res.success && res.data)
              .map((res) => res.data as ModuleResponse);

            if (valid.length > 0) {
              setModules(valid);
              const idx = valid.findIndex((m) => m.id === moduleId);
              setActiveIndex(idx >= 0 ? idx : 0);
              return;
            }
          }
        }

        const result = await getModule(moduleId);
        if (!result.success || !result.data)
          throw new Error("Failed to fetch module");
        setModules([result.data as ModuleResponse]);
        setActiveIndex(0);
      } catch (err) {
        console.error("Failed to load modules:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllModules();
  }, [moduleId, courseId, pathname]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setActiveIndex((prev) => Math.min(modules.length - 1, prev + 1));
  };

  const handleSelectModule = (idx: number) => {
    setActiveIndex(idx);
    overviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Center active card smoothly in track
  useEffect(() => {
    if (listScrollRef.current) {
      const container = listScrollRef.current;
      const targetCard = container.children[activeIndex] as HTMLElement;
      if (targetCard) {
        const targetLeft =
          targetCard.offsetLeft -
          container.offsetWidth / 2 +
          targetCard.offsetWidth / 2;
        container.scrollTo({ left: targetLeft, behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleOverviewTouchStart = (e: React.TouchEvent) => {
    overviewTouchStartX.current = e.targetTouches[0].clientX;
  };
  const handleOverviewTouchEnd = (e: React.TouchEvent) => {
    if (!overviewTouchStartX.current) return;
    const distance = overviewTouchStartX.current - e.changedTouches[0].clientX;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    overviewTouchStartX.current = null;
  };

  const handleListTouchStart = (e: React.TouchEvent) => {
    listTouchStartX.current = e.targetTouches[0].clientX;
  };
  const handleListTouchEnd = (e: React.TouchEvent) => {
    if (!listTouchStartX.current) return;
    const distance = listTouchStartX.current - e.changedTouches[0].clientX;
    if (distance > 50) handleNext();
    else if (distance < -50) handlePrev();
    listTouchStartX.current = null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#8b5cf6]" size={32} />
      </div>
    );
  }

  if (error || modules.length === 0) notFound();

  return (
    <main className="w-full min-h-screen bg-white text-zinc-900 pb-20 flex flex-col justify-between">
      <div>
        {/* Top Header: Breadcrumb */}
        <div
          ref={overviewRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-8 sm:pt-10 pb-2"
        >
          <button
            onClick={handleBackToCourse}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-[#7c3aed] transition-colors cursor-pointer"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            <span>Back to My Courses</span>
          </button>
        </div>

        {/* ─── SLIDING CONTENT CARD (OVERVIEW HEADER) ─── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 pt-4 sm:pt-8">
          <div
            onTouchStart={handleOverviewTouchStart}
            onTouchEnd={handleOverviewTouchEnd}
            className="w-full overflow-hidden rounded-3xl touch-pan-y"
          >
            <div
              className="flex w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {modules.map((mod, idx) => {
                const modProgress = mod.progress?.percentage || 0;
                const modSections = mod.sections || [];
                const modSectionsCount = modSections.length;

                return (
                  <div key={mod.id} className="w-full shrink-0">
                    <div className="rounded-3xl  bg-white p-5 sm:p-8 md:p-12">
                      <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
                        {/* Left Column */}
                        <div>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6]">
                            MODULE {(idx + 1).toString().padStart(2, "0")}
                          </span>

                          <h1 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900">
                            {mod.title}
                          </h1>

                          <p className="mt-3 sm:mt-4 max-w-xl text-xs sm:text-base font-light leading-relaxed text-zinc-500">
                            {mod.about || mod.description || "..."}
                          </p>

                          <div className="mt-6 sm:mt-8">
                            <button
                              type="button"
                              onClick={() => router.push(`/learn/${mod.id}`)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-purple-500/20 transition-all hover:bg-[#7c3aed] active:scale-[0.98] cursor-pointer"
                            >
                              {modProgress > 0
                                ? "Continue Learning"
                                : "Start Learning"}
                              <ChevronRight size={14} strokeWidth={2.5} />
                            </button>
                          </div>

                          {/* Stat Cards */}
                          <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
                            <div className="rounded-2xl border border-zinc-100 bg-white p-3.5 sm:p-4 shadow-xs">
                              <div className="flex items-center gap-2 text-zinc-400">
                                <BookOpen
                                  size={16}
                                  className="text-[#8b5cf6]"
                                />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                                  SECTIONS
                                </span>
                              </div>
                              <div className="mt-2 text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
                                {modSectionsCount}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-100 bg-white p-3.5 sm:p-4 shadow-xs">
                              <div className="flex items-center gap-2 text-zinc-400">
                                <Clock3 size={16} className="text-[#8b5cf6]" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">
                                  PROGRESS
                                </span>
                              </div>
                              <div className="mt-2 text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
                                {modProgress}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Outline */}
                        <div className="min-w-0 lg:border-l lg:border-zinc-100 lg:pl-12">
                          <div className="flex items-start gap-4 mb-4 sm:mb-6">
                            <div className="mt-1 h-7 sm:h-8 w-0.5 rounded-full bg-primary" />
                            <div>
                              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
                                Overview
                              </h2>
                              <p className="text-xs text-zinc-400 font-light mt-0.5">
                                A structured overview of the lessons and
                                assessments.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 sm:space-y-4 max-h-[350px] overflow-y-auto pr-1">
                            {modSections.length > 0 ? (
                              modSections.map((sec: Section, sIdx: number) => (
                                <div
                                  key={sec.id}
                                  className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-xs"
                                >
                                  <div className="bg-zinc-50/80 px-4 sm:px-5 py-2.5 sm:py-3 border-b border-zinc-100">
                                    <span className="text-xs font-bold text-zinc-800">
                                      Section {sIdx + 1}: {sec.title}
                                    </span>
                                  </div>

                                  {sec.items && sec.items.length > 0 ? (
                                    <div className="divide-y divide-zinc-100">
                                      {sec.items.map((item: SectionItem) => (
                                        <Link
                                          key={item.id}
                                          href={`/learn/${mod.id}?item=${item.id}`}
                                          className="group flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 text-xs transition-colors hover:bg-purple-50/30"
                                        >
                                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                                            {getItemIcon(
                                              item.item_type,
                                              item.assessment_type,
                                            )}
                                            <span className="font-medium text-zinc-600 group-hover:text-[#8b5cf6] transition-colors truncate">
                                              {item.title}
                                            </span>
                                          </div>
                                          <ChevronRight
                                            size={14}
                                            className="text-zinc-300 group-hover:text-[#8b5cf6] transition-colors shrink-0"
                                          />
                                        </Link>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="px-4 sm:px-6 py-3 text-xs text-zinc-400 font-light">
                                      No items in this section.
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 sm:p-8 text-center text-xs text-zinc-400 font-light">
                                No sections found for this module.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── MODULES CAROUSEL LIST SECTION ─── */}
          {modules.length > 1 && (
            <div className="pt-12 sm:pt-16 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900">
                    Course Modules
                  </h3>
                  <p className="text-xs text-zinc-500 font-light mt-0.5">
                    Click any module card to inspect it in the overview above.
                  </p>
                </div>
              </div>

              {/* Flex Container: Outer arrows separated from track */}
              <div className="flex items-center gap-2 sm:gap-4 w-full">
                {/* Left Outer Arrow Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={activeIndex === 0}
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-all ${
                    activeIndex === 0
                      ? "opacity-25 cursor-not-allowed pointer-events-none"
                      : "hover:bg-zinc-50 hover:text-[#7c3aed] hover:scale-105 active:scale-95 cursor-pointer"
                  }`}
                  aria-label="Previous Module"
                >
                  <ChevronLeft size={20} strokeWidth={2.4} />
                </button>

                {/* Module Cards Track */}
                <div
                  ref={listScrollRef}
                  onTouchStart={handleListTouchStart}
                  onTouchEnd={handleListTouchEnd}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  className="flex-1 flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 px-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden"
                >
                  {modules.map((m, idx) => {
                    const isCurrent = idx === activeIndex;
                    const modProgress = m.progress?.percentage || 0;
                    const totalLessons =
                      m.sections?.reduce(
                        (acc, sec) => acc + (sec.items?.length || 0),
                        0,
                      ) || 0;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectModule(idx)}
                        className={`group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-left transition-all duration-300 cursor-pointer snap-center flex-[0_0_80%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)] h-[195px] sm:h-[220px] overflow-hidden ${
                          isCurrent
                            ? "bg-purple-50/70 border-2 border-[#8b5cf6] shadow-lg shadow-purple-500/10 scale-[1.01]"
                            : "bg-zinc-50/70 border border-zinc-200/80 hover:bg-white hover:border-zinc-300 hover:shadow-md"
                        }`}
                      >
                        <div className="w-full min-w-0 overflow-hidden">
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                            <span
                              className={`font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0 ${
                                isCurrent
                                  ? "bg-[#8b5cf6] text-white"
                                  : "bg-zinc-200/70 text-zinc-600 group-hover:bg-zinc-200"
                              }`}
                            >
                              Module {(idx + 1).toString().padStart(2, "0")}
                            </span>

                            {modProgress === 100 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 shrink-0">
                                <CheckCircle2 size={13} /> Completed
                              </span>
                            ) : (
                              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 shrink-0">
                                {modProgress}%
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-[#8b5cf6] transition-colors truncate block w-full">
                            {m.title}
                          </h4>

                          {/* Fixed 2-line height Description with ellipsis */}
                          <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-light leading-relaxed text-zinc-500 h-8 sm:h-9 line-clamp-2 break-all overflow-hidden text-ellipsis">
                            {m.about ||
                              m.description ||
                              "this is a test description for the module card. it should be truncated after 2 lines and show an ellipsis if it exceeds the height limit."}
                          </p>
                        </div>

                        {/* Card Bottom Meta */}
                        <div className="w-full mt-3 sm:mt-4 pt-2.5 sm:pt-4 border-t border-zinc-200/60 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 shrink-0">
                          <div className="flex items-center gap-2.5 sm:gap-3 truncate pr-1">
                            <span className="flex items-center gap-1 shrink-0">
                              <BookOpen size={13} className="text-[#8b5cf6]" />
                              {m.sections?.length || 0} Sections
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Layers size={13} className="text-[#8b5cf6]" />
                              {totalLessons} Lessons
                            </span>
                          </div>

                          <ChevronRight
                            size={14}
                            className={`shrink-0 transition-transform duration-200 ${
                              isCurrent
                                ? "text-[#8b5cf6] translate-x-1"
                                : "text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1"
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Outer Arrow Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={activeIndex === modules.length - 1}
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-all ${
                    activeIndex === modules.length - 1
                      ? "opacity-25 cursor-not-allowed pointer-events-none"
                      : "hover:bg-zinc-50 hover:text-[#7c3aed] hover:scale-105 active:scale-95 cursor-pointer"
                  }`}
                  aria-label="Next Module"
                >
                  <ChevronRight size={20} strokeWidth={2.4} />
                </button>
              </div>

              {/* Expanding Dots Indicator Centered Below Carousel */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {modules.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectModule(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeIndex
                        ? "w-8 bg-[#8b5cf6]"
                        : "w-2 bg-zinc-200 hover:bg-zinc-300"
                    }`}
                    aria-label={`Go to module ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
