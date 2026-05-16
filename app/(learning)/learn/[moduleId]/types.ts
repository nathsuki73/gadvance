// types.ts

/*
|--------------------------------------------------------------------------
| BLOCK TYPES
|--------------------------------------------------------------------------
*/

export type BlockType =
  | "banner"
  | "image"
  | "text"
  | "title"
  | "video"
  | "code"
  | "quiz"
  | "game";

export type BaseBlock = {
  id: string;
  type: BlockType;
  content: string;
  metadata?: Record<string, unknown>;
  order_index: number;
  updated_at?: string;
};

export type BannerBlock = BaseBlock & {
  type: "banner";
};

export type TextBlock = BaseBlock & {
  type: "text";
};

export type ImageBlock = BaseBlock & {
  type: "image";
};

export type VideoBlock = BaseBlock & {
  type: "video";
};

export type CodeBlock = BaseBlock & {
  type: "code";
};

export type QuizBlock = BaseBlock & {
  type: "quiz";
};

export type GameBlock = BaseBlock & {
  type: "game";
};

export type TitleBlock = BaseBlock & {
  type: "title";
};

export type ModuleBlock =
  | BannerBlock
  | TextBlock
  | ImageBlock
  | TitleBlock
  | VideoBlock
  | CodeBlock
  | QuizBlock
  | GameBlock;

/*
|--------------------------------------------------------------------------
| SECTION TYPES
|--------------------------------------------------------------------------
*/

export type Section = {
  id: string;
  section_groups_id?: string;
  title: string;
  order_index: number;
  blocks: ModuleBlock[];
  created_at?: string;
  updated_at?: string;
};

export type FlattenedSection = Section & {
  groupTitle?: string;
};

/*
|--------------------------------------------------------------------------
| SECTION GROUP TYPES
|--------------------------------------------------------------------------
*/

export type SectionGroup = {
  id: string;
  module_id?: string;
  title: string;
  order_index: number;
  sections: Section[];
  created_at?: string;
  updated_at?: string;
};

/*
|--------------------------------------------------------------------------
| LEARNING PLAN TYPES
|--------------------------------------------------------------------------
*/

export type LearningPlanPivot = {
  module_id: string;
  learning_plan_id: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
};

export type LearningPlan = {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  pivot?: LearningPlanPivot;
};

/*
|--------------------------------------------------------------------------
| MODULE TYPES
|--------------------------------------------------------------------------
*/

export type ModuleResponse = {
  id: string;
  title: string;
  about?: string;
  image?: string | null;
  learning_plans?: LearningPlan[];
  section_groups: SectionGroup[];
  created_at?: string;
  updated_at?: string;
};

export type Block = {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
  order_index: number;
};

export type ModuleSectionViewerProps = {
  section: FlattenedSection;

  currentIndex: number;
  totalSections: number;

  onNext: () => void;
  onPrevious: () => void;

  isFirst: boolean;
  isLast: boolean;
};
