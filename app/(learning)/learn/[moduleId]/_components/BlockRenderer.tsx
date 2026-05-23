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

type BlockRendererProps = {
  // 2. Allow both shapes, or cast down to any compatible variant model mapping safely
  block: ModuleBlock | Block | any;
};

const BlockRenderer = ({ block }: BlockRendererProps) => {
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
        <VideoDisplayBlock content={block.content} metadata={block.metadata} />
      );
    case "quiz":
      return <QuizBlock content={block.content} metadata={block.metadata} />;
    case "survey":
      return <SurveyBlock content={block.content} />;

    default:
      return null;
  }
};

export default BlockRenderer;
