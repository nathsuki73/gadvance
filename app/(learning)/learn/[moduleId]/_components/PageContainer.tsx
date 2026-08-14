"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Loader2, AlertCircle, BookOpen, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

const BlockNoteReader = dynamic(() => import("./BlockNoteReader"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-purple-600">
      <Loader2 size={28} className="animate-spin" />
      <p className="text-xs font-semibold text-zinc-500">
        Loading Page Content...
      </p>
    </div>
  ),
});

interface PageContainerProps {
  itemId: string;
  pageId: string;
  title: string;
  initialCompleted?: boolean;
  onComplete: () => void;
  onNext: () => void;
}

export default function PageContainer({
  itemId,
  pageId,
  title,
  initialCompleted = false,
  onComplete,
  onNext,
}: PageContainerProps) {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.laravelJwt;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [scrollProgress, setScrollProgress] = useState(
    initialCompleted ? 100 : 0,
  );

  useEffect(() => {
    setIsCompleted(initialCompleted);
    setScrollProgress(initialCompleted ? 100 : 0);
  }, [pageId, initialCompleted]);

  // 🔑 Cached via React Query: Fetches page content once, then caches it in memory permanently during the session
  const {
    data: pageData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["pageContent", pageId],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${baseUrl}/api/pages/${pageId}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error(`Failed to load page content (${res.status})`);
      }

      const json = await res.json();
      const rawData = json.data ?? json;

      let parsedContent = rawData.content;
      if (typeof parsedContent === "string") {
        try {
          parsedContent = JSON.parse(parsedContent);
        } catch {
          // Raw HTML fallback
        }
      }

      return {
        ...rawData,
        content: parsedContent,
      };
    },
    enabled: Boolean(pageId) && sessionStatus !== "loading",
    staleTime: Infinity, // Never refetch once loaded
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 mins
  });

  const error = queryError
    ? "Unable to load page content. Please try again."
    : null;

  // Auto-Scroll & Highlight effect for Remedial Anchor Hashes (#block_id)
  useEffect(() => {
    if (loading || !pageData) return;

    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const blockId = hash.replace("#", "");
      const targetElement =
        document.getElementById(blockId) ||
        document.querySelector(`[data-id="${blockId}"]`);

      if (targetElement && containerRef.current) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        targetElement.classList.add(
          "bg-purple-100/80",
          "transition-colors",
          "duration-500",
          "rounded-xl",
          "p-2",
        );
        setTimeout(() => {
          targetElement.classList.remove("bg-purple-100/80");
        }, 3000);
      }
    };

    const timer = setTimeout(handleHashScroll, 500);
    return () => clearTimeout(timer);
  }, [loading, pageData]);

  const handleScrollCheck = useCallback(() => {
    if (isCompleted) {
      setScrollProgress(100);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const totalScrollable = scrollHeight - clientHeight;

    if (totalScrollable <= 0) {
      setScrollProgress(100);
      setIsCompleted(true);
      onComplete();
      return;
    }

    const currentProgress = Math.min(
      100,
      Math.max(0, (scrollTop / totalScrollable) * 100),
    );
    setScrollProgress(currentProgress);

    const distanceFromBottom = totalScrollable - scrollTop;
    if (distanceFromBottom <= 100) {
      setIsCompleted(true);
      onComplete();
    }
  }, [isCompleted, onComplete]);

  useEffect(() => {
    if (loading || !pageData) return;

    const timer = setTimeout(() => {
      handleScrollCheck();
    }, 300);

    return () => clearTimeout(timer);
  }, [loading, pageData, handleScrollCheck]);

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-xs font-medium text-zinc-400">
            Loading page content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
          <h3 className="text-base font-semibold text-zinc-800">
            Content Unavailable
          </h3>
          <p className="mt-1 text-xs text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  const isBlockNoteContent =
    pageData?.content &&
    Array.isArray(pageData.content) &&
    pageData.content.length > 0;

  const displayProgress = isCompleted ? 100 : scrollProgress;

  const size = 48;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (displayProgress / 100) * circumference;

  const canNavigateNext = isCompleted || displayProgress >= 90;

  return (
    <div
      ref={containerRef}
      onScroll={handleScrollCheck}
      className="flex h-[100dvh] flex-col justify-between overflow-x-hidden overflow-y-auto bg-white scroll-smooth"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <main className="min-h-[250px] w-full overflow-x-auto">
          {isBlockNoteContent ? (
            <BlockNoteReader initialContent={pageData.content} />
          ) : typeof pageData?.content === "string" &&
            pageData.content.length > 0 ? (
            <div
              dangerouslySetInnerHTML={{ __html: pageData.content }}
              className="prose prose-zinc max-w-none text-xs sm:text-base space-y-4 leading-relaxed"
            />
          ) : (
            <div className="p-6 sm:p-10 border border-dashed border-zinc-200 rounded-2xl text-center">
              <BookOpen className="mx-auto h-7 w-7 text-zinc-300 mb-2" />
              <p className="text-xs sm:text-sm text-zinc-400 font-light">
                No content is published for this page yet.
              </p>
            </div>
          )}
        </main>
      </div>

      <footer className="sticky bottom-0 z-20 border-t border-zinc-100 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-8 sm:py-4 transition-all">
        <div className="mx-auto flex max-w-4xl items-center justify-end">
          <button
            type="button"
            onClick={() => {
              if (canNavigateNext) {
                onNext();
              }
            }}
            disabled={!canNavigateNext}
            aria-label={canNavigateNext ? "Next Item" : "Reading Progress"}
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all ${
              canNavigateNext
                ? "cursor-pointer hover:scale-105 active:scale-95"
                : "cursor-default"
            }`}
          >
            <svg
              className="absolute inset-0 -rotate-90 transform"
              width={size}
              height={size}
            >
              <circle
                className="text-purple-100"
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              <circle
                className="text-purple-600 transition-all duration-300 ease-out"
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
            </svg>

            <ArrowDown
              size={18}
              className={`transition-colors duration-200 ${
                canNavigateNext
                  ? "text-purple-600 font-bold"
                  : "text-purple-400"
              }`}
            />
          </button>
        </div>
      </footer>
    </div>
  );
}
