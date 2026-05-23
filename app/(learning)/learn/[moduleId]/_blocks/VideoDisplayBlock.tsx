"use client";

import React, { useMemo } from "react";

type VideoMetadata = {
  title?: string;
  description?: string;
};

type VideoDisplayBlockProps = {
  content?: string | null; // This holds your YouTube link
  metadata?: string | VideoMetadata | null; // This holds your stringified JSON
};

const VideoDisplayBlock = ({ content, metadata }: VideoDisplayBlockProps) => {
  // 1. Safely parse the database JSON metadata string
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
            title={parsedMetadata.title || "Video Lesson"}
            className="absolute top-0 left-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* METADATA OVERVIEW CONTENT DRAWER */}
        {(parsedMetadata.title || parsedMetadata.description) && (
          <div className="mt-6">
            {parsedMetadata.title && (
              <h3 className="text-lg font-semibold text-zinc-900 tracking-tight">
                {parsedMetadata.title}
              </h3>
            )}

            {parsedMetadata.description && (
              <p className="mt-2 text-sm font-light leading-relaxed text-zinc-500">
                {parsedMetadata.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDisplayBlock;
