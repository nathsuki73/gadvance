export type Block = {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  order_index: number;
  progress?: {
    completed: boolean;
    completed_at?: string | null;
  };
};

export type QuizBlock = {
  id: string;
  lesson_id: string;
  bloom_tier: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  blocks: Block[]; // Text/Video content blocks
  quiz_blocks: QuizBlock[]; // Assessment/Knowledge check question blocks
  progress?: {
    completed_blocks: number;
    total_blocks: number;
    percentage: number;
  };
};

export type ModuleProgressResponse = {
  completed_blocks: number;
  total_blocks: number;
  percentage: number;
};

export type ModuleResponse = {
  [x: string]: any;
  id: string;
  title: string;
  about?: string;
  image?: string;
  lessons: Lesson[]; // <-- Replaced section_groups with your clean lessons list!
  progress?: ModuleProgressResponse;
};
