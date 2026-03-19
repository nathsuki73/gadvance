import React from "react";
import BlockRenderer from "./BlockRenderer";
import type { ModuleBlock } from "./types";

type ModuleContentViewerProps = {
  blocks: ModuleBlock[];
  className?: string;
};

const ModuleContentViewer = ({
  blocks,
  className,
}: ModuleContentViewerProps) => {
  return (
    <div className={className ?? "space-y-4"}>
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.type}-${index}`;
        return <BlockRenderer key={key} block={block} />;
      })}
    </div>
  );
};

export default ModuleContentViewer;
