export type BlockType =
  | "section"
  | "video"
  | "title"
  | "paragraph"
  | "quiz"
  | "game";

type BaseBlock = {
  id?: string | number;
  type: BlockType;
};

export type SectionBlock = BaseBlock & {
  type: "section";
  title?: string;
  description?: string;
  children?: ModuleBlock[];
};

export type VideoBlock = BaseBlock & {
  type: "video";
  title?: string;
  url: string;
  description?: string;
};

export type TitleBlock = BaseBlock & {
  type: "title";
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
};

export type ParagraphBlock = BaseBlock & {
  type: "paragraph";
  text: string;
};

export type QuizOption = {
  id?: string | number;
  text: string;
};

export type QuizBlock = BaseBlock & {
  type: "quiz";
  question: string;
  options: Array<string | QuizOption>;
  answer?: string | number;
  explanation?: string;
};

export type GameBlock = BaseBlock & {
  type: "game";
  title: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
};

export type ModuleBlock =
  | SectionBlock
  | VideoBlock
  | TitleBlock
  | ParagraphBlock
  | QuizBlock
  | GameBlock;
