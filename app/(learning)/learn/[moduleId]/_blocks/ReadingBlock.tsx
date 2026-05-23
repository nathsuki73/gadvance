"use client";

import React, { useMemo } from "react";
import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
              <BookOpen size={16} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 tracking-tight prose prose-zinc max-w-none">
              {/* RENDER THE TITLE THROUGH THE MARKDOWN PARSER ENGINE AS WELL */}
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
          </div>
        )}

        {/* Core Markdown Content Block */}
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Map raw Markdown elements to beautiful, minimalist styled Tailwind components
              p: ({ children }) => (
                <p className="text-base font-light leading-relaxed text-zinc-600 mb-4 last:mb-0">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-zinc-900">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-zinc-800">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-purple-200 bg-purple-50/30 px-4 py-2 my-4 rounded-r-lg font-light italic text-zinc-700">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1.5 my-4 text-zinc-600 font-light pl-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1.5 my-4 text-zinc-600 font-light pl-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-base leading-relaxed">{children}</li>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
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
