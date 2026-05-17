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
