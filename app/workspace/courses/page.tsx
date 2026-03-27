"use client";

import React, { useMemo, useState } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { BlockRenderer, type ModuleBlock } from "@/app/components/moduleViewer";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Clock3,
  Globe,
  Heart,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";

type CourseModule = {
  id: number;
  title: string;
  description: string;
  duration: string;
  enrolled: string;
  progress: number;
  tag: string;
  accent: string;
  icon: "globe" | "briefcase" | "target" | "wellness";
  blocks: ModuleBlock[];
};

type ModuleNavItem = {
  id: string;
  label: string;
};

const courseModules: CourseModule[] = [
  {
    id: 1,
    title: "Gender Equality Fundamentals",
    description:
      "Understanding the principles and importance of gender equality in modern society.",
    progress: 65,
    duration: "4 weeks",
    enrolled: "12,500",
    tag: "Foundational",
    accent: "#14b8a6",
    icon: "globe",
    blocks: [
      {
        id: "m1-title",
        type: "title",
        text: "Module 1: Foundations of Gender Equality",
        level: 2,
      },
      {
        id: "m1-intro",
        type: "paragraph",
        text: "This module introduces the language, legal framing, and core principles of gender equality in education, work, and society.",
      },
      {
        id: "m1-video",
        type: "video",
        title: "Why Gender Equality Matters",
        url: "https://www.youtube.com/watch?v=hL5L9Q2qG4k",
        description:
          "Watch a short overview before moving to your first knowledge check.",
      },
      {
        id: "m1-quiz",
        type: "quiz",
        question: "Which statement best defines gender equality?",
        options: [
          "Equal rights, responsibilities, and opportunities for all genders",
          "Treating everyone exactly the same in every context",
          "Prioritizing one gender to correct all inequalities instantly",
        ],
        explanation:
          "Equality means fair rights and opportunities while addressing structural barriers.",
      },
      {
        id: "m1-game",
        type: "game",
        title: "Bias Spotting Challenge",
        description:
          "Practice identifying bias in short workplace and classroom scenarios.",
        href: "#",
        ctaLabel: "Play challenge",
      },
    ],
  },
  {
    id: 2,
    title: "Women in Leadership",
    description:
      "Developing leadership skills and breaking barriers in professional environments.",
    progress: 45,
    duration: "6 weeks",
    enrolled: "8,900",
    tag: "Professional",
    accent: "#f97316",
    icon: "briefcase",
    blocks: [
      {
        id: "m2-title",
        type: "title",
        text: "Module 2: Leadership Skills",
        level: 2,
      },
      {
        id: "m2-para",
        type: "paragraph",
        text: "Focus on confidence, decision making, strategic communication, and mentorship pathways.",
      },
      {
        id: "m2-video",
        type: "video",
        title: "Women Leaders in Practice",
        url: "https://www.youtube.com/watch?v=Q0sZc0r2B5Y",
      },
      {
        id: "m2-quiz",
        type: "quiz",
        question: "Which skill most directly improves team alignment?",
        options: [
          "Clear communication",
          "Avoiding feedback",
          "Working in isolation",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Workplace Rights & Advocacy",
    description:
      "Learn about workplace rights, discrimination prevention, and advocacy strategies.",
    progress: 80,
    duration: "5 weeks",
    enrolled: "10,200",
    tag: "Legal",
    accent: "#10b981",
    icon: "target",
    blocks: [
      {
        id: "m3-title",
        type: "title",
        text: "Module 3: Rights and Response",
        level: 2,
      },
      {
        id: "m3-paragraph",
        type: "paragraph",
        text: "You will learn how to identify violations, document incidents, and use internal and external support channels.",
      },
      {
        id: "m3-quiz",
        type: "quiz",
        question:
          "What is usually the first step after documenting an incident?",
        options: [
          "Use the organization reporting or grievance process",
          "Ignore it and wait for repetition",
          "Immediately publish details on social media",
        ],
      },
      {
        id: "m3-game",
        type: "game",
        title: "Policy Path Simulator",
        description:
          "Practice choosing reporting paths in realistic scenarios.",
        href: "#",
      },
    ],
  },
  {
    id: 4,
    title: "Mental Health & Wellness",
    description:
      "Supporting mental well-being and building resilience in challenging environments.",
    progress: 30,
    duration: "3 weeks",
    enrolled: "15,800",
    tag: "Wellness",
    accent: "#ec4899",
    icon: "wellness",
    blocks: [
      {
        id: "m4-title",
        type: "title",
        text: "Module 4: Wellness Toolkit",
        level: 2,
      },
      {
        id: "m4-para",
        type: "paragraph",
        text: "Small daily routines such as reflection, movement, and boundary setting reduce long-term stress load.",
      },
      {
        id: "m4-video",
        type: "video",
        title: "Resilience Basics",
        url: "https://www.youtube.com/watch?v=hnpQrMqDoqE",
      },
      {
        id: "m4-quiz",
        type: "quiz",
        question: "Which action supports sustainable stress recovery?",
        options: ["Sleep routine", "Skipping meals", "Overworking"],
      },
      {
        id: "m4-game",
        type: "game",
        title: "Stress Reset Simulator",
        description:
          "Choose healthy responses in realistic day-to-day stress situations.",
        href: "#",
      },
    ],
  },
];

const iconByType = {
  globe: Globe,
  briefcase: Briefcase,
  target: Target,
  wellness: Heart,
} as const;

const getBlockLabel = (block: ModuleBlock): string => {
  switch (block.type) {
    case "title":
      return "Title";
    case "section":
      return "Section";
    case "paragraph":
      return "Paragraph";
    case "video":
      return "Video";
    case "quiz":
      return "Quiz";
    case "game":
      return "Game";
    default:
      return "Block";
  }
};

const getBlockAnchorId = (block: ModuleBlock, index: number): string => {
  const rawId =
    typeof block.id === "string" || typeof block.id === "number"
      ? String(block.id)
      : `${block.type}-${index}`;
  return `module-block-${rawId}`;
};

const buildModuleNavItems = (blocks: ModuleBlock[]): ModuleNavItem[] => {
  return blocks.map((block, index) => ({
    id: getBlockAnchorId(block, index),
    label: getBlockLabel(block),
  }));
};

const CourseCard = ({
  module,
  onClick,
}: {
  module: CourseModule;
  onClick: () => void;
}) => {
  const Icon = iconByType[module.icon];

  return (
    <article className="group flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: module.accent }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "#bceee6",
              color: "#056f64",
            }}
          >
            {module.tag}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-[2.05rem] font-black tracking-tight text-zinc-900">
          {module.title}
        </h3>
        <p className="mt-2 text-[1.15rem] leading-relaxed text-zinc-600">
          {module.description}
        </p>
      </div>

      <div className="flex items-center gap-5 text-[1.05rem] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={15} className="text-zinc-500" />
          {module.duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={15} className="text-zinc-500" />
          {module.enrolled} enrolled
        </span>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[1.05rem] text-zinc-500">
          <span>Your Progress</span>
          <span className="font-bold" style={{ color: module.accent }}>
            {module.progress}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-zinc-300">
          <div
            className="h-2 rounded-full"
            style={{
              backgroundColor: module.accent,
              width: `${module.progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-1">
        <button
          type="button"
          onClick={onClick}
          className="w-full rounded-lg px-4 py-2.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: module.accent }}
        >
          <span className="inline-flex items-center gap-1.5">
            Continue Learning
            <ArrowUpRight size={15} />
          </span>
        </button>
      </div>
    </article>
  );
};

const Workspace = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [activeNavId, setActiveNavId] = useState<string>("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const selectedModule = courseModules.find((m) => m.id === selectedModuleId);
  const moduleNavItems = useMemo(
    () => (selectedModule ? buildModuleNavItems(selectedModule.blocks) : []),
    [selectedModule],
  );

  const displayedNavId = activeNavId || moduleNavItems[0]?.id || "";

  const handleModuleNavClick = (navId: string) => {
    setActiveNavId(navId);
    const target = document.getElementById(navId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileNavOpen(false);
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] font-sans text-zinc-900">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-10">
          <button
            onClick={() => {
              setSelectedModuleId(null);
              setActiveNavId("");
              setIsMobileNavOpen(false);
            }}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <ArrowLeft size={16} />
            Back to courses
          </button>

          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <header className="mb-6 border-b border-zinc-100 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  Module {selectedModule.id}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: selectedModule.accent }}
                >
                  {selectedModule.progress}% complete
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {selectedModule.duration}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
                {selectedModule.title}
              </h1>
              <p className="mt-2 text-zinc-600">{selectedModule.description}</p>
            </header>

            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className={`fixed left-0 top-1/2 z-30 -translate-y-1/2 rounded-r-lg border border-l-0 border-zinc-200 bg-[#f7f8fa] p-2.5 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 lg:hidden ${
                isMobileNavOpen
                  ? "pointer-events-none opacity-0"
                  : "opacity-100"
              }`}
              aria-label="Open module structure"
            >
              <ChevronRight size={18} />
            </button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
              <aside className="sticky top-24 hidden h-fit self-start rounded-xl border border-zinc-200 bg-[#f7f8fa] p-4 lg:block">
                <h2 className="mb-3 text-xl font-bold text-zinc-900">
                  Module Structure
                </h2>
                <div className="space-y-2">
                  {moduleNavItems.map((item) => {
                    const isActive = item.id === displayedNavId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleModuleNavClick(item.id)}
                        className="w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors"
                        style={
                          isActive
                            ? {
                                borderColor: selectedModule.accent,
                                backgroundColor: `${selectedModule.accent}1A`,
                                color: selectedModule.accent,
                              }
                            : {
                                borderColor: "#e4e4e7",
                                backgroundColor: "#ffffff",
                                color: "#111827",
                              }
                        }
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="space-y-5">
                {selectedModule.blocks.map((block, index) => {
                  const anchorId = getBlockAnchorId(block, index);
                  const key = block.id ?? `${block.type}-${index}`;
                  return (
                    <section key={key} id={anchorId} className="scroll-mt-24">
                      <BlockRenderer block={block} />
                    </section>
                  );
                })}
              </div>
            </div>

            <div
              className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
                isMobileNavOpen
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!isMobileNavOpen}
            >
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="absolute inset-0 bg-black/35"
                aria-label="Close module structure"
              />

              <aside
                className={`absolute left-0 top-0 h-full w-[84%] max-w-sm border-r border-zinc-200 bg-[#f7f8fa] p-4 shadow-xl transition-transform duration-300 ${
                  isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900">
                    Module Structure
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="rounded-md border border-zinc-300 bg-white p-1.5 text-zinc-700"
                    aria-label="Close navigation panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {moduleNavItems.map((item) => {
                    const isActive = item.id === displayedNavId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleModuleNavClick(item.id)}
                        className="w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors"
                        style={
                          isActive
                            ? {
                                borderColor: selectedModule.accent,
                                backgroundColor: `${selectedModule.accent}1A`,
                                color: selectedModule.accent,
                              }
                            : {
                                borderColor: "#e4e4e7",
                                backgroundColor: "#ffffff",
                                color: "#111827",
                              }
                        }
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </aside>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] font-sans text-zinc-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-12 rounded-[40px] border border-zinc-100 bg-white p-10 shadow-sm">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-4xl font-black tracking-tight">
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
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </div>
        </div>

        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-black tracking-tight">
            Educational Programs
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {courseModules.map((module) => (
            <CourseCard
              key={module.id}
              module={module}
              onClick={() => {
                setSelectedModuleId(module.id);
                setActiveNavId("");
                setIsMobileNavOpen(false);
              }}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Workspace;
