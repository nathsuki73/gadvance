"use client";

import React from "react";

import BannerBlock from "../_blocks/BannerBlock";

import type { ModuleBlock } from "../types";
import TextBlock from "../_blocks/TextBlock";
import ImageBlock from "../_blocks/ImageBlock";
import TitleDisplay from "../_blocks/TitleDisplayBlock";
import ImageTextBlock from "../_blocks/ImageTextBlock";
import QuizBlock from "../_blocks/QuizBlock";
import VideoDisplayBlock from "../_blocks/VideoDisplayBlock";
import SurveyBlock from "../_blocks/SurveyBlock";

type BlockRendererProps = {
  block: ModuleBlock;
};

const BlockRenderer = ({ block }: BlockRendererProps) => {
  switch (block.type) {
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
