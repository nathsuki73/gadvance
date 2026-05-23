"use client";

import React from "react";

import BannerBlock from "../_blocks/BannerBlock";
import TextBlock from "../_blocks/TextBlock";
import ImageBlock from "../_blocks/ImageBlock";
import TitleDisplay from "../_blocks/TitleDisplayBlock";
import ImageTextBlock from "../_blocks/ImageTextBlock";
import QuizBlock from "../_blocks/QuizBlock";
import VideoDisplayBlock from "../_blocks/VideoDisplayBlock";
import SurveyBlock from "../_blocks/SurveyBlock";

// 1. Keep your strict structural definition or imports untouched
import type { ModuleBlock } from "../types";
import type { Block } from "../types"; // Import the generic Block shape we defined earlier
import ReadingBlock from "../_blocks/ReadingBlock";

type BlockRendererProps = {
  block: ModuleBlock | Block | any;
  onQuizBlockCompleted?: (blockId: string) => void;
  onBlockCompletedLive?: (
    blockId: string,
    interactionType: "reading" | "quiz" | "text" | "video",
  ) => void; // 🎯 ADD LIVE TRACKING HANDLER DEFINITION
  lessonId?: string;
};

const BlockRenderer = ({
  block,
  onQuizBlockCompleted,
  onBlockCompletedLive,
  lessonId, // 🎯 DESTRUCTURE THE INCOMING PROP:
}: BlockRendererProps) => {
  // 3. Optional: Type-guard string literal casting to satisfy the switch statement evaluator smoothly
  const blockType = block.type as string;

  switch (blockType) {
    case "banner":
      return <BannerBlock imageUrl={block.content} />;

    case "text":
      return <TextBlock blockId={block.id} content={block.content} />;
    case "image":
      return <ImageBlock imageUrl={block.content} />;
    case "title":
      return <TitleDisplay content={block.content} metadata={block.metadata} />;
    case "image_text":
      return (
        <ImageTextBlock content={block.content} metadata={block.metadata} />
      );
    case "video":
      return (
        <VideoDisplayBlock
          content={block.content}
          metadata={block.metadata}
          backendBlockId={block.id} // Or block.backendBlockId depending on your array item structure
          lessonId={lessonId} // Passes down the parent lesson identifier variable string
          initialCompleted={block.completed || false} // Keeps current checkbox states synced on load
          onCompleted={() => onBlockCompletedLive?.(block.id, "video")}
        />
      );
    case "pretest":
      return (
        <QuizBlock
          content={block.content}
          metadata={block.metadata}
          onQuestionCompleted={onQuizBlockCompleted}
          // 🎯 FORWARD THE CLEAN LESSON ID UUID DOWN TO THE LOGIC ENGINE:
          lessonId={lessonId}
        />
      );
    case "survey":
      return <SurveyBlock content={block.content} />;
    case "reading":
      return (
        <ReadingBlock
          backendBlockId={block.id}
          content={block.content}
          metadata={block.metadata}
          lessonId={lessonId}
          onCompleted={() => onBlockCompletedLive?.(block.id, "reading")}
        />
      );
    case "lesson":
      return (
        <QuizBlock
          content={block.content}
          metadata={block.metadata}
          onQuestionCompleted={onQuizBlockCompleted}
          // 🎯 FORWARD THE CLEAN LESSON ID UUID DOWN TO THE LOGIC ENGINE:
          lessonId={lessonId}
        />
      );

    default:
      return null;
  }
};

export default BlockRenderer;
