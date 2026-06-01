"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";
import { enqueueBlockTelemetry } from "../_hooks/blockTelemetryQueue";

type ReadingBlockMetadata = {
  title?: string;
  image_url?: string;
  image_alt?: string;
  backendBlockId?: string;
};

type ReadingBlockProps = {
  content?: string | null;
  metadata?: string | ReadingBlockMetadata | null;
  backendBlockId?: string;
  lessonId?: string;
  initialCompleted?: boolean;
  onCompleted?: () => void;
};

const ReadingBlock = ({
  content,
  metadata,
  backendBlockId,
  lessonId,
  initialCompleted = false,
  onCompleted,
}: ReadingBlockProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const lastSyncTimestampRef = useRef<number>(Date.now());
  const maxRatioRef = useRef<number>(initialCompleted ? 100 : 0);
  const lastSyncedRatioRef = useRef<number>(initialCompleted ? 100 : 0);
  const accumulatedSecondsRef = useRef<number>(0);

  const completedRef = useRef<boolean>(initialCompleted);
  const onCompletedRef = useRef(onCompleted);

  const [completed, setCompleted] = useState(initialCompleted);
  const { data: session } = useSession();

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  const parsedMetadata = useMemo<ReadingBlockMetadata>(() => {
    if (!metadata) return {};
    if (typeof metadata !== "string") return metadata;
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }, [metadata]);

  const targetBlockId = backendBlockId || parsedMetadata.backendBlockId;

  useEffect(() => {
    if (!targetBlockId || !lessonId) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    let isIdle = false;
    let idleTimer: ReturnType<typeof setTimeout>;

    // Stagger client flushes slightly so many blocks don't POST in the same millisecond.
    const syncDelayMs =
      4000 +
      (Array.from(targetBlockId).reduce(
        (sum, char) => sum + char.charCodeAt(0),
        0,
      ) %
        1200);

    const resetIdleTimer = () => {
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isIdle = true;
      }, 60000);
    };

    window.addEventListener("mousemove", resetIdleTimer);
    resetIdleTimer();

    const syncTelemetryData = () => {
      const now = Date.now();
      const rawSecondsElapsed = Math.round(
        (now - lastSyncTimestampRef.current) / 1000,
      );
      lastSyncTimestampRef.current = now;

      const incrementalTimeSpent = isIdle ? 0 : Math.min(rawSecondsElapsed, 90);
      accumulatedSecondsRef.current += incrementalTimeSpent;

      const hasRatioMilestoneChanged =
        maxRatioRef.current > lastSyncedRatioRef.current;
      const hasSubstantialTimeAccumulated = accumulatedSecondsRef.current >= 20;

      if (!hasRatioMilestoneChanged && !hasSubstantialTimeAccumulated) {
        return;
      }

      const token = session?.laravelJwt;
      if (!token) return;

      const payload = {
        lesson_id: lessonId,
        block_id: targetBlockId,
        progress_ratio: maxRatioRef.current,
        time_spent_seconds: accumulatedSecondsRef.current,
        interaction_type: "reading",
        score: null,
      };

      lastSyncedRatioRef.current = maxRatioRef.current;
      accumulatedSecondsRef.current = 0;

      enqueueBlockTelemetry(payload, token);
    };

    const handleScrollTracking = () => {
      resetIdleTimer();
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      let cleanRatio = 0;
      if (rect.top < windowHeight && rect.bottom > 0) {
        cleanRatio = 50;
      }

      if (rect.top <= 50 && rect.bottom <= windowHeight + 10) {
        cleanRatio = 100;
      }

      if (cleanRatio > maxRatioRef.current) {
        maxRatioRef.current = cleanRatio;
      }

      if (!completedRef.current && maxRatioRef.current === 100) {
        completedRef.current = true;
        setCompleted(true);
        onCompletedRef.current?.();
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => syncTelemetryData(), syncDelayMs);
    };

    window.addEventListener("scroll", handleScrollTracking);
    handleScrollTracking();

    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("scroll", handleScrollTracking);
      syncTelemetryData();
    };
  }, [targetBlockId, lessonId, session?.laravelJwt]);

  if (!content) return null;
  const showHeader = parsedMetadata.title && parsedMetadata.title !== "[BLANK]";

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-3xl py-6 animate-fade-in"
    >
      <div
        className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-all duration-300 bg-white
        ${completed ? "border-purple-100 shadow-purple-50/10" : "border-zinc-100 hover:border-zinc-200"}`}
      >
        {showHeader && (
          <div className="mb-6 flex items-center gap-3 border-b border-zinc-50 pb-4">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300
              ${completed ? "bg-purple-100 text-purple-600" : "bg-purple-50 text-primary"}`}
            >
              <BookOpen size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 tracking-tight max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parsedMetadata.title}
              </ReactMarkdown>
            </h3>
            {completed && (
              <span className="ml-auto text-[10px] bg-purple-50 text-purple-600 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full animate-fade-in">
                Read
              </span>
            )}
          </div>
        )}

        <div className="prose prose-zinc max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

// 🎯 REACT MEMO WRAPPER FIX: Prevents container re-mounting loops when parents shift state parameters!
export default React.memo(ReadingBlock, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.backendBlockId === nextProps.backendBlockId &&
    prevProps.lessonId === nextProps.lessonId &&
    prevProps.initialCompleted === nextProps.initialCompleted
  );
});
