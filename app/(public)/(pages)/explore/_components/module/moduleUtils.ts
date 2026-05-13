// components/explore/module/moduleUtils.ts

import type { ModuleBlock } from "@/app/components/moduleViewer";
import type { CourseModule } from "@/app/lib/courseModules";

export type ModuleNavItem = {
  id: string;
  label: string;
  children?: ModuleNavItem[];
  isModule?: boolean;
};

export type ModuleArticle = {
  id: string;
  label: string;
  blocks: Array<{
    block: ModuleBlock;
    index: number;
    anchorId: string;
    key: string;
  }>;
};

export const getBlockLabel = (block: ModuleBlock): string => {
  switch (block.type) {
    case "title":
      return (block as any).text || "Title";

    case "section":
      return (block as any).title || "Section";

    case "paragraph":
      return (block as any).text?.substring(0, 50) || "Paragraph";

    case "video":
      return (block as any).title || "Video";

    case "quiz":
      return (block as any).question || "Quiz";

    case "game":
      return (block as any).title || "Game";

    default:
      return "Block";
  }
};

export const getBlockAnchorId = (block: ModuleBlock, index: number): string => {
  const rawId =
    typeof block.id === "string" || typeof block.id === "number"
      ? String(block.id)
      : `${block.type}-${index}`;

  return `module-block-${rawId}`;
};

export const isModuleTitleBlock = (block: ModuleBlock): boolean =>
  block.type === "title" &&
  typeof (block as any).text === "string" &&
  (block as any).text.includes("Module");

export const buildModuleArticles = (
  selectedModule: CourseModule | undefined,
): ModuleArticle[] => {
  if (!selectedModule) return [];

  const articles: ModuleArticle[] = [];

  let currentArticle: ModuleArticle | null = null;

  selectedModule.blocks.forEach((block, index) => {
    const anchorId = getBlockAnchorId(block, index);

    const blockEntry = {
      block,
      index,
      anchorId,
      key: String(block.id ?? `${block.type}-${index}`),
    };

    if (isModuleTitleBlock(block)) {
      if (currentArticle) {
        articles.push(currentArticle);
      }

      currentArticle = {
        id: `module-article-${anchorId}`,
        label: getBlockLabel(block),
        blocks: [blockEntry],
      };

      return;
    }

    if (!currentArticle) {
      currentArticle = {
        id: `module-article-${selectedModule.id}`,
        label: selectedModule.title,
        blocks: [],
      };
    }

    currentArticle.blocks.push(blockEntry);
  });

  if (currentArticle) {
    articles.push(currentArticle);
  }

  return articles;
};

export const buildModuleNavItems = (
  selectedModule: CourseModule | undefined,
): ModuleNavItem[] => {
  return buildModuleArticles(selectedModule).map((article) => ({
    id: article.id,
    label: article.label,
    isModule: true,

    children: article.blocks.slice(1).map((entry) => ({
      id: entry.anchorId,
      label: getBlockLabel(entry.block),
    })),
  }));
};
