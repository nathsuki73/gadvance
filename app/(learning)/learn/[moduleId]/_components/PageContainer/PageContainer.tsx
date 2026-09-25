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
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageContentSkeleton } from "./PageContentSkeleton";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

import {
  generateRemedialExplanation,
  generateFollowUpStream,
  generateQuickQuiz,
  RemedialContent,
} from "../../aiRemedialService";
import { ExplanationCard, NoteVariant } from "../../ExplanationCard";

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
  onGoToAssessment?: () => void; // 👈 Callback to return to assessment
}

const NOTE_VARIANTS: NoteVariant[] = [
  {
    accent: "border-purple-400",
    tag: "text-purple-700 bg-purple-100/80",
    mark: "text-purple-600",
  },
  {
    accent: "border-teal-400",
    tag: "text-teal-700 bg-teal-100/80",
    mark: "text-teal-600",
  },
  {
    accent: "border-amber-400",
    tag: "text-amber-700 bg-amber-100/80",
    mark: "text-amber-600",
  },
  {
    accent: "border-sky-400",
    tag: "text-sky-700 bg-sky-100/80",
    mark: "text-sky-600",
  },
];

function pickVariant(seed: string): NoteVariant {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return NOTE_VARIANTS[hash % NOTE_VARIANTS.length];
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
  onGoToAssessment,
}: PageContainerProps) {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.laravelJwt;

  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isNavigating, setIsNavigating] = useState(false);

  const [remedialContent, setRemedialContent] =
    useState<RemedialContent | null>(null);
  const [masteryProbability, setMasteryProbability] = useState<number>(0.3);
  const [loadingRemedial, setLoadingRemedial] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [targetBlockText, setTargetBlockText] = useState<string>("");

  useEffect(() => {
    setIsCompleted(initialCompleted);
    setIsNavigating(false);
    setRemedialContent(null);
    setPortalTarget(null);
    setActiveBlockId(null);
    setTargetBlockText("");
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

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !pageData || !token) return;

    const blockId = hash.replace("#", "");
    setActiveBlockId(blockId);

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

        setTargetBlockText(blockText);

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
        "rounded-2xl",
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

  const renderTargetedReviewBlock = () => {
    if (!loadingRemedial && !remedialContent) return null;

    const variant = pickVariant(activeBlockId || pageId || title);

    const content = (
      <div className="w-full relative my-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {loadingRemedial && (
          <div className="flex items-center gap-2.5 text-xs text-zinc-400 py-3 px-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
            <Loader2 className="animate-spin text-[#8b5cf6]" size={14} />
            <span>Generating personalized concept refresher…</span>
          </div>
        )}

        {remedialContent && (
          <ExplanationCard
            paragraphId={activeBlockId || pageId}
            remedialContent={remedialContent}
            masteryProbability={masteryProbability}
            variant={variant}
            onRequestFollowUp={async (pId, prompt, onChunk) => {
              return await generateFollowUpStream(
                title,
                targetBlockText || title,
                prompt,
                onChunk,
              );
            }}
            onRequestQuiz={async () => {
              return await generateQuickQuiz(title, targetBlockText || title);
            }}
            onGoToAssessment={onGoToAssessment}
          />
        )}
      </div>
    );

    if (portalTarget) {
      return createPortal(content, portalTarget);
    }
    return content;
  };

  if (loading || sessionStatus === "loading" || isNavigating) {
    return (
      <div className="flex h-full min-h-screen w-full flex-col justify-between bg-white overflow-y-auto">
        <PageContentSkeleton />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
          <h3 className="text-sm font-bold tracking-tight text-zinc-900">
            Content Unavailable
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Unable to load page content. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const isBlockNoteContent =
    pageData?.content &&
    Array.isArray(pageData.content) &&
    pageData.content.length > 0;

  return (
    <div className="flex h-full min-h-screen flex-col justify-between overflow-x-hidden overflow-y-auto bg-white scroll-smooth font-sans">
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
              className="prose prose-zinc max-w-none text-xs sm:text-sm leading-relaxed"
            />
          ) : (
            <div className="p-6 sm:p-10 border border-dashed border-zinc-200 rounded-2xl text-center">
              <BookOpen className="mx-auto h-7 w-7 text-zinc-300 mb-2" />
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
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
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Continue
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
