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

export type Section = {
  id: string;

  title: string;

  order_index: number;

  blocks: Block[];

  progress?: {
    completed_blocks: number;
    total_blocks: number;
    percentage: number;
  };
};

export type SectionGroup = {
  id: string;

  title: string;

  order_index: number;

  sections: Section[];

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
  id: string;

  title: string;

  about?: string;

  image?: string;

  section_groups: SectionGroup[];

  progress?: ModuleProgressResponse;
};
