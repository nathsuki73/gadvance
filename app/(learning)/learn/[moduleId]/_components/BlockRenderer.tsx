"use client";

import React from "react";

import BannerBlock from "../_blocks/BannerBlocks";

import type { ModuleBlock } from "../types";

type BlockRendererProps = {
  block: ModuleBlock;
};

const BlockRenderer = ({ block }: BlockRendererProps) => {
  switch (block.type) {
    case "banner":
      return <BannerBlock imageUrl={block.content} />;

    // case "text":
    // case "image":
    // case "video":
    // case "code":

    default:
      return null;
  }
};

export default BlockRenderer;
