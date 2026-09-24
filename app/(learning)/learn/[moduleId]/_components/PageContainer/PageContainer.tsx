"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  BookOpen,
  ArrowDown,
  CheckCircle2,
  BookMarked,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageContentSkeleton } from "./PageContentSkeleton";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import {
  generateRemedialExplanation,
  RemedialContent,
} from "../../aiRemedialService";

const BlockNoteReader = dynamic(() => import("./BlockNoteReader"), {
  ssr: false,
  loading: () => <PageContentSkeleton />,
});

interface PageContainerProps {
  itemId: string;
  pageId: string;
  title: string;
  initialCompleted?: boolean;
  isLastItem?: boolean;
  onComplete: () => void;
  onNext: () => void;
  onExit: () => void;
}

export default function PageContainer({
  itemId,
  pageId,
  title,
  initialCompleted = false,
  isLastItem = false,
  onComplete,
  onNext,
  onExit,
}: PageContainerProps) {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.laravelJwt;

  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isNavigating, setIsNavigating] = useState(false);

  // Remedial & Mastery States
  const [remedialContent, setRemedialContent] =
    useState<RemedialContent | null>(null);
  const [masteryProbability, setMasteryProbability] = useState<number>(0.3);
  const [loadingRemedial, setLoadingRemedial] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIsCompleted(initialCompleted);
    setIsNavigating(false);
    setRemedialContent(null);
    setPortalTarget(null);
  }, [pageId, initialCompleted]);

  const {
    data: pageData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["pageContent", pageId],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${baseUrl}/api/pages/${pageId}`, { headers });
      if (!res.ok)
        throw new Error(`Failed to load page content (${res.status})`);

      const json = await res.json();
      const rawData = json.data ?? json;

      let parsedContent = rawData.content;
      if (typeof parsedContent === "string") {
        try {
          parsedContent = JSON.parse(parsedContent);
        } catch {}
      }

      return { ...rawData, content: parsedContent };
    },
    enabled: Boolean(pageId) && sessionStatus !== "loading",
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  // Fetch Mastery & Trigger Remedial Generation when hash is present
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !pageData || !token) return;

    const blockId = hash.replace("#", "");

    async function fetchRemedialData() {
      try {
        setLoadingRemedial(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const headers: Record<string, string> = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const masteryRes = await fetch(
          `${baseUrl}/api/user-page-mastery?page_id=${pageId}`,
          { headers },
        );
        const masteryJson = await masteryRes.json();
        const currentMastery = masteryJson.probability_known ?? 0.3;
        setMasteryProbability(currentMastery);

        let blockText = title;
        if (Array.isArray(pageData.content)) {
          const matchedBlock = pageData.content.find(
            (b: any) => b.id === blockId,
          );
          if (matchedBlock) {
            if (Array.isArray(matchedBlock.content)) {
              blockText = matchedBlock.content
                .map((c: any) => c.text || "")
                .join(" ");
            } else if (typeof matchedBlock.content === "string") {
              blockText = matchedBlock.content;
            } else if (matchedBlock.props?.text) {
              blockText = matchedBlock.props.text;
            }
          }
        }

        const aiResult = await generateRemedialExplanation(
          title,
          blockText,
          currentMastery,
        );
        setRemedialContent(aiResult);
      } catch (err) {
        console.error("Failed to load remedial content:", err);
      } finally {
        setLoadingRemedial(false);
      }
    }

    fetchRemedialData();
  }, [pageData, pageId, title, token]);

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

      let targetDiv = document.getElementById(`remedial-portal-${blockId}`);
      if (!targetDiv) {
        targetDiv = document.createElement("div");
        targetDiv.id = `remedial-portal-${blockId}`;
        targetDiv.className = "w-full my-6 clear-both";
        element.insertAdjacentElement("afterend", targetDiv);
      }
      setPortalTarget(targetDiv);
    }
  }, []);

  if (loading || sessionStatus === "loading" || isNavigating) {
    return (
      <div className="flex h-full min-h-screen w-full flex-col justify-between bg-white overflow-y-auto">
        <PageContentSkeleton />
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
    setIsNavigating(true);
    if (!isCompleted) {
      setIsCompleted(true);
      onComplete();
    } else {
      onNext();
    }
  };

  // Render Targeted Review Block with Explanation & Progress Bar
  const renderTargetedReviewBlock = () => {
    if (!loadingRemedial && !remedialContent) return null;

    const masteryPercent = Math.round(masteryProbability * 100);

    const content = (
      <div className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {loadingRemedial && (
          <div className="mb-6 p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center gap-3">
            <Loader2 className="animate-spin text-zinc-500" size={18} />
            <span className="text-xs font-medium text-zinc-600">
              Preparing concept breakdown...
            </span>
          </div>
        )}

        {remedialContent && (
          <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-7 space-y-5 shadow-sm">
            {/* Header with Mastery Progress */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2 text-zinc-800 font-semibold text-xs uppercase tracking-wider">
                <BookMarked size={15} className="text-[#8b5cf6]" />
                <span>Targeted Concept Review</span>
              </div>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                Mastery: {masteryPercent}%
              </span>
            </div>

            {/* Mastery Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-zinc-400">
                <span>Concept Competency</span>
                <span>{masteryPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8b5cf6] transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>
            </div>

            {/* Explanation Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-zinc-900">
                {remedialContent.summary}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                {remedialContent.explanation}
              </p>
            </div>

            {/* Quick Analogy */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                Quick Analogy
              </span>
              <p className="text-xs text-zinc-700 leading-relaxed">
                {remedialContent.analogy}
              </p>
            </div>
          </div>
        )}
      </div>
    );

    if (portalTarget) {
      return createPortal(content, portalTarget);
    }
    return content;
  };

  return (
    <div className="flex h-full min-h-screen flex-col justify-between overflow-x-hidden overflow-y-auto bg-white scroll-smooth">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        {!portalTarget && renderTargetedReviewBlock()}

        <main className="min-h-[250px] w-full overflow-x-auto relative">
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

          {portalTarget && renderTargetedReviewBlock()}
        </main>

        <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col items-center justify-center gap-3">
          {isLastItem ? (
            <button
              type="button"
              onClick={onExit}
              disabled={isNavigating}
              className="inline-flex min-h-[48px] w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[#8b5cf6] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all duration-300 cursor-pointer hover:bg-[#7c3aed] active:scale-[0.98] disabled:opacity-50"
            >
              <span>Complete Module</span>
              <CheckCircle2 size={16} />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleNextClick}
                disabled={isNavigating}
                aria-label="Next Page"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 hover:bg-[#8b5cf6] text-[#8b5cf6] hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <ArrowDown size={20} />
              </button>
              <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
                Continue
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
