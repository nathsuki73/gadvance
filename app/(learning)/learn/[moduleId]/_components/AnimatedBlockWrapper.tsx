import React from "react";

export type AnimatedBlockWrapperProps = {
  block: { id: string };
  index: number;
  extraKeyPrefix: string;
  adaptiveRecipeRevision: number;
  isAdaptiveMode: boolean;
  children: React.ReactNode;
};

export const AnimatedBlockWrapper = ({
  block,
  index,
  extraKeyPrefix,
  adaptiveRecipeRevision,
  isAdaptiveMode,
  children,
}: AnimatedBlockWrapperProps) => {
  const delayMs = index * 180;
  const className = isAdaptiveMode
    ? "adaptive-block-animate will-change-transform"
    : "animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-700 will-change-transform";

  return (
    <div
      key={`${extraKeyPrefix}-${block.id}-${adaptiveRecipeRevision}`}
      className={className}
      style={{
        animationDelay: `${delayMs}ms`,
        transformOrigin: isAdaptiveMode ? "center" : undefined,
      }}
    >
      {children}
    </div>
  );
};
