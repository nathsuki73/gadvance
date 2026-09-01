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
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#8b5cf6]">
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
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  const error = queryError
    ? "Unable to load page content. Please try again."
    : null;

  // Track scroll position without firing onComplete
  const handleScrollCheck = useCallback(() => {
    if (isCompleted) {
      setScrollProgress(100);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const elScrollTop = el.scrollTop;
    const elScrollHeight = el.scrollHeight;
    const elClientHeight = el.clientHeight;
    const elTotalScrollable = elScrollHeight - elClientHeight;

    const docScrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    const docScrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const docClientHeight = window.innerHeight;
    const docTotalScrollable = docScrollHeight - docClientHeight;

    const isWindowScroll = docTotalScrollable > 20 && docScrollTop > 0;
    const scrollTop = isWindowScroll ? docScrollTop : elScrollTop;
    const totalScrollable = isWindowScroll
      ? docTotalScrollable
      : elTotalScrollable;

    // If page has no scroll, allow button click immediately
    if (totalScrollable <= 10) {
      setScrollProgress(100);
      return;
    }

    const currentPercent = Math.min(
      100,
      Math.max(0, Math.round((scrollTop / totalScrollable) * 100)),
    );

    setScrollProgress(currentPercent);
  }, [isCompleted]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScrollCheck, { passive: true });
    window.addEventListener("scroll", handleScrollCheck, { passive: true });

    return () => {
      el.removeEventListener("scroll", handleScrollCheck);
      window.removeEventListener("scroll", handleScrollCheck);
    };
  }, [handleScrollCheck]);

  const scrollToHash = useCallback(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const blockId = hash.replace("#", "");
    // BlockNote renders blocks with data-id attributes matching block IDs
    const element =
      document.getElementById(blockId) ||
      document.querySelector(`[data-id="${blockId}"]`);

    if (element && containerRef.current) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // Minimal adaptive highlight with generous padding, rounded corners, and a pulsing border
      element.classList.add(
        "p-4", // Adds padding so letters aren't squished against the border
        "my-2", // Adds breathing room above and below the block
        "rounded-xl", // Modern smooth rounded corners
        "border-2", // Clean, minimal structural border
        "border-purple-400/60", // Soft purple accent color
        "bg-purple-50/40", // Extremely light translucent background
        "animate-pulse", // Gentle pulsing effect
        "transition-all",
        "duration-500",
      );

      setTimeout(() => {
        element.classList.remove(
          "p-4",
          "my-2",
          "border-2",
          "border-purple-400/60",
          "bg-purple-50/40",
          "animate-pulse",
        );
      }, 2500); // Cleans up after 2.5 seconds
    }
  }, []);

  // Trigger on initial page load / hash change
  useEffect(() => {
    scrollToHash();
  }, [scrollToHash, pageData]);

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6]" />
          <p className="text-xs font-medium text-zinc-400">
            Loading page content...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-6">
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

  const canNavigateNext = isCompleted || displayProgress >= 85;

  // Complete and advance ONLY on explicit user click
  const handleButtonClick = () => {
    if (!canNavigateNext) return;

    if (!isCompleted) {
      setIsCompleted(true);
      onComplete();
    }
    onNext();
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScrollCheck}
      className="flex h-full min-h-screen flex-col justify-between overflow-x-hidden overflow-y-auto bg-white scroll-smooth"
    >
      <div className="mx-auto w-full max-w-4xl px-0 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <main className="min-h-[250px] w-full overflow-x-auto">
          {isBlockNoteContent ? (
            <BlockNoteReader
              initialContent={pageData.content}
              onRendered={scrollToHash}
            />
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
            onClick={handleButtonClick}
            disabled={!canNavigateNext}
            aria-label="Next Item"
            className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all ${
              canNavigateNext
                ? "cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                : "cursor-default opacity-70"
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
                className="text-[#8b5cf6] transition-all duration-300 ease-out"
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

            {/* Always downward facing arrow */}
            <ArrowDown
              size={18}
              className={`transition-colors duration-200 ${
                canNavigateNext
                  ? "text-[#8b5cf6] font-bold"
                  : "text-[#8b5cf6]/50"
              }`}
            />
          </button>
        </div>
      </footer>
    </div>
  );
}
