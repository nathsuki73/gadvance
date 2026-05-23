"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// 🎯 IMPORT NATIVE CLIENT SESSION HOOKS
import { useSession } from "next-auth/react";

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
  const maxRatioRef = useRef<number>(0);
  const lastSyncedRatioRef = useRef<number>(0);

  const [completed, setCompleted] = useState(initialCompleted);

  // 🎯 CONNECT CLIENT HOOK WRAPPER TO NEXT-AUTH STACK
  const { data: session } = useSession();

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

  /*
  |--------------------------------------------------------------------------
  | SCROLL TELEMETRY ENGINE WITH COMPONENT DEBOUNCE FILTERING
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    console.log("🔍 ReadingBlock: Initializing scroll-telemetry...", {
      targetBlockId,
      lessonId,
    });

    if (!targetBlockId || !lessonId) {
      console.warn(
        "⚠️ ReadingBlock: Initialization aborted. Missing targetBlockId or lessonId.",
      );
      return;
    }

    let debounceTimer: NodeJS.Timeout;
    let isIdle = false;
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        isIdle = true;
        console.log(
          `💤 ReadingBlock [${targetBlockId}]: User went idle. Accumulator clock frozen.`,
        );
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

      console.log(`📊 ReadingBlock Debounce Sync [${targetBlockId}]:`, {
        ratioToPersist: maxRatioRef.current,
        timeSpentInThisSegment: incrementalTimeSpent,
        isCompletedLocally: completed,
        isUnmounting,
      });

      lastSyncedRatioRef.current = maxRatioRef.current;

      const payload = {
        lesson_id: lessonId,
        block_id: targetBlockId,
        progress_ratio: maxRatioRef.current,
        time_spent_seconds: incrementalTimeSpent,
        interaction_type: "reading",
        score: null,
      };

      console.log(
        `🚀 ReadingBlock [${targetBlockId}]: Dispatching data upstream...`,
        payload,
      );

      // 🎯 EXTRACT TOKEN NATIVELY FROM THE DECLARED NEXT-AUTH CONTEXT STATE
      const token = session?.laravelJwt;

      if (!token) {
        console.warn(
          `⚠️ ReadingBlock [${targetBlockId}]: Synchronizer paused. NextAuth session token is un-hydrated.`,
        );
        return;
      }

      const BASE_LARAVEL_URL =
        "http://127.0.0.1:8000/api/telemetry/block-progress";

      if (isUnmounting && navigator.sendBeacon) {
        // Page exit query-param signature mapping
        const beaconUrl = `${BASE_LARAVEL_URL}?token=${token}`;
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon(beaconUrl, blob);
      } else {
        // Direct authenticated client-fetch tracking dispatch loop
        fetch(BASE_LARAVEL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            console.log(
              `📡 Response status from Laravel server point: [${res.status}]`,
            );
            const rawResponseText = await res.text().catch(() => "");

            if (!res.ok) {
              let parsedErrorPayload;
              try {
                parsedErrorPayload = JSON.parse(rawResponseText);
              } catch {
                parsedErrorPayload = {
                  rawBodyText: rawResponseText || "Empty error text context.",
                };
              }

              console.error("❌ Rejected by Laravel Controller rules:", {
                httpStatus: res.status,
                errorDetails: parsedErrorPayload,
              });
              return;
            }
            console.log(
              `✅ Telemetry processed safely by Laravel database row engines.`,
            );
          })
          .catch((err) =>
            console.error(
              "❌ Target connection failure to absolute Laravel server:",
              err,
            ),
          );
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
        console.log(
          `🎉 ReadingBlock [${targetBlockId}]: 100% maximum visibility unlocked!`,
        );
        setCompleted(true);
        onCompleted?.();
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => syncTelemetryData(false), 2000);
    };

    window.addEventListener("scroll", handleScrollTracking);

    return () => {
      console.log(
        `Leave/Unmount action intercepted for reading block blockId: [${targetBlockId}]`,
      );
      clearTimeout(debounceTimer);
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("scroll", handleScrollTracking);

      syncTelemetryData(true);
    };
    // 🎯 INJECT session PROPERTY INSIDE EFFECT DEPENDENCY BOUNDARIES
  }, [targetBlockId, lessonId, completed, onCompleted, session]);

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
              ${completed ? "bg-purple-100 text-purple-600" : "bg-purple-50 text-[#8b5cf6]"}`}
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

export default ReadingBlock;
