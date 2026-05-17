// hooks/useBlockCompletion.ts

"use client";

import { useEffect, useRef } from "react";

import { completeBlockAction } from "@/app/(learning)/learn/[moduleId]/actions";

type UseBlockCompletionProps = {
  blockId: string;

  threshold?: number;
};

export function useBlockCompletion({
  blockId,
  threshold = 0.6,
}: UseBlockCompletionProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const completedRef = useRef(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= threshold &&
          !completedRef.current
        ) {
          completedRef.current = true;

          try {
            await completeBlockAction(blockId);
          } catch (error) {
            console.error("Failed to complete block", error);
          }

          observer.disconnect();
        }
      },
      {
        threshold: [threshold],
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [blockId, threshold]);

  return ref;
}
