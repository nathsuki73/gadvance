import type {
  ModuleResponse,
  Block,
} from "../../../../(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

export type ModuleNavItem = {
  id: string;

  label: string;

  children?: ModuleNavItem[];

  isGroup?: boolean;
};

export type ModuleArticleBlock = {
  key: string;

  anchorId: string;

  block: Block;
};

export type ModuleArticle = {
  id: string;

  label: string;

  blocks: ModuleArticleBlock[];
};

/**
 * Build content articles
 * Each SECTION becomes an article
 */
export const buildModuleArticles = (
  module: ModuleResponse,
): ModuleArticle[] => {
  return module.lessons.map((lesson) => ({
    id: `lesson-${lesson.id}`,
    label: lesson.title,

    blocks: lesson.blocks.map((block) => ({
      key: block.id,
      anchorId: `block-${block.id}`,
      block,
    })),
  }));
};

/**
 * Build sidebar navigation
 * Section Groups -> Sections
 */
export const buildModuleNavItems = (
  module: ModuleResponse,
): ModuleNavItem[] => {
  return module.lessons.map((lesson) => ({
    id: `lesson-${lesson.id}`,
    label: lesson.title,
  }));
};
