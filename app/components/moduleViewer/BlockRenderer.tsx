import React from "react";
import GameDisplay from "./GameDisplay";
import ParagraphDisplay from "./ParagraphDisplay";
import QuizDisplay from "./QuizDisplay";
import SectionDisplay from "./SectionDisplay";
import TitleDisplay from "./TitleDisplay";
import VideoDisplay from "./VideoDisplay";
import type { ModuleBlock } from "./types";

type BlockRendererProps = {
  block: ModuleBlock;
};

const BlockRenderer = ({ block }: BlockRendererProps) => {
  switch (block.type) {
    case "section": {
      return (
        <SectionDisplay title={block.title} description={block.description}>
          {block.children?.map((child, index) => {
            const key = child.id ?? `${child.type}-${index}`;
            return <BlockRenderer key={key} block={child} />;
          })}
        </SectionDisplay>
      );
    }

    case "video": {
      return (
        <VideoDisplay
          title={block.title}
          url={block.url}
          description={block.description}
        />
      );
    }

    case "title": {
      return <TitleDisplay text={block.text} level={block.level} />;
    }

    case "paragraph": {
      return <ParagraphDisplay text={block.text} />;
    }

    case "quiz": {
      return (
        <QuizDisplay
          question={block.question}
          options={block.options}
          explanation={block.explanation}
        />
      );
    }

    case "game": {
      return (
        <GameDisplay
          title={block.title}
          description={block.description}
          href={block.href}
          ctaLabel={block.ctaLabel}
        />
      );
    }

    default:
      return null;
  }
};

export default BlockRenderer;
