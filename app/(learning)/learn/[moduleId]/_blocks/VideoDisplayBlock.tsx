"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";
import { enqueueBlockTelemetry } from "../_hooks/blockTelemetryQueue";

type VideoMetadata = {
  title?: string;
  description?: string;
  backendBlockId?: string;
};

type VideoDisplayBlockProps = {
  content?: string | null;
  metadata?: string | VideoMetadata | null;
  backendBlockId?: string;
  lessonId?: string;
  initialCompleted?: boolean;
  onCompleted?: () => void;
};

const VideoDisplayBlock = ({
  content,
  metadata,
  backendBlockId,
  lessonId,
  initialCompleted = false,
  onCompleted,
}: VideoDisplayBlockProps) => {
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

  const parsedMetadata = useMemo<VideoMetadata>(() => {
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
        interaction_type: "video",
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

  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com/watch?v=")) {
        return url.replace("watch?v=", "embed/");
      }
      if (url.includes("youtu.be/")) {
        return url.replace("youtu.be/", "youtube.com/embed/");
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-3xl py-6 animate-fade-in"
    >
      <div
        className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-all duration-300 bg-white
        ${completed ? "border-purple-100 shadow-purple-50/10" : "border-zinc-100 hover:border-zinc-200"}`}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-100">
          <iframe
            src={getEmbedUrl(content)}
            title="Video Lesson"
            className="absolute top-0 left-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {(parsedMetadata.title || parsedMetadata.description) && (
          <div className="mt-6 prose prose-zinc max-w-none">
            {parsedMetadata.title && (
              <div className="mb-3 flex items-center justify-between border-b border-zinc-50 pb-2">
                <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <span className="inline">{children}</span>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-zinc-950">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-purple-600 font-medium">
                          {children}
                        </em>
                      ),
                    }}
                  >
                    {parsedMetadata.title}
                  </ReactMarkdown>
                </h3>
                {completed && (
                  <span className="text-[10px] bg-purple-50 text-purple-600 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full animate-fade-in">
                    Watched
                  </span>
                )}
              </div>
            )}

            {parsedMetadata.description && (
              <div className="text-sm font-light leading-relaxed text-zinc-500">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="text-sm font-light leading-relaxed text-zinc-500 mb-3 last:mb-0">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-zinc-800">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-zinc-700">{children}</em>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-zinc-200 bg-zinc-50/50 px-4 py-2 my-3 rounded-r-lg font-light italic text-zinc-600">
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-3 text-zinc-500 font-light pl-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 my-3 text-zinc-500 font-light pl-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm leading-relaxed">{children}</li>
                    ),
                  }}
                >
                  {parsedMetadata.description}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 🎯 REACT MEMO WRAPPER FIX: Prevents container re-mounting loops when parents shift state parameters!
export default React.memo(VideoDisplayBlock, (prevProps, nextProps) => {
  return (
    prevProps.content === nextProps.content &&
    prevProps.backendBlockId === nextProps.backendBlockId &&
    prevProps.lessonId === nextProps.lessonId &&
    prevProps.initialCompleted === nextProps.initialCompleted
  );
});
