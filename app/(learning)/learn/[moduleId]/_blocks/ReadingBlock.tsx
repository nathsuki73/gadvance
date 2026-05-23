"use client";

import React, { useMemo } from "react";
import { BookOpen } from "lucide-react";

type ReadingBlockMetadata = {
  title?: string;
  image_url?: string;
  image_alt?: string;
};

type ReadingBlockProps = {
  content?: string | null;
  metadata?: string | ReadingBlockMetadata | null;
};

const ReadingBlock = ({ content, metadata }: ReadingBlockProps) => {
  // Safe-parse metadata column block configuration objects
  const parsedMetadata = useMemo<ReadingBlockMetadata>(() => {
    if (!metadata) return {};
    if (typeof metadata !== "string") return metadata;
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  }, [metadata]);

  // Fallback guards if content text values are blank
  if (!content) return null;

  const showHeader = parsedMetadata.title && parsedMetadata.title !== "[BLANK]";

  return (
    <div className="mx-auto w-full max-w-3xl py-6 animate-fade-in">
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:border-zinc-200">
        {/* Optional Header Anchor Layout */}
        {showHeader && (
          <div className="mb-6 flex items-center gap-3 border-b border-zinc-50 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
              <BookOpen size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">
              {parsedMetadata.title}
            </h3>
          </div>
        )}

        {/* Core Paragraph Content Block */}
        <div className="prose prose-zinc max-w-none">
          <p className="text-base font-light leading-relaxed text-zinc-600 whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Optional Illustration Handling Context */}
        {parsedMetadata.image_url && (
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-100">
            <img
              src={parsedMetadata.image_url}
              alt={parsedMetadata.image_alt || "Reading visual aid"}
              className="h-auto w-full max-w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingBlock;
