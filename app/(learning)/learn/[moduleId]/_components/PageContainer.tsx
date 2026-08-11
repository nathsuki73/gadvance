"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  Loader2,
  CheckCircle2,
  ChevronRight,
  FileText,
  AlertCircle,
  BookOpen,
} from "lucide-react";

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

interface PageData {
  id: string;
  title: string;
  content?: any;
  blocks?: Array<{
    id: string;
    type: string;
    content?: string | null;
  }>;
}

interface PageContainerProps {
  itemId: string;
  pageId: string;
  title: string;
  onComplete: () => void;
  onNext: () => void;
}

export default function PageContainer({
  itemId,
  pageId,
  title,
  onComplete,
  onNext,
}: PageContainerProps) {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.laravelJwt;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (sessionStatus === "loading") return;

    const fetchPageContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const headers: Record<string, string> = {
          Accept: "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await fetch(`${baseUrl}/api/pages/${pageId}`, {
          headers,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to load page content (${res.status})`);
        }

        const json = await res.json();
        const rawData = json.data ?? json;

        // Ensure content array is cleanly parsed if returned as stringified JSON
        let parsedContent = rawData.content;
        if (typeof parsedContent === "string") {
          try {
            parsedContent = JSON.parse(parsedContent);
          } catch {
            // Keep original string if not JSON
          }
        }

        if (!isCancelled) {
          setPageData({
            ...rawData,
            content: parsedContent,
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Page content fetch error:", err);
          setError("Unable to load page content. Please try again.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (pageId) {
      fetchPageContent();
    }

    return () => {
      isCancelled = true;
    };
  }, [pageId, token, sessionStatus]);

  const handleMarkComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  const handleNextClick = () => {
    if (!isCompleted) {
      handleMarkComplete();
    }
    onNext();
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-8">
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
      <div className="flex h-full w-full items-center justify-center bg-white p-8">
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

  // Determine if content is BlockNote JSON
  const isBlockNoteContent =
    pageData?.content &&
    Array.isArray(pageData.content) &&
    pageData.content.length > 0;

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto bg-white">
      {/* Content Container */}
      <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-12 lg:py-14">
        {/* Header Badge */}
        <header className="mb-8 pb-6 border-b border-zinc-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-semibold mb-4">
            <FileText size={13} />
            <span>Learning Page</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {pageData?.title || title}
          </h1>
        </header>

        {/* Page Content Render */}
        <main className="min-h-[300px] w-full">
          {isBlockNoteContent ? (
            <BlockNoteReader key={pageId} initialContent={pageData.content} />
          ) : typeof pageData?.content === "string" &&
            pageData.content.length > 0 ? (
            <div
              dangerouslySetInnerHTML={{ __html: pageData.content }}
              className="prose prose-zinc max-w-none text-sm sm:text-base space-y-4"
            />
          ) : (
            <div className="p-8 border border-dashed border-zinc-200 rounded-2xl text-center">
              <BookOpen className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
              <p className="text-sm text-zinc-400 font-light">
                No content is published for this page yet.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 z-20 border-t border-zinc-100 bg-white/95 backdrop-blur-md px-6 py-4 lg:px-12">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isCompleted
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80 active:scale-[0.98]"
            }`}
          >
            <CheckCircle2
              size={16}
              className={isCompleted ? "text-emerald-600" : "text-zinc-400"}
            />
            <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
          </button>

          <button
            type="button"
            onClick={handleNextClick}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] cursor-pointer"
          >
            <span>Next Item</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
}
