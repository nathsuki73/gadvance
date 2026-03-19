"use client";

import React, { useState } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import {
  ModuleContentViewer,
  type ModuleBlock,
} from "@/app/components/moduleViewer";
import { ArrowLeft, Search } from "lucide-react";

type CourseModule = {
  id: number;
  title: string;
  description: string;
  duration: string;
  progress: number;
  color: string;
  tag: string;
  blocks: ModuleBlock[];
};

const courseModules: CourseModule[] = [
  {
    id: 1,
    title: "Gender Equality Fundamentals",
    description:
      "Principles and importance of gender equality in modern society.",
    progress: 65,
    duration: "4 weeks",
    color: "#009B8E",
    tag: "Foundational",
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
    color: "#FF7A00",
    tag: "Professional",
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
      "Workplace rights, discrimination prevention, and advocacy strategies.",
    progress: 80,
    duration: "5 weeks",
    color: "#009B8E",
    tag: "Legal",
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
      "Supporting mental well-being and building resilience in challenging environments.",
    progress: 30,
    duration: "3 weeks",
    color: "#FF3B9E",
    tag: "Wellness",
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

const CourseCard = ({
  module,
  onClick,
}: {
  module: CourseModule;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className="h-2 w-24 rounded-full"
          style={{ backgroundColor: module.color }}
        />
        <span
          className="rounded px-2 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${module.color}20`, color: module.color }}
        >
          {module.tag}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold tracking-tight text-zinc-900">
          {module.title}
        </h3>
        <p className="mt-2 text-sm text-zinc-600">{module.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-zinc-600 mb-1">
            <span>Progress</span>
            <span>{module.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${module.progress}%`,
                backgroundColor: module.color,
              }}
            />
          </div>
        </div>
      </div>
      <div className="text-xs text-zinc-500">{module.duration}</div>
    </button>
  );
};

const Workspace = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const selectedModule = courseModules.find((m) => m.id === selectedModuleId);

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] font-sans text-zinc-900">
        <Header />

        <main className="mx-auto max-w-7xl px-6 py-10">
          <button
            onClick={() => setSelectedModuleId(null)}
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
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: `${selectedModule.color}20`,
                    color: selectedModule.color,
                  }}
                >
                  {selectedModule.progress}% complete
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  {selectedModule.duration}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
                {selectedModule.title}
              </h1>
              <p className="mt-2 text-zinc-600">{selectedModule.description}</p>
            </header>

            <ModuleContentViewer
              blocks={selectedModule.blocks}
              className="space-y-5"
            />
          </article>
        </main>

        <Footer />
      </div>
    );
  }

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

        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-black tracking-tight">
            Educational Programs
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {courseModules.map((module) => (
            <CourseCard
              key={module.id}
              module={module}
              onClick={() => setSelectedModuleId(module.id)}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Workspace;
