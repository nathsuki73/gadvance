"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type VideoMetadata = {
  title?: string;
  description?: string;
};

type VideoDisplayBlockProps = {
  content?: string | null; // This holds your YouTube link
  metadata?: string | VideoMetadata | null; // This holds your stringified JSON
};

const VideoDisplayBlock = ({ content, metadata }: VideoDisplayBlockProps) => {
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
    <div className="mx-auto w-full max-w-3xl py-6 animate-fade-in">
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 sm:p-8 shadow-sm">
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
              <h3 className="text-lg font-semibold text-zinc-900 tracking-tight mb-3">
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
