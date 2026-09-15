"use client";

import React, { useEffect, useState, useCallback } from "react";
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

  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsCompleted(initialCompleted);
    setIsNavigating(false); // Reset when page changes
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

  const scrollToHash = useCallback(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const blockId = hash.replace("#", "");
    const element =
      document.getElementById(blockId) ||
      document.querySelector(`[data-id="${blockId}"]`);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      element.classList.add(
        "p-4",
        "my-2",
        "rounded-xl",
        "border-2",
        "border-purple-400/60",
        "bg-purple-50/40",
        "animate-pulse",
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
      }, 2500);
    }
  }, []);

  useEffect(() => {
    scrollToHash();
  }, [scrollToHash, pageData]);

  // Show loading screen if data is loading OR if the user just clicked "Next"
  if (loading || sessionStatus === "loading" || isNavigating) {
    return (
      <div className="flex h-full min-h-screen w-full items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#8b5cf6]" />
          <p className="text-xs font-medium text-zinc-400">
            Loading next page...
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

  const handleNextClick = () => {
    if (isNavigating) return;
    setIsNavigating(true); // Triggers the clean full-screen loader immediately

    if (!isCompleted) {
      setIsCompleted(true);
      onComplete();
    }
    onNext();
  };

  return (
    <div className="flex h-full min-h-screen flex-col justify-between overflow-x-hidden overflow-y-auto bg-white scroll-smooth">
      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
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

        {/* Minimalist Centered Arrow Down Button */}
        <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleNextClick}
            disabled={isNavigating}
            aria-label="Next Page"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 hover:bg-[#8b5cf6] text-[#8b5cf6] hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <ArrowDown size={20} />
          </button>
          <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            Continue
          </span>
        </div>
      </div>
    </div>
  );
}
