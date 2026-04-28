import type { ModuleBlock } from "@/app/components/moduleViewer";

export type CourseModule = {
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

export const courseModules: CourseModule[] = [
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
      {
        id: "m1-module2-title",
        type: "title",
        text: "Module 2: Gender Equality Fundamentals",
        level: 2,
      },
      {
        id: "m1-m2-section-1",
        type: "section",
        title: "Understanding Core Concepts",
      },
      {
        id: "m1-m2-intro",
        type: "paragraph",
        text: "Gender equality is a human right and a prerequisite for peace, prosperity, and sustainable development. This section explores the foundational concepts, theoretical frameworks, and practical applications of gender equality across societies.",
      },
      {
        id: "m1-m2-video-1",
        type: "video",
        title: "What is Gender Equality?",
        url: "https://www.youtube.com/watch?v=hL5L9Q2qG4k",
        description:
          "Comprehensive overview of gender equality definitions and why it matters globally.",
      },
      {
        id: "m1-m2-quiz-1",
        type: "quiz",
        question: "What is the primary goal of gender equality?",
        options: [
          "Fair rights, opportunities, and responsibilities for all genders",
          "Eliminating all differences between genders",
          "Giving power to women over men",
        ],
        explanation:
          "Gender equality means fair treatment and equal opportunity regardless of gender, while respecting diversity.",
      },
      {
        id: "m1-m2-section-2",
        type: "section",
        title: "Intersectionality in Gender Equality",
      },
      {
        id: "m1-m2-para-intersectionality",
        type: "paragraph",
        text: "Intersectionality recognizes that gender equality must account for how gender intersects with race, class, ethnicity, disability, sexuality, and other identities. Understanding these intersections is crucial for creating truly inclusive gender equality initiatives.",
      },
      {
        id: "m1-m2-video-2",
        type: "video",
        title: "Intersectionality Explained",
        url: "https://www.youtube.com/watch?v=QJ2h7C7p2Tg",
        description:
          "Learn how multiple identities shape experiences of gender and inequality.",
      },
      {
        id: "m1-m2-quiz-2",
        type: "quiz",
        question: "Why is intersectionality important in gender equality work?",
        options: [
          "It ensures solutions address diverse needs across different groups",
          "It complicates the conversation unnecessarily",
          "It focuses only on women's experiences",
        ],
        explanation:
          "Intersectionality ensures gender equality initiatives don't leave anyone behind by recognizing overlapping identities.",
      },
      {
        id: "m1-m2-game",
        type: "game",
        title: "Equality Framework Challenge",
        description:
          "Analyze scenarios to identify gender inequality factors and intersectional considerations.",
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
