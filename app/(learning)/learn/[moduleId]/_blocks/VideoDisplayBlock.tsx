"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession } from "next-auth/react";

type VideoMetadata = {
  title?: string;
  description?: string;
  backendBlockId?: string;
};

type VideoDisplayBlockProps = {
  content?: string | null; // Holds the YouTube link
  metadata?: string | VideoMetadata | null; // Holds the stringified JSON metadata
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
  const maxRatioRef = useRef<number>(0);
  const lastSyncedRatioRef = useRef<number>(0);

  const [completed, setCompleted] = useState(initialCompleted);
  const { data: session } = useSession();

  // Safely parse the database JSON metadata string
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

  /*
  |--------------------------------------------------------------------------
  | SCROLL TELEMETRY ENGINE WITH COMPONENT DEBOUNCE FILTERING
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!targetBlockId || !lessonId) return;

    let debounceTimer: NodeJS.Timeout;
    let isIdle = false;
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isIdle = true;
      }, 60000);
    };

    window.addEventListener("mousemove", resetIdleTimer);
    resetIdleTimer();

    const syncTelemetryData = (isUnmounting = false) => {
      const now = Date.now();
      const rawSecondsElapsed = Math.round(
        (now - lastSyncTimestampRef.current) / 1000,
      );
      const incrementalTimeSpent = isIdle ? 0 : Math.min(rawSecondsElapsed, 90);

      lastSyncTimestampRef.current = now;

      if (
        !isUnmounting &&
        maxRatioRef.current <= lastSyncedRatioRef.current &&
        incrementalTimeSpent < 5
      ) {
        return;
      }

      lastSyncedRatioRef.current = maxRatioRef.current;

      const payload = {
        lesson_id: lessonId,
        block_id: targetBlockId,
        progress_ratio: maxRatioRef.current,
        time_spent_seconds: incrementalTimeSpent,
        interaction_type: "video", // Overridden from reading to track video stats explicitly
        score: null,
      };

      const token = session?.laravelJwt;
      if (!token) return;

      const BASE_LARAVEL_URL =
        "http://127.0.0.1:8000/api/telemetry/block-progress";

      if (isUnmounting && navigator.sendBeacon) {
        const beaconUrl = `${BASE_LARAVEL_URL}?token=${token}`;
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon(beaconUrl, blob);
      } else {
        fetch(BASE_LARAVEL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    };

    const handleScrollTracking = () => {
      resetIdleTimer();

      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const elementHeight = rect.height;
      const scrolledPastElementTop = windowHeight - rect.top;

      let currentRatio = 0;
      if (scrolledPastElementTop > 0 && rect.top < windowHeight) {
        currentRatio =
          (scrolledPastElementTop / (elementHeight + windowHeight)) * 100;
      }

      const hasScrolledPastTop = rect.top <= 10;
      const hasFullyRevealedBottom = rect.bottom <= windowHeight + 5;

      const isAtAbsoluteBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 5;

      if (
        (hasScrolledPastTop && hasFullyRevealedBottom) ||
        isAtAbsoluteBottom
      ) {
        currentRatio = 100;
      }

      const cleanRatio = Math.min(Math.max(Math.round(currentRatio), 0), 100);

      if (cleanRatio > maxRatioRef.current) {
        maxRatioRef.current = cleanRatio;
      }

      if (!completed && maxRatioRef.current === 100) {
        setCompleted(true);
        onCompleted?.();
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => syncTelemetryData(false), 2000);
    };

    window.addEventListener("scroll", handleScrollTracking);

    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("scroll", handleScrollTracking);

      syncTelemetryData(true);
    };
  }, [targetBlockId, lessonId, completed, onCompleted, session]);

  if (!content) return null;

  // Clean or extract raw YouTube URLs if needed for an iframe embed
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
        {/* VIDEO PLAYER CANVAS CONTAINER */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-100">
          <iframe
            src={getEmbedUrl(content)}
            title="Video Lesson"
            className="absolute top-0 left-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* METADATA OVERVIEW CONTENT DRAWER */}
        {(parsedMetadata.title || parsedMetadata.description) && (
          <div className="mt-6 prose prose-zinc max-w-none">
            {/* 1. RENDER TITLE WITH MARKDOWN PARSING */}
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

            {/* 2. RENDER DESCRIPTION BODY TEXT WITH FULL MARKDOWN SUPPORT */}
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

export default VideoDisplayBlock;
