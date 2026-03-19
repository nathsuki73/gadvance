import React from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import {
  ModuleContentViewer,
  type ModuleBlock,
} from "@/app/components/moduleViewer";
import { Search } from "lucide-react";

type CourseModule = {
  id: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  blocks: ModuleBlock[];
};

const courseModules: CourseModule[] = [
  {
    id: 1,
    title: "Gender Equality Fundamentals",
    description:
      "Understand key concepts, history, and practical steps for gender equity.",
    duration: "4 weeks",
    progress: 65,
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
      "Learn leadership frameworks, communication strategies, and mentorship pathways.",
    duration: "6 weeks",
    progress: 45,
    blocks: [
      {
        id: "m2-section",
        type: "section",
        title: "Leadership Skills",
        description:
          "Focus on confidence, decision making, and strategic communication.",
        children: [
          {
            id: "m2-title",
            type: "title",
            text: "Leading Teams with Clarity",
            level: 3,
          },
          {
            id: "m2-para",
            type: "paragraph",
            text: "Effective leaders align team goals, create trust, and communicate expectations consistently.",
          },
        ],
      },
      {
        id: "m2-video",
        type: "video",
        title: "Women Leaders in Practice",
        url: "https://www.youtube.com/watch?v=Q0sZc0r2B5Y",
      },
    ],
  },
  {
    id: 3,
    title: "Workplace Rights & Advocacy",
    description:
      "Build confidence around legal rights, reporting systems, and advocacy actions.",
    duration: "5 weeks",
    progress: 80,
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
    ],
  },
  {
    id: 4,
    title: "Mental Health & Wellness",
    description:
      "Develop resilience habits and support systems for sustained well-being.",
    duration: "3 weeks",
    progress: 30,
    blocks: [
      {
        id: "m4-section",
        type: "section",
        title: "Wellness Toolkit",
        children: [
          {
            id: "m4-para",
            type: "paragraph",
            text: "Small daily routines such as reflection, movement, and boundary setting reduce long-term stress load.",
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
    ],
  },
];

const Workspace = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-zinc-900">
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

        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-black tracking-tight">Course Modules</h2>
        </div>

        <div className="space-y-8">
          {courseModules.map((module) => (
            <article
              key={module.id}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8"
            >
              <header className="mb-6 border-b border-zinc-100 pb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                    Module {module.id}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {module.progress}% complete
                  </span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    {module.duration}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
                  {module.title}
                </h3>
                <p className="mt-2 text-zinc-600">{module.description}</p>
              </header>

              <ModuleContentViewer
                blocks={module.blocks}
                className="space-y-4"
              />
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Workspace;
