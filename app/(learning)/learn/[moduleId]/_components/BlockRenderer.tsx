"use client";

import React from "react";

import BannerBlock from "../_blocks/BannerBlock";

import type { ModuleBlock } from "../types";
import TextBlock from "../_blocks/TextBlock";
import ImageBlock from "../_blocks/ImageBlock";

type BlockRendererProps = {
  block: ModuleBlock;
};

const BlockRenderer = ({ block }: BlockRendererProps) => {
  switch (block.type) {
    case "banner":
      return <BannerBlock imageUrl={block.content} />;

    case "text":
      return <TextBlock content={block.content} />;
    case "image":
      return <ImageBlock imageUrl={block.content} />;
    // case "video":
    // case "code":

    default:
      return null;
  }
};

export default BlockRenderer;
